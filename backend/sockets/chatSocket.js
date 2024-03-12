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
          senderName: msgObj.senderName,
          senderId: msgObj.senderId,
          senderTimestamp: msgObj.senderTimestamp,
          group: msgObj.groupId,
        });

        await message.save();
        console.log("Nachricht gespeichert");
        console.log("msgobject,");
        if (msgObj.groupId) {
          // Wenn die Nachricht zu einer Gruppe gehört, senden Sie sie nur an diese Gruppe
          io.emit("chat message", msgObj);
        } else {
          // Öffentliche Nachricht, an alle verbundenen Clients senden
          console.log("messages gets emited");
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
