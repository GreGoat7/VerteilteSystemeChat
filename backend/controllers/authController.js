const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Group = require("../models/Group");
const jwt = require("jsonwebtoken");
const rabbitMQManager = require("../rabbit/rabbitmq"); // Pfad zu deinem RabbitMQ-Modul

exports.register = async (req, res) => {
  try {
    // Überprüfen, ob ein Benutzer mit demselben Benutzernamen bereits existiert
    const userExists = await User.findOne({ username: req.body.username });

    // Wenn ein Benutzer existiert, senden Sie eine Fehlermeldung zurück
    if (userExists) {
      return res.status(409).json({ message: "Username already exists" });
    }

    // Wenn kein Benutzer existiert, fahren Sie mit der Erstellung fort
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.username, // Stellen Sie sicher, dass Sie hier req.body.username statt req.body.name verwenden
      password: hashedPassword,
    });

    await user.save(); // Speichern Sie den Benutzer in der Datenbank

    // Erstellen eines Tokens für den neuen Benutzer
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Senden der Antwort zurück zum Client
    res.status(201).json({ username: user.username, userId: user._id, token });
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

exports.login = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    console.log(user);
    if (user && (await bcrypt.compare(req.body.password, user.password))) {
      const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

      await rabbitMQManager.createFanoutForGroup(user._id); // Fanout für alle Gruppen des Users erstellen

      res.json({ userId: user._id, username: user.username, token }); // Token anstelle von "Success" senden
    } else {
      res.status(401).send("Wrong username or password");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};

exports.authenticate = (req, res) => {
  res.json({
    message: "Authenticated successfully",
    userId: req.userId,
    username: req.username, // Send the username to the frontend
  });
};

exports.googleOAuthCallback = async (req, res) => {
  // Nutzer ist bereits durch Passport authentifiziert und in req.user verfügbar
  const token = jwt.sign(
    { userId: req.user._id, username: req.user.username },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  );

  await rabbitMQManager.createFanoutForGroup(req.user._id); // Fanout für alle Gruppen des Users erstellen

  // Du könntest hier eine Umleitung zur Hauptseite deiner Anwendung setzen
  res.redirect(
    `http://localhost:5173?token=${token}&username=${req.user.username}&userId=${req.user._id}`
  );
};
