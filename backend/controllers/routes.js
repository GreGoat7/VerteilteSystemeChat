const express = require("express");
const passport = require("../OAuth/passport");
const authController = require("./authController");
const groupController = require("./groupController");
const userController = require("./userController");
const directChatController = require("./directChatController");
// Middleware
const authenticateToken = require("../middleware/authenticateToken");
const isGroupAdmin = require("../middleware/isGroupAdmin");

const router = express.Router();

// Auth-Routen
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/authenticate", authenticateToken, authController.authenticate);

// Google OAuth Routen
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
    session: false,
  }),
  authController.googleOAuthCallback
);

// Gruppenrouten
router.post("/createGroup", authenticateToken, groupController.createGroup);

router.post(
  "/addGroupMember",
  authenticateToken,
  isGroupAdmin,
  groupController.addUserToGroup
);

router.get("/getGroups", authenticateToken, groupController.getUserGroups);

router.get(
  "/groups/:groupId/messages",
  authenticateToken,
  groupController.getGroupMessages
);

// User-Routen
router.get("/getUsers", authenticateToken, userController.getAllUsers);

// Direct-Routen
router.post(
  "/directChat",
  authenticateToken,
  directChatController.createDirectChat
);

//
module.exports = router;
