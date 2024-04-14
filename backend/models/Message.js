// models/Message.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  senderName: { type: String, required: true },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Group",
    required: false,
  }, // Optional, für Gruppennachrichten
  senderTimestamp: { type: Date, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    // enum: ["nicht gesendet", "gesendet", "empfangen"],
  },
  messageId: { type: String, unique: true },
});

module.exports = mongoose.model("Message", messageSchema);
