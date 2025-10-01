const mongoose = require("mongoose");

const DomainSchema = new mongoose.Schema({
  slug: {
    type: String,
    unique: true,
    required: true
  },
  officialUrl: {                // Domínio público (fachada, Ads, URL oficial)
    type: String,
    required: true
  },
  realUrl: {                    // Onde está a landing real (Netlify, HostGator, etc.)
    type: String,
    required: true
  },
  baseUrl: {                    // Dummy para bots
    type: String,
    required: true
  },
  fallbackUrl: {                // Fallback para auditores/devtools
    type: String,
    default: "https://google.com"
  },
  userId: {                     // Dono do domínio
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Domain", DomainSchema);
