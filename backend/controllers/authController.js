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

      // Filtere Gruppen, in denen der Benutzer Mitglied ist
      const groups = await Group.find({ members: user._id });

      // Erstelle Queues für jede Gruppe, in der der Benutzer Mitglied ist
      for (const group of groups) {
        await rabbitMQManager.createQueueForGroup(group._id.toString());
      }

      res.json({ userId: user._id, username: user.username, token }); // Token anstelle von "Success" senden
    } else {
      res.send("Wrong username or password");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};
