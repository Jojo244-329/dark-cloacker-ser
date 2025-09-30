require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');



const app = express();

// 🔒 Middlewares globais
app.use(cors());
app.use(helmet());
app.use(express.json());

// 📂 Importa rotas
const authRoutes = require('./routes/auth.routes');
const cloakRoutes = require('./routes/cloak.routes');
const scriptRoutes = require('./routes/script.routes');
const payloadRoutes = require('./routes/payload.routes');

// 🚏 Usa rotas
app.use('/api/auth', authRoutes);
app.use('/api/cloak', cloakRoutes);
app.use('/cloak/script', scriptRoutes);
app.use('/api/payload', payloadRoutes);

// ⚡ Conexão com MongoDB protegida
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // opções extras não são mais obrigatórias nas últimas versões
      // useNewUrlParser: true,
      // useUnifiedTopology: true
    });
    console.log('🔥 MongoDB conectado com sucesso');
  } catch (err) {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    process.exit(1); // encerra app se não conectar
  }
})();

// 🚀 Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`☠️ Dark Cloaker rodando na porta ${PORT}`);
});
