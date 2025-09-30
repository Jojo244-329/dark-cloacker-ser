const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  slug: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Exporta com proteção contra OverwriteModelError
module.exports =
  mongoose.models.Token || mongoose.model("Token", tokenSchema);
