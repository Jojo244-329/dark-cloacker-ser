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

// 🛠️ Serve os assets (css, js, fontes) usados nos HTMLs
app.use("/assets", express.static(path.join(__dirname, "public", "black", "assets")));  // ⬅️ ADICIONA ESTA LINHA

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
  const ua = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  // ☠️ BLOQUEIO DE CLONADORES CONHECIDOS
  const badAgents = [
    "HTTrack", "webzip", "saveweb2zip", "Teleport", "Website Copier",
    "Wget", "curl", "python-requests", "httpclient", "Go-http-client"
  ];
  const loweredAgent = ua.toLowerCase();

  if (badAgents.some(bot => loweredAgent.includes(bot.toLowerCase()))) {
    console.log("🚨 Agente proibido detectado:", ua);
    return res.status(403).send("🔥 Acesso negado — clone detectado.");
  }

  // 🪤 HONEYPOT
  if (req.originalUrl === "/bomba-anti-clone") {
    console.log("🪤 Honeypot clicado por IP:", ip);
    return res.redirect("https://google.com");
  }

  try {
    const host = req.hostname;

    const domain = await Domain.findOne({ officialUrl: `https://${host}` });
    if (!domain) return res.redirect("https://google.com");

    const isBotVisit = isBot(ua, ip);

    const fs = require("fs");
    const htmlPath = isBotVisit
      ? path.join(__dirname, "public", "white", "index.html")
      : path.join(__dirname, "public", "black", "index.html");

    let fakeHTML = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Carregando...</title>
  <style>
    body {
      background: black;
      color: lime;
      font-family: monospace;
      text-align: center;
      padding-top: 30vh;
    }
  </style>
</head>
<body>
  <h1>🧠 Analisando comportamento humano...</h1>
  <script>
    const desbloquear = () => {
      fetch('/conteudo-real')
        .then(r => r.text())
        .then(html => {
          document.open(); document.write(html); document.close();
        });
    };
    
    let liberado = false;

    ['mousemove','keydown','click','scroll','touchstart'].forEach(ev => {
      window.addEventListener(ev, () => {
        if (!liberado) {
          liberado = true;
          sessionStorage.setItem('human', 'true');
          desbloquear();
        }
      }, { once: true });
    });

    setTimeout(() => {
      if (!liberado) {
        document.body.innerHTML = '<h1 style="color:red;">❌ BOT DETECTADO</h1>';
        setTimeout(() => location.href = 'https://google.com', 1000);
      }
    }, 3000);
  </script>
</body>
</html>
`;



   

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    

    return res.send(fakeHTML);
  } catch (err) {
    console.error("❌ Erro renderizando:", err.message);
    return res.redirect("https://google.com");
  }
});

app.get("/conteudo-real", async (req, res) => {
  const ua = req.headers["user-agent"] || "";
  const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  const domain = await Domain.findOne({ officialUrl: `https://${req.hostname}` });
  const isBotVisit = isBot(ua, ip);

  const fs = require("fs");
  const htmlPath = isBotVisit
    ? path.join(__dirname, "public", "white", "index.html")
    : path.join(__dirname, "public", "black", "index.html");

  let html = fs.readFileSync(htmlPath, "utf-8");

  // Proteções embutidas aqui
  const extraScripts = `
    <script>
      console.log("✅ Conteúdo liberado por interação humana");
    </script>
    <a href="/bomba-anti-clone" style="display:none" rel="nofollow">trap</a>
  `;

      const antiDebugScript = `
      <script>
        function devtoolsDetector() {
          const s = performance.now(); debugger; const e = performance.now();
          if (e - s > 100) location.href = '${domain.fallbackUrl}';
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
    const honeypotLink = `<a href="/bomba-anti-clone" style="display:none" rel="nofollow">trap</a>`;

    const antiSaveWeb2Zip = `
<script>
(function(){
  const isHuman = () => {
    return new Promise(resolve => {
      let moved = false;
      let key = false;
      let clicked = false;

      const setHuman = () => resolve(true);

      window.addEventListener("mousemove", () => { moved = true; setHuman(); }, { once: true });
      window.addEventListener("keydown", () => { key = true; setHuman(); }, { once: true });
      window.addEventListener("click", () => { clicked = true; setHuman(); }, { once: true });

      setTimeout(() => {
        if (!moved && !key && !clicked) {
          window.location.href = "https://google.com";
        }
      }, 2500); // SaveWeb2Zip nunca move o mouse em 2.5s
    });
  };

  isHuman();
})();
</script>
`;

const trapScript = `
<script>
(function(){
  let humano = false;

  const liberador = () => {
    humano = true;
    sessionStorage.setItem('liberado', 'true');
  };

  ['mousemove','keydown','click','scroll','touchstart'].forEach(ev => {
    window.addEventListener(ev, liberador, { once: true });
  });

  setTimeout(() => {
    const liberado = sessionStorage.getItem('liberado');
    if (!liberado) {
      document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:40vh;">🔥 ACESSO NEGADO — CLONE DETECTADO 🔥</h1>';
      setTimeout(() => window.location.href = "https://google.com", 1500);
    }
  }, 2000); // espera 2s por interação humana

  // Anti devtools
  const d = () => { const t = performance.now(); debugger; return performance.now() - t > 100; };
  setInterval(() => { if (d()) location.href = "https://google.com"; }, 1500);

})();
</script>
<a href="/bomba-anti-clone" style="display:none" rel="nofollow">bot-trap</a>
`;
   html = html.replace("</body>", `${antiDebugScript}${extraScripts}${antiSaveWeb2Zip}${honeypotLink}${trapScript}</body>`);

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");


  return res.send(html);
});



// ☠️ Start
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`☠️ Dark Cloaker rodando na porta ${PORT}`);
});
