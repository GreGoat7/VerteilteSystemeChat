const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema({
  name: { type: String, required: false, unique: true, sparse: true }, // `required` ist jetzt false und `unique` ist true mit `sparse`, um Eindeutigkeit nur auf vorhandene Werte anzuwenden
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  type: { type: String, required: true, enum: ["direct", "group"] }, // Fügt ein `type` Feld hinzu, um zwischen Direkt- und Gruppenchats zu unterscheiden
});

module.exports = mongoose.model("Group", groupSchema);
