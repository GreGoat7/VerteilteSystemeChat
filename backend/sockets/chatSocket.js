const WebSocket = require("ws");
const Message = require("../models/Message");
const User = require("../models/User"); // Stellen Sie sicher, dass Sie das User-Modell importieren
const rabbitMQManager = require("../rabbit/rabbitmq"); // Pfad zu deinem RabbitMQ-Modul

const connectedUsers = new Map();

module.exports = function (wss) {
  wss.on("connection", function connection(ws) {
    console.log("Ein neuer Client ist verbunden");
    // hier das console.log für token und iserid oder nicht?

    ws.on("message", async function incoming(data) {
      console.log("Nachricht erhalten:", data);

      const msgObj = JSON.parse(data);

      // Prüfe, ob es sich um eine Initialisierungsnachricht handelt
      if (msgObj.type === "init") {
        console.log(
          `Initialisierungsnachricht von userId: ${msgObj.userId} mit Token: ${msgObj.token}`
        );
        ws.userId = msgObj.userId;
        connectedUsers.set(msgObj.userId, ws);
        await rabbitMQManager.subscribeUserToFanout(msgObj.userId, ws);
      } else {
        // Verarbeite andere Nachrichten wie bisher
        try {
          const message = new Message({
            content: msgObj.content,
            senderName: msgObj.senderName,
            senderId: msgObj.senderId,
            senderTimestamp: msgObj.senderTimestamp,
            groupId: msgObj.groupId,
          });

          await message.save();
          console.log("Nachricht gespeichert");

          rabbitMQManager.publishToFanoutExchange(
            `group_${msgObj.groupId.toString()}_fanout`,
            msgObj
          );

          // Sende Nachricht an alle verbundenen Clients außer dem Sender
          connectedUsers.forEach((clientWs, clientId) => {
            if (
              clientWs.readyState === WebSocket.OPEN &&
              clientId !== msgObj.senderId
            ) {
              clientWs.send(JSON.stringify(msgObj));
            }
          });
        } catch (err) {
          console.error("Fehler beim Speichern der Nachricht:", err);
          S;
        }
      }
    });

    ws.on("close", function close() {
      console.log("Ein Client hat die Verbindung getrennt:", ws.userId);

      connectedUsers.delete(ws.userId);
    });
  });
};

function generateUserId() {
  return Math.random().toString(36).substr(2, 9);
}
