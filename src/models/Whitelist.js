// 📁 models/Whitelist.js
const mongoose = require('mongoose');

const whitelistSchema = new mongoose.Schema({
  fp: { type: String, required: true },
  slug: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '60d' } // TTL automático
  // Se quiser que expire depois de X tempo:
  // , expiresAt: { type: Date, default: Date.now, expires: '7d' }
});

// Exporta com proteção contra OverwriteModelError
module.exports =
  mongoose.models.Whitelist || mongoose.model('Whitelist', whitelistSchema);
