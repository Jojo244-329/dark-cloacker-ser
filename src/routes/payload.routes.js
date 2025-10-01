const express = require("express");
const fetch = require("node-fetch");
const router = express.Router();

// Funções auxiliares
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

// --- FULL CHAOS ---
// Mutar IDs, classes e textos sem dó
function mutateHTMLFull(html) {
  return html
    .replace(/id="([^"]+)"/g, () => `id="${randomString(8)}"`)
    .replace(/class="([^"]+)"/g, () => `class="${randomString(6)}"`)
    .replace(/>([^<]{3,30})</g, (match, p1) => ">" + scrambleText(p1) + "<")
    + `\n<!--hash:${randomString(12)}-->`;
}

// --- SAFE MODE ---
// Ignora elementos críticos como #app, #root, .main-wrapper, .btn
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

async function renderPayload(url, res, mode = "safe") {
  try {
    const response = await fetch(url);
    let html = await response.text();

    const mutated = mode === "full" ? mutateHTMLFull(html) : mutateHTMLSafe(html);

    const encoded = Buffer.from(mutated).toString("base64");

    res.send(`<!DOCTYPE html><html><body><script>
      document.write(atob('${encoded}'))
    </script></body></html>`);
  } catch (err) {
    console.error("Erro ao buscar payload:", err);
    res.status(500).send("Erro ao carregar conteúdo");
  }
}

router.get("/cloak/payload/:slug", async (req, res) => {
  const { slug } = req.params;
  // Exemplo: URL do payload real
  const url = "https://seu-site-real.com";
  return renderPayload(url, res, "safe"); // muda pra "full" se quiser caos total
});

module.exports = router;
