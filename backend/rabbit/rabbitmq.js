const amqp = require("amqplib");
const WebSocket = require("ws");

let amqpConn = null;
let channel = null;

async function connectToRabbitMQ(retryCount = 5) {
  try {
    amqpConn = await amqp.connect(process.env.RABBITMQ_URL, "heartbeat=60");
    channel = await amqpConn.createChannel(); // Channel beim Start einmal erstellen
    console.log("Verbunden mit RabbitMQ");
  } catch (error) {
    console.error("Verbindung zu RabbitMQ fehlgeschlagen:", error);
    if (retryCount > 0) {
      console.log(
        `Versuche erneut in 5 Sekunden... (Verbleibende Versuche: ${retryCount})`
      );
      setTimeout(() => connectToRabbitMQ(retryCount - 1), 5000);
    } else {
      console.error(
        "Maximale Anzahl an Verbindungsversuchen erreicht. Beende den Service."
      );
      process.exit(1);
    }
  }
}

async function start() {
  await connectToRabbitMQ();
  // Weitere Initialisierung...
}

// Queue für eine spezifische Gruppe und eine zugehörige Status-Update-Queue erstellen
async function createQueueForGroup(groupId) {
  // Haupt-Queue für Nachrichten
  const messageQueue = `group_${groupId}`;
  await channel.assertQueue(messageQueue, { durable: true });
  console.log(`Queue für Nachrichten erstellt: ${messageQueue}`);

  // Queue für Status-Updates
  const statusUpdateQueue = `group_${groupId}_status`;
  await channel.assertQueue(statusUpdateQueue, { durable: true });
  console.log(`Queue für Status-Updates erstellt: ${statusUpdateQueue}`);
}

async function sendQueueMessage(queueName, messageContent) {
  try {
    // Prüfe, ob die Queue existiert (dies ist eher symbolisch, da assertQueue sie erstellt, wenn sie nicht existiert)
    await channel.assertQueue(queueName, { durable: true });
    await channel.sendToQueue(
      queueName,
      Buffer.from(JSON.stringify(messageContent)),
      {
        persistent: true,
      }
    );
    console.log(`Nachricht gesendet an Queue ${queueName}:`, messageContent);
  } catch (error) {
    console.error(`Fehler beim Senden an Queue ${queueName}:`, error);
  }
}

const Group = require("../models/Group"); // Stellen Sie sicher, dass Sie das Group-Modell importieren

// Methode zum Abonnieren der Benutzer zu ihren relevanten Queues
async function subscribeUserToQueues(userId, ws) {
  try {
    const userGroups = await Group.find({ members: userId });

    userGroups.forEach(async (group) => {
      const queueName = `group_${group._id.toString()}`;

      // Stellen Sie sicher, dass die Queue existiert
      await channel.assertQueue(queueName, { durable: true });

      // Konsumiere Nachrichten aus der Queue
      channel.consume(
        queueName,
        (msg) => {
          if (msg !== null) {
            console.log(
              `Nachricht empfangen aus Queue ${queueName}: ${msg.content.toString()}`
            );
            // Nachricht an den WebSocket-Client senden
            if (ws.readyState === WebSocket.OPEN) {
              ws.send(msg.content.toString()); // Konvertieren Sie die Nachricht in einen String, falls notwendig
            }
            channel.ack(msg); // Bestätigung der Nachricht
          }
        },
        {
          noAck: false, // Manuelles Acknowledgement, um zu bestätigen, dass die Nachricht korrekt verarbeitet wurde
        }
      );

      console.log(`Abonniert Queue: ${queueName} für userId: ${userId}`);
    });
  } catch (error) {
    console.error(
      `Fehler beim Abonnieren der Queues für userId: ${userId}`,
      error
    );
  }
}

module.exports = {
  start,
  createQueueForGroup,
  sendQueueMessage,
  subscribeUserToQueues,
};

module.exports = {
  start,
  createQueueForGroup,
  sendQueueMessage,
  subscribeUserToQueues,
};
