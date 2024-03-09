const bcrypt = require("bcryptjs");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({
      username: req.body.name,
      password: hashedPassword,
    });
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    user.save();
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
      res.json({ userId: user._id, username: user.username, token }); // Token anstelle von "Success" senden
    } else {
      res.send("Wrong username or password");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send();
  }
};
