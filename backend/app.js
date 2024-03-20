const express = require("express");
const router = require("./controllers/routes"); // Pfad anpassen, falls nötig
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const connectDB = require("./database/database");
const chatSocket = require("./sockets/chatSocket");

// Datenbankverbindung herstellen
connectDB();

const app = express();
const server = http.createServer(app);

// Jetzt, wo `server` definiert ist, kannst du socket.io initialisieren
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // Erlaubt Zugriff vom Frontend-Port
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
  pingInterval: 10000, // Wie oft Heartbeats gesendet werden (in Millisekunden)
  pingTimeout: 5000, // Timeout, nach dem eine Verbindung als getrennt betrachtet wird, wenn kein Heartbeat empfangen wurde (in Millisekunden)
});

// CORS-Middleware für Cross-Origin-Anfragen
app.use(cors());

// Statische Dateien servieren (wenn Sie eine Frontend-Build-Verzeichnis haben)
app.use(express.static("public"));
app.use(express.json());
app.use("/api", router);

// Initialisierung der Socket-Logik
chatSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
