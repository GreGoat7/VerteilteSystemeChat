const Group = require("../models/Group");
const Message = require("../models/Message");
const rabbitMQManager = require("../rabbit/rabbitmq");

exports.createGroup = async (req, res) => {
  const groupName = req.body.groupName;
  const userId = req.userId;

  try {
    // Prüfen, ob bereits eine Gruppe mit demselben Namen existiert
    const existingGroup = await Group.findOne({ name: groupName });
    if (existingGroup) {
      return res
        .status(400)
        .json({ message: "Eine Gruppe mit diesem Namen existiert bereits." });
    }

    // Erstellen einer neuen Gruppe mit dem Benutzer als Mitglied und Admin
    const newGroup = new Group({
      name: groupName,
      members: [userId],
      admins: [userId],
      type: "group", // oder 'direct', je nach Logik
    });

    await newGroup.save();

    res
      .status(201)
      .json({ message: "Gruppe erfolgreich erstellt", group: newGroup });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Erstellen der Gruppe" });
  }
};

// Beispiel eines Controllers zur Hinzufügung eines Benutzers zu einer Gruppe
exports.addUserToGroup = async (req, res) => {
  const { groupId, userIdToAdd } = req.body;
  const requestingUserId = req.userId; // Angenommen, `req.user` wird durch die JWT-Middleware gesetzt

  try {
    const group = await Group.findById(groupId);

    // Überprüfen, ob der anfragende Benutzer ein Admin der Gruppe ist
    if (!group.admins.includes(requestingUserId)) {
      return res
        .status(403)
        .json({ message: "Nur Admins können Benutzer hinzufügen." });
    }

    // Hinzufügen des Benutzers zu der Gruppe
    if (!group.members.includes(userIdToAdd)) {
      group.members.push(userIdToAdd);
      await group.save();
      res.status(200).json({ message: "Benutzer erfolgreich hinzugefügt." });
    } else {
      res
        .status(400)
        .json({ message: "Benutzer ist bereits Mitglied der Gruppe." });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Fehler beim Hinzufügen des Benutzers zur Gruppe." });
  }
};

// Controller-Methode zum Abrufen aller Gruppen eines Benutzers
exports.getUserGroups = async (req, res) => {
  try {
    // Die User-ID aus dem Request extrahieren (gesetzt durch die authenticateToken-Middleware)
    const userId = req.userId;

    // Alle Gruppen finden, in denen der Benutzer ein Mitglied ist
    const userGroups = await Group.find({ members: userId });

    // Gruppen an den Client senden
    res.status(200).json(userGroups);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Abrufen der Gruppen" });
  }
};

// In deinem Controller
exports.getGroupMessages = async (req, res) => {
  try {
    const { groupId } = req.params;
    const userId = req.userId;

    // Zuerst die Gruppe finden, um sicherzustellen, dass der Benutzer Zugriff hat
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Gruppe nicht gefunden." });
    }

    // Überprüfen, ob der Benutzer ein Mitglied der Gruppe ist
    if (!group.members.includes(userId)) {
      return res.status(403).json({
        message: "Zugriff verweigert. Benutzer ist kein Mitglied der Gruppe.",
      });
    }

    // Wenn der Benutzer Mitglied der Gruppe ist, holen wir die Nachrichten
    const groupMessages = await Message.find({ groupId: groupId });
    res.status(200).json(groupMessages);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Fehler beim Abrufen der Gruppennachrichten" });
  }
};

exports.updateMessageStatusOnFetch = async (confirmations, ws) => {
  for (const confirmation of confirmations) {
    console.log("updated message", confirmation.content);
    if (confirmation.status !== "empfangen") {
      const updatedMessage = await Message.findByIdAndUpdate(
        confirmation._id,
        { status: "empfangen" },
        { new: true }
      );

      console.log(
        `Status der Nachricht ${confirmation.messageId} auf 'empfangen' aktualisiert.`
      );

      // Prüfen, ob die Nachricht erfolgreich aktualisiert wurde
      if (updatedMessage) {
        console.log(`Nachricht empfangen in DB ${confirmation.messageId}`);

        // Statusupdate an den Statusfanout senden
        const statusUpdate = {
          messageId: confirmation.messageId,
          senderId: confirmation.senderId,
          status: "empfangen",
          receiverId: confirmation.receiverId,
          groupId: confirmation.groupId,
          type: "statusUpdate",
        };

        rabbitMQManager.publishToFanoutExchange(
          `group_${confirmation.groupId.toString()}_fanoutStatus`,
          statusUpdate,
          ws
        );
      } else {
        console.error(
          `Fehler beim Aktualisieren des Nachrichtenstatus für messageId: ${msgObj.messageId}`
        );
      }
    }
  }
};
