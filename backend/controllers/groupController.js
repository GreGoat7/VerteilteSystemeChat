const Group = require("../models/Group");
const Message = require("../models/Message");
const User = require("../models/User");
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
    const groupsWithPartnerNames = await Promise.all(
      userGroups.map(async (group) => {
        if (group.type === "direct") {
          // Find the partner ID by filtering out the current user's ID
          const partnerId = group.members.find(
            (memberId) => memberId.toString() !== userId.toString()
          );

          if (partnerId) {
            // Fetch the partner's user details
            const partnerUser = await User.findById(partnerId);

            if (partnerUser) {
              // Append the partner's name to the group object
              return { ...group.toObject(), name: partnerUser.username };
            }
          }
        }

        return group.toObject(); // Return the group as is if not a direct chat or no partner found
      })
    );
    // Send the modified groups to the client
    res.status(200).json(groupsWithPartnerNames);
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
