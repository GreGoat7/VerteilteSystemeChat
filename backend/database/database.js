const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("MongoDB verbunden...");
  } catch (err) {
    console.error("MongoDB Verbindungsfehler:", err);
    process.exit(1); // Beendet den Prozess mit einem Fehler
  }
};

// Funktion, um den Status der abgerufenen Nachrichten zu aktualisieren
async function updateMessageStatusOnFetch(messages, userId, groupId, ws) {
  messages.forEach(async (message) => {
    if (message.status !== "empfangen") {
      const updatedMessage = await Message.findByIdAndUpdate(
        message._id,
        { status: "empfangen" },
        { new: true }
      );

      console.log(
        `Status der Nachricht ${message._id} auf 'empfangen' aktualisiert.`
      );

      // Publiziere die Statusaktualisierung
      const statusUpdate = {
        type: "statusUpdate",
        messageId: message._id.toString(),
        senderId: message.senderId,
        receiverId: userId,
        groupId: groupId,
        status: "empfangen",
      };

      rabbitMQManager.publishToFanoutExchange(
        `group_${groupId}_fanoutStatus`,
        statusUpdate,
        ws
      );
    }
  });
}

module.exports = { connectDB, updateMessageStatusOnFetch };
