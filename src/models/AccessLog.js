const mongoose = require("mongoose");

const accessLogSchema = new mongoose.Schema({
  fp: String,
  ip: String,
  ua: String,
  slug: String,
  viaToken: Boolean,
  result: String,
  createdAt: { type: Date, default: Date.now, expires: '30d' } // TTL automático
  
});

// Exporta com proteção contra OverwriteModelError
module.exports =
  mongoose.models.AccessLog || mongoose.model("AccessLog", accessLogSchema);
