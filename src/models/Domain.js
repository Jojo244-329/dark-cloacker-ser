const mongoose = require('mongoose');

const domainSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true }, // identificador único pro script
  url: { type: String, required: true },                // domínio principal (landing real)
  baseUrl: { type: String, required: true },            // usado no script.routes.js
  fallbackUrl: { type: String, default: 'https://google.com' }, // pra onde manda se detectar bot/erro
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports =
  mongoose.models.Domain || mongoose.model('Domain', domainSchema);
