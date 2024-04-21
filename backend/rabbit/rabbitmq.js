const amqp = require("amqplib");
const WebSocket = require("ws");

const Group = require("../models/Group"); // Stellen Sie sicher, dass Sie das Group-Modell importieren
const Message = require("../models/Message"); // Stellen Sie sicher, dass Sie das Message-Modell importieren

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
    const statusUpdateQueue = `group_${group._id.toString()}_fanoutStatus`;
    await channel.assertExchange(statusUpdateQueue, "fanout", {
      durable: true,
    });
    console.log(`Queue für Status-Updates erstellt: ${statusUpdateQueue}`);
  });
}

async function publishToFanoutExchange(exchangeName, messageContent, ws) {
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
    // speichere das update in der datenbank mit dem status gesendet und der uuid als identifier
    const updatedMessage = await Message.findOneAndUpdate(
      { messageId: messageContent.messageId },
      { status: "gesendet" },
      { new: true }
    );

    //console.log(`Nachrichtenstatus aktualisiert: ${updatedMessage}`);
    const statusUpdateMsg = JSON.stringify({
      type: "statusUpdate",
      messageId: messageContent.messageId, // Annahme: _id ist die eindeutige ID der Nachricht
      status: "gesendet",
      // Fügen Sie hier zusätzliche Felder hinzu, falls erforderlich
    });
    // Bestätigungsnachricht an den Client senden, dass die Nachricht als "gesendet" markiert wurde
    if (ws.readyState === WebSocket.OPEN) {
      // console.log("status-update gesendet...", updatedMessage.status);
      console.log("status-update gesendet...", statusUpdateMsg);
      ws.send(statusUpdateMsg);
    }
  } catch (error) {
    console.error(
      `Fehler beim Veröffentlichen an Fanout-Exchange ${exchangeName}:`,
      error
    );
  }
}

async function subscribeToMessageExchange(exchangeName, queueName, ws) {
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, exchangeName, "");
  channel.consume(
    queueName,
    (msg) => {
      if (msg !== null) {
        console.log(
          `Nachricht empfangen aus Queue ${queueName}: ${msg.content.toString()}`
        );
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(msg.content.toString());
        }
        channel.ack(msg);
      }
    },
    { noAck: false }
  );
  console.log(`Abonniert Exchange: ${exchangeName} für Queue: ${queueName}`);
}

async function subscribeToStatusExchange(exchangeName, queueName, ws) {
  await channel.assertQueue(queueName, { durable: true });
  await channel.bindQueue(queueName, exchangeName, "");
  channel.consume(
    queueName,
    (msg) => {
      if (msg !== null) {
        console.log(
          `Status-Update empfangen aus Queue ${queueName}: ${msg.content.toString()}`
        );
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(msg.content.toString());
        }
        channel.ack(msg);
      }
    },
    { noAck: false }
  );
  console.log(`Abonniert Exchange: ${exchangeName} für Queue: ${queueName}`);
}

// Methode zum Abonnieren der Benutzer zu ihren relevanten Fanout Exchanges
async function subscribeUserToFanout(userId, ws) {
  try {
    const userGroups = await Group.find({ members: userId });
    const userQueueNames = [];

    userGroups.forEach(async (group) => {
      // Abonnieren des Nachrichten-Fanout-Exchanges
      const messageExchangeName = `group_${group._id.toString()}_fanout`;
      const statusExchangeName = `group_${group._id.toString()}_fanoutStatus`;

      const userQueueName = `queue_for_${new Date().getTime()}_${userId.toString()}_in_${group._id.toString()}`; // Erzeugt eine einzigartige Queue für diese WebSocket-Verbindung

      userQueueNames.push(userQueueName);

      // Nachrichten-Queue
      await subscribeToMessageExchange(messageExchangeName, userQueueName, ws);

      // Status-Queue
      await subscribeToStatusExchange(
        statusExchangeName,
        `${userQueueName}_status`,
        ws
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
  publishToFanoutExchange,
  subscribeUserToFanout,
  createFanoutForGroup,
};
