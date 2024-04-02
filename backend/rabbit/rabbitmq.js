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
async function createFanoutForGroup(userId) {
  // Haupt-Queue für Nachrichten
  const userGroups = await Group.find({ members: userId });
  userGroups.forEach(async (group) => {
    const messageQueue = `group_${group._id.toString()}_fanout`;
    await channel.assertExchange(messageQueue, "fanout", { durable: true });
    console.log(`Fanout für Nachrichten erstellt: ${messageQueue}`);

    // Queue für Status-Updates
    const statusUpdateQueue = `group_${group._id.toString}_fanoutStatus`;
    await channel.assertExchange(statusUpdateQueue, "fanout", {
      durable: true,
    });
    console.log(`Queue für Status-Updates erstellt: ${statusUpdateQueue}`);
  });
}

async function publishToFanoutExchange(exchangeName, messageContent) {
  try {
    // Stelle sicher, dass der Exchange existiert
    await channel.assertExchange(exchangeName, "fanout", { durable: true });

    // Veröffentliche die Nachricht an den Fanout-Exchange
    channel.publish(
      exchangeName, // Name des Exchanges
      "", // Routing-Key (wird bei Fanout ignoriert)
      Buffer.from(JSON.stringify(messageContent)), // Die Nachricht
      {
        persistent: true, // Nachrichten als persistent markieren
      }
    );
    console.log(
      `Nachricht veröffentlicht an Fanout-Exchange ${exchangeName}:`,
      messageContent
    );
  } catch (error) {
    console.error(
      `Fehler beim Veröffentlichen an Fanout-Exchange ${exchangeName}:`,
      error
    );
  }
}

const Group = require("../models/Group"); // Stellen Sie sicher, dass Sie das Group-Modell importieren

// Methode zum Abonnieren der Benutzer zu ihren relevanten Fanout Exchanges
async function subscribeUserToFanout(userId, ws) {
  try {
    const userGroups = await Group.find({ members: userId });
    const userQueueNames = [];

    userGroups.forEach(async (group) => {
      const exchangeName = `group_${group._id.toString()}_fanout`;
      const userQueueName = `queue_for_${new Date().getTime()}_${userId.toString()}_in_${group._id.toString()}`; // Erzeugt eine einzigartige Queue für diese WebSocket-Verbindung

      userQueueNames.push(userQueueName);

      // Stellen Sie sicher, dass die Queue existiert und binden sie an den Exchange
      await channel.assertQueue(userQueueName, { durable: true });
      await channel.bindQueue(userQueueName, exchangeName, "");

      // Konsumiere Nachrichten aus der Queue
      channel.consume(
        userQueueName,
        (msg) => {
          if (msg !== null) {
            console.log(
              `Nachricht empfangen aus Queue ${userQueueName}: ${msg.content.toString()}`
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

      console.log(
        `Abonniert Exchange: ${exchangeName} für Queue: ${userQueueName} und userId: ${userId}`
      );
    });

    // Listener für das Schließen der WebSocket-Verbindung
    ws.on("close", async () => {
      console.log(`WebSocket-Verbindung geschlossen für User ${userId}`);
      userGroups.forEach;
      for (const queueName of userQueueNames) {
        userGroups.forEach(async (group) => {
          const exchangeName = `group_${group._id.toString()}_fanout`;
          await channel.unbindQueue(queueName, exchangeName, "");
          console.log(`Queue ${queueName} entbunden.`);
        });
        await channel.deleteQueue(queueName);
        console.log(`Queue ${queueName} gelöscht und entbunden.`);
      }
    });
  } catch (error) {
    console.error(
      `Fehler beim Abonnieren der Fanout Exchanges für userId: ${userId}`,
      error
    );
  }
}

module.exports = {
  start,
  createFanoutForGroup,
  publishToFanoutExchange,
  subscribeUserToFanout,
};
