const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const bcrypt = require("bcryptjs");

// Import der Datenbankverbindung
const connectDB = require("./database/database");

// Import des Socket-Handlers
const chatSocket = require("./sockets/chatSocket");

// Datenbankverbindung herstellen
connectDB();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Erlaubt Zugriff vom Frontend-Port
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

// CORS-Middleware für Cross-Origin-Anfragen
app.use(cors());

// Statische Dateien servieren (wenn Sie eine Frontend-Build-Verzeichnis haben)
app.use(express.static("public"));
app.use(express.json());
const users = [];

const User = require("./models/User");

app.get("/users", (req, res) => {
  res.json(users);
});

const authController = require("./controllers/authController");

// Middleware- und Socket-Initialisierung...
app.post("/register", authController.register);
app.post("/login", authController.login);

// Initialisierung der Socket-Logik
chatSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server läuft auf Port ${PORT}`));
