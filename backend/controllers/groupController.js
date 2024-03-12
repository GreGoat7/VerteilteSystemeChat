const Group = require("../models/Group");

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
