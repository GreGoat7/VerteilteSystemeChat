const WebSocket = require("ws");
const Message = require("../models/Message");
const User = require("../models/User"); // Stellen Sie sicher, dass Sie das User-Modell importieren
const rabbitMQManager = require("../rabbit/rabbitmq"); // Pfad zu deinem RabbitMQ-Modul

const connectedUsers = new Map();

module.exports = function (wss) {
  wss.on("connection", function connection(ws) {
    console.log("Ein neuer Client ist verbunden");
    // hier das console.log für token und iserid oder nicht?
    const userId = generateUserId(); // Funktion, um eine eindeutige ID für jeden verbundenen Client zu generieren
    connectedUsers.set(userId, ws);

    ws.on("message", async function incoming(data) {
      console.log("Nachricht erhalten:", data);

      const msgObj = JSON.parse(data);

      // Prüfe, ob es sich um eine Initialisierungsnachricht handelt
      if (msgObj.type === "init") {
        console.log(
          `Initialisierungsnachricht von userId: ${msgObj.userId} mit Token: ${msgObj.token}`
        );
        await rabbitMQManager.subscribeUserToQueues(msgObj.userId, ws);
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

          rabbitMQManager.sendQueueMessage(`group_${msgObj.groupId}`, msgObj);

          // Sende Nachricht an alle verbundenen Clients
          connectedUsers.forEach((clientWs, clientId) => {
            if (clientWs.readyState === WebSocket.OPEN) {
              clientWs.send(JSON.stringify(msgObj));
            }
          });
        } catch (err) {
          console.error("Fehler beim Speichern der Nachricht:", err);
        }
      }
    });

    ws.on("close", function close() {
      console.log("Ein Client hat die Verbindung getrennt");
      connectedUsers.delete(userId);
    });
  });
};

function generateUserId() {
  return Math.random().toString(36).substr(2, 9);
}
