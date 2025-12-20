const mongoose = require('mongoose');

const PixConfigSchema = new mongoose.Schema({
  pixKey: {
    type: String,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PixConfig', PixConfigSchema);
