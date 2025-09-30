const Fingerprint = require('../models/Fingerprint');
const { isBotByUserAgent, isBotByIP } = require('../utils/botDetection');

async function verificarVisitante(req) {
  const { fp } = req.body;
  const userAgent = req.headers['user-agent'] || '';
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';

  try {
    // 🚨 Bloqueio bruto por IP e UA (utiliza botDetection centralizado)
    if (isBotByUserAgent(userAgent) || isBotByIP(ip)) {
      return { cloaked: true };
    }

    // Verifica se já está na whitelist
    const fpExistente = await Fingerprint.findOne({ fp });
    if (fpExistente && fpExistente.validado) {
      return { cloaked: false };
    }

    // 🔍 Lógica de validação refinada
    // Antigo: userAgent.includes('Google') -> isso pega até usuários normais
    // Novo: regex que mira bots conhecidos
    const botRegex = /(bot|crawl|spider|facebookexternalhit|facebot|googlebot|bingbot|yahoo! slurp)/i;
    const isBot = botRegex.test(userAgent);

    const usaWebdriver =
      (req.headers['sec-ch-ua'] && req.headers['sec-ch-ua'].includes('Headless')) ||
      req.headers['user-agent']?.toLowerCase().includes('headless') ||
      false;

    if (isBot || usaWebdriver) {
      return { cloaked: true };
    }

    // ✅ Se chegou até aqui, salva/atualiza como validado
    if (fpExistente) {
      fpExistente.validado = true;
      fpExistente.dataValidado = new Date();
      await fpExistente.save();
    } else {
      await Fingerprint.create({
        fp,
        ip,
        userAgent,
        validado: true,
        dataValidado: new Date()
      });
    }

    return { cloaked: false };
  } catch (err) {
    console.error("⚠️ Erro em verificarVisitante:", err.message);
    // Se algo der errado, não barrar lead humano
    return { cloaked: false, fallback: true };
  }
}

module.exports = {
  verificarVisitante
};
