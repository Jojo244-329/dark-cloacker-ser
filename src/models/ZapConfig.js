const mongoose = require("mongoose");

const ZapConfigSchema = new mongoose.Schema({
  numero: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("ZapConfig", ZapConfigSchema);
