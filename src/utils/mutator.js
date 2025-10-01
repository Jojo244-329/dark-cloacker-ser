const crypto = require("crypto");

// Substituições para ofuscação de texto (visual iguais, mas diferentes no código)
const textMap = {
  "a": ["a", "а"], // a latino, a cirílico
  "e": ["e", "е"],
  "i": ["i", "і"],
  "o": ["o", "о"],
  "c": ["c", "с"],
  "p": ["p", "р"],
  "x": ["x", "х"]
};

// Gera string aleatória curta
function randomString(length = 6) {
  return crypto.randomBytes(length).toString("hex").slice(0, length);
}

// Ofusca texto substituindo caracteres
function obfuscateText(text) {
  return text.split("").map(ch => {
    if (textMap[ch.toLowerCase()]) {
      const variants = textMap[ch.toLowerCase()];
      const pick = variants[Math.floor(Math.random() * variants.length)];
      return ch === ch.toUpperCase() ? pick.toUpperCase() : pick;
    }
    return ch;
  }).join("");
}

// Mutação principal
function mutateHTMLSafe(html) {
  let mutated = html;

  // 🔥 Mutar IDs
  mutated = mutated.replace(/id="([^"]+)"/g, (match, p1) => {
    return `id="${p1}_${randomString(4)}"`;
  });

  // 🔥 Mutar Classes
  mutated = mutated.replace(/class="([^"]+)"/g, (match, p1) => {
    const mutatedClasses = p1
      .split(/\s+/)
      .map(cls => `${cls}_${randomString(3)}`)
      .join(" ");
    return `class="${mutatedClasses}"`;
  });

  // 🔥 Ofuscar textos simples (<h1>, <h2>, <p>, <span>, <a>)
  mutated = mutated.replace(
    />([^<>]{3,50})</g,
    (match, p1) => `>${obfuscateText(p1)}<`
  );

  // 🔥 Injetar hash invisível no final do body
  const hash = crypto.randomBytes(8).toString("hex");
  mutated = mutated.replace(
    "</body>",
    `<div style="display:none" data-hash="${hash}"></div></body>`
  );

  return mutated;
}

module.exports = { mutateHTMLSafe };
