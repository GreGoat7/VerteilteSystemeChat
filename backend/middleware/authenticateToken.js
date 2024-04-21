const jwt = require("jsonwebtoken");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401); // Kein Token, unautorisiert
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403); // Token ist nicht gültig
    }

    // Extrahieren der User-ID aus dem Payload des Tokens
    req.userId = user.userId;
    req.username = user.username;
    next(); // Weiter zum nächsten Middleware/Route Handler
  });
};

module.exports = authenticateToken;
