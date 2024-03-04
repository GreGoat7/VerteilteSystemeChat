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

module.exports = connectDB;
