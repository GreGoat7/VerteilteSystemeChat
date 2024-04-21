function sanitizeInputs(req, res, next) {
  console.log("sanitizes get called");
  for (let key in req.body) {
    if (typeof req.body[key] === "string") {
      req.body[key] = req.sanitize(req.body[key]);
    }
  }
  next(); // Weiter zum nächsten Middleware/Route Handler
}
module.exports = sanitizeInputs;
