const express = require("express");
const authController = require("./authController");
const groupController = require("./groupController");

// Middleware
const authenticateToken = require("../middleware/authenticateToken");
const isGroupAdmin = require("../middleware/isGroupAdmin");

const router = express.Router();

// Auth-Routen
router.post("/register", authController.register);
router.post("/login", authController.login);

// Gruppenrouten
router.post("/createGroup", authenticateToken, groupController.createGroup);
router.post(
  "/addGroupMember",
  authenticateToken,
  isGroupAdmin,
  groupController.addUserToGroup
);

module.exports = router;
