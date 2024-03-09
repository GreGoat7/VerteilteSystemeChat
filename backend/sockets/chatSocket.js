const Message = require("../models/Message");
const User = require("../models/User"); // Stellen Sie sicher, dass Sie das User-Modell importieren

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Ein neuer Client ist verbunden");

    socket.on("chat message", async (msgObj) => {
      console.log("Nachricht erhalten:", msgObj);

      try {
        // Annahme: msgObj enthält { message, senderId, groupId(optional) }
        // Sie müssen die userID und optional die groupID an den Client übermitteln
        const message = new Message({
          content: msgObj.content,
          username: msgObj.username,
          sender: msgObj.sender, // Verwenden Sie die UserID, nicht den Benutzernamen
          group: msgObj.groupId, // Optional, kann undefined sein für öffentliche Nachrichten
        });

        await message.save();
        console.log("Nachricht gespeichert");

        if (msgObj.groupId) {
          // Wenn die Nachricht zu einer Gruppe gehört, senden Sie sie nur an diese Gruppe
          socket.to(msgObj.groupId).emit("chat message", msgObj);
        } else {
          // Öffentliche Nachricht, an alle verbundenen Clients senden
          io.emit("chat message", msgObj);
        }
      } catch (err) {
        console.error("Fehler beim Speichern der Nachricht:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Ein Client hat die Verbindung getrennt");
    });
  });
};
