require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const redis = require('redis'); // <--- Novo import

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
const domainRoutes = require("./routes/domain.routes");

// 🚏 Usa rotas
app.use('/api/auth', authRoutes);
app.use('/api/cloak', cloakRoutes);
app.use('/api/domain', domainRoutes);
app.use('/cloak/script', scriptRoutes);
app.use('/api/payload', payloadRoutes);

// 🧠 Conecta Redis (opcional)
if (process.env.REDIS_URL) {
  const redisClient = redis.createClient({
    url: process.env.REDIS_URL,
  });

  redisClient.on('error', (err) => {
    console.error('❌ Erro ao conectar no Redis:', err.message);
  });

  redisClient.connect()
    .then(() => {
      console.log('🔥 Redis conectado com sucesso');
      // Se quiser exportar pra usar em outros arquivos:
      // module.exports.redisClient = redisClient;
    })
    .catch((err) => {
      console.error('❌ Erro ao conectar no Redis:', err.message);
    });
} else {
  console.warn("⚠️ Variável REDIS_URL não definida. Pulando Redis.");
}

// ⚡ Conexão com MongoDB protegida
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('🔥 MongoDB conectado com sucesso');
  } catch (err) {
    console.error('❌ Erro ao conectar no MongoDB:', err.message);
    process.exit(1);
  }
})();

// 🚀 Start server
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`☠️ Dark Cloaker rodando na porta ${PORT}`);
});
