const mongoose = require('mongoose');

const fingerprintSchema = new mongoose.Schema({
  fp: { type: String, required: true, unique: true },
  ip: { type: String },
  userAgent: { type: String },
  validado: { type: Boolean, default: false },
  dataValidado: { type: Date },
  criadoEm: { type: Date, default: Date.now, expires: '30d' } 
});

// Exporta com proteção contra OverwriteModelError
module.exports =
  mongoose.models.Fingerprint || mongoose.model('Fingerprint', fingerprintSchema);
