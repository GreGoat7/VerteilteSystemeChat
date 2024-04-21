const WebSocket = require("ws");
const Message = require("../models/Message");
const User = require("../models/User"); // Stellen Sie sicher, dass Sie das User-Modell importieren
const rabbitMQManager = require("../rabbit/rabbitmq"); // Pfad zu deinem RabbitMQ-Modul
const {
  updateMessageStatusOnFetch,
} = require("../controllers/groupController");
const { v4: uuidv4 } = require("uuid");

const connectedUsers = new Map();

module.exports = function (wss) {
  wss.on("connection", function connection(ws) {
    console.log("Ein neuer Client ist verbunden");
    // hier das console.log für token und iserid oder nicht?
    const heartbeat = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping(); // Sendet einen Ping vom Server zum Client
      }
    }, 10000); // 30 Sekunden

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
      } // Handhabung von Bestätigungsnachrichten
      else if (msgObj.type === "confirmation") {
        console.log(
          `Bestätigungsnachricht empfangen für messageId: ${msgObj.messageId}`
        );

        console.log(
          `Aktualisiere Nachricht mit messageId: ${msgObj.messageId} auf status: "empfangen"`
        );

        const updatedMessage = await Message.findOneAndUpdate(
          { messageId: msgObj.messageId },
          { status: "empfangen" },
          { new: true }
        );

        if (updatedMessage) {
          console.log(
            "Nachricht erfolgreich aktualisiert in DB:",
            updatedMessage
          );
        } else {
          console.log("Keine Nachricht mit dieser messageId gefunden.");
        }

        // Prüfen, ob die Nachricht erfolgreich aktualisiert wurde
        if (updatedMessage) {
          console.log(`Nachricht empfangen in DB ${msgObj.messageId}`);

          // Statusupdate an den Statusfanout senden
          const statusUpdate = {
            messageId: msgObj.messageId,
            senderId: msgObj.senderId,
            status: "empfangen",
            receiverId: msgObj.receiverId,
            groupId: msgObj.groupId,
            type: "statusUpdate",
          };

          rabbitMQManager.publishToFanoutExchange(
            `group_${msgObj.groupId.toString()}_fanoutStatus`,
            statusUpdate,
            ws
          );
        } else {
          console.error(
            `Fehler beim Aktualisieren des Nachrichtenstatus für messageId: ${msgObj.messageId}`
          );
        }
      } else if (msgObj.type === "fetchConfirmations") {
        console.log("backend fetchConfirmations empfangen:");
        console.log(
          `Bestätigungen empfangen für Nachrichten: ${msgObj.confirmations
            .map((c) => c.messageId)
            .join(", ")}`
        );
        // Aufrufen der updateMessageStatusOnFetch Methode mit den passenden Nachrichten
        await updateMessageStatusOnFetch(msgObj.confirmations, ws);
      } else {
        try {
          // Beim Senden einer Nachricht
          console.log("nachricht empfangen: ", msgObj);
          const message = new Message({
            content: msgObj.content,
            senderName: msgObj.senderName,
            senderId: msgObj.senderId,
            senderTimestamp: msgObj.senderTimestamp,
            groupId: msgObj.groupId,
            status: "nicht gesendet",
            messageId: msgObj.messageId,
          });

          await message.save();
          console.log("Nachricht gespeichert");

          const messageContent = {
            content: msgObj.content,
            senderName: msgObj.senderName,
            senderId: msgObj.senderId,
            senderTimestamp: msgObj.senderTimestamp,
            groupId: msgObj.groupId,
            status: "gesendet",
            messageId: msgObj.messageId,
          };

          rabbitMQManager.publishToFanoutExchange(
            `group_${msgObj.groupId.toString()}_fanout`,
            messageContent,
            ws
          );
        } catch (err) {
          console.error("Fehler beim Speichern der Nachricht:", err);
          S;
        }
      }
    });

    ws.on("close", function close() {
      console.log("Ein Client hat die Verbindung getrennt:", ws.userId);
      clearInterval(heartbeat);
      connectedUsers.delete(ws.userId);
    });
  });
};
