// directChatController.js
const Group = require("../models/Group");

exports.createDirectChat = async (req, res) => {
  const userId = req.userId;
  const partnerId = req.body.partnerId;

  try {
    // Überprüfen, ob bereits ein DirectChat zwischen diesen zwei Nutzern existiert
    const existingDirectChat = await Group.findOne({
      type: "direct",
      members: { $all: [userId, partnerId] },
    });

    if (existingDirectChat) {
      return res.status(400).json({
        message: "Ein DirectChat besteht bereits zwischen diesen Nutzern.",
      });
    }

    // Erstellen eines neuen DirectChats
    const directChat = new Group({
      members: [userId, partnerId],
      admins: [],
      type: "direct",
    });

    await directChat.save();

    res
      .status(201)
      .json({ message: "DirectChat erfolgreich erstellt", directChat });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Fehler beim Erstellen des DirectChats" });
  }
};
