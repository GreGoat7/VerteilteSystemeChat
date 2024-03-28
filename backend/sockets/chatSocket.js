const WebSocket = require("ws");
const Message = require("../models/Message");
const User = require("../models/User"); // Stellen Sie sicher, dass Sie das User-Modell importieren

const connectedUsers = new Map();

async function sendMessageToQueue(msgObj) {
  const channel = await amqpConn.createChannel();
  const queueName = `group_${msgObj.groupId}`;

  await channel.assertQueue(queueName, { durable: true });
  channel.sendToQueue(queueName, Buffer.from(JSON.stringify(msgObj)));
  console.log(`Nachricht an Queue ${queueName} gesendet`);
}

module.exports = function (wss) {
  wss.on("connection", function connection(ws) {
    console.log("Ein neuer Client ist verbunden");

    const userId = generateUserId(); // Funktion, um eine eindeutige ID für jeden verbundenen Client zu generieren
    connectedUsers.set(userId, ws);

    ws.on("message", async function incoming(data) {
      console.log("Nachricht erhalten:", data);

      const msgObj = JSON.parse(data);

      try {
        // Annahme: msgObj enthält { message, senderId, groupId(optional) }
        const message = new Message({
          content: msgObj.content,
          senderName: msgObj.senderName,
          senderId: msgObj.senderId,
          senderTimestamp: msgObj.senderTimestamp,
          groupId: msgObj.groupId,
        });

        await message.save();
        console.log("Nachricht gespeichert");

        // Sende Nachricht an alle verbundenen Clients
        connectedUsers.forEach((clientWs, clientId) => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify(msgObj));
          }
        });
      } catch (err) {
        console.error("Fehler beim Speichern der Nachricht:", err);
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
