const express = require("express");
const router = require("./controllers/routes"); // Pfad anpassen, falls nötig
const http = require("http");
const websocket = require("ws");
const cors = require("cors");
const connectDB = require("./database/database");
const passport = require("./OAuth/passport");
const chatSocket = require("./sockets/chatSocket");
const rabbitMQManager = require("./rabbit/rabbitmq"); // Pfad zu deinem RabbitMQ-Modul

// Datenbankverbindung herstellen
connectDB();

const app = express();
const server = http.createServer(app);

// CORS-Middleware für Cross-Origin-Anfragen
app.use(cors());

// Statische Dateien servieren (wenn Sie eine Frontend-Build-Verzeichnis haben)
app.use(express.static("public"));
app.use(express.json());
app.use(passport.initialize()); // Passport initialisieren
app.use("/api", router);

// Initialisiere RabbitMQ und WebSocket, sobald die Datenbankverbindung hergestellt ist
async function initialize() {
  try {
    await rabbitMQManager.start();
    console.log("RabbitMQ-Manager gestartet");

    // Hier könntest du initial Queues erstellen basierend auf vorhandenen Gruppen in deiner DB
    // Beispiel: await initializeQueues();

    // WebSocket-Server starten
    const wss = new websocket.WebSocketServer({ port: 8080 });
    chatSocket(wss);

    // Server starten
    const PORT = process.env.PORT || 4000;
    server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
  } catch (error) {
    console.error("Fehler beim Starten der Services:", error);
  }
}

initialize();
