const amqp = require("amqplib");

let amqpConn = null;

async function connectToRabbitMQ(retryCount = 5) {
  try {
    amqpConn = await amqp.connect(process.env.RABBITMQ_URL, "heartbeat=60");
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

// Queue für eine spezifische Gruppe erstellen
async function createQueueForGroup(groupId) {
  const channel = await amqpConn.createChannel();
  const queue = `group_${groupId}`;
  await channel.assertQueue(queue, { durable: true });
  console.log(`Queue erstellt: ${queue}`);
  // Du könntest hier auch direkt mit dem Consuming beginnen oder weitere Einstellungen vornehmen
}

module.exports = { start, createQueueForGroup };
