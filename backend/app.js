const express = require("express");
const http = require("http");
const socketIo = require("socket.io");

// Express-App und HTTP-Server erstellen
const app = express();
const server = http.createServer(app);

const cors = require("cors");
app.use(
  cors({
    origin: "*", // Erlaubt Zugriff vom Frontend-Port
  })
);

// socket.io mit dem HTTP-Server initialisieren
const io = socketIo(server, {
  cors: {
    origin: "*", // oder "*" für alle Origins
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// Port festlegen, auf dem der Server lauscht
const PORT = process.env.PORT || 4000;

// Middleware, um statische Dateien zu bedienen (optional, falls benötigt)
app.use(express.static("public"));

// socket.io Verbindungs-Event
io.on("connection", (socket) => {
  console.log("Ein neuer Client ist verbunden");

  // Event-Listener für benutzerdefinierte Events (z.B. 'chat message')
  socket.on("chat message", (msg) => {
    console.log("Nachricht erhalten: " + msg);

    // Nachricht an alle verbundenen Clients senden
    io.emit("chat message", msg);
  });

  // Verbindungsabbruch-Event
  socket.on("disconnect", () => {
    console.log("Ein Client hat die Verbindung getrennt");
  });
});

// Server starten
server.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
