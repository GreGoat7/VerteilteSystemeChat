const Group = require("../models/Group");

const isGroupAdmin = async (req, res, next) => {
  const { groupId } = req.body; // Annahme, dass groupId im Request-Body übermittelt wird
  const userId = req.userId; // Benutzer-ID aus dem vorherigen Authentifizierungs-Middleware

  try {
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ message: "Gruppe nicht gefunden." });
    }

    // Überprüfen, ob der angemeldete Benutzer ein Admin der Gruppe ist
    if (group.admins.includes(userId)) {
      next(); // Der Benutzer ist Admin, fahre mit dem nächsten Middleware/Route Handler fort
    } else {
      return res
        .status(403)
        .json({ message: "Nur Gruppenadmins dürfen diese Aktion ausführen." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Fehler bei der Überprüfung der Admin-Berechtigungen.",
    });
  }
};

module.exports = isGroupAdmin;
