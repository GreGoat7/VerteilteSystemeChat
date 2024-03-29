const express = require("express");
const router = require("./controllers/routes"); // Pfad anpassen, falls nötig
const http = require("http");
const websocket = require("ws");
const cors = require("cors");
const connectDB = require("./database/database");
const chatSocket = require("./sockets/chatSocket");

// Datenbankverbindung herstellen
connectDB();

const app = express();
const server = http.createServer(app);

// CORS-Middleware für Cross-Origin-Anfragen
app.use(cors());

// Statische Dateien servieren (wenn Sie eine Frontend-Build-Verzeichnis haben)
app.use(express.static("public"));
app.use(express.json());
app.use("/api", router);

// Erstelle den WebSocket-Server auf demselben Port wie den HTTP-Server

const wss = new websocket.WebSocketServer({ port: 8080 });

// WebSocket-Logik ausgelagert in chatSocket
chatSocket(wss);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
