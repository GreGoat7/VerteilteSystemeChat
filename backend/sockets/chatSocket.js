const Message = require("../models/Message");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("Ein neuer Client ist verbunden");

    socket.on("chat message", async (msg) => {
      // async hinzufügen
      console.log("Nachricht erhalten: " + msg);

      try {
        // Erstellen und Speichern der Nachricht in der MongoDB mit await
        const message = new Message({
          username: "test",
          message: msg,
        });

        await message.save();
        console.log("Nachricht gespeichert");
        // Nachricht an alle verbundenen Clients senden, einschließlich des Absenders
        io.emit("chat message", msg);
      } catch (err) {
        console.error("Fehler beim Speichern der Nachricht:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("Ein Client hat die Verbindung getrennt");
    });
  });
};
