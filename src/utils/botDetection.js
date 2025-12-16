// utils/botDetection.js

// Blacklist básica de User-Agents de bots conhecidos
const userAgentBots = [
  'Googlebot', 'facebookexternalhit', 'Bingbot', 'Twitterbot',
  'Slackbot', 'TelegramBot', 'WhatsApp', 'curl', 'python-requests',
  'wget', 'PhantomJS', 'Headless', 'HeadlessChrome'
];

// Lista de IPs suspeitos (exemplo, usar com IP intelligence depois)
const blockedIPs = [
  '66.249.', // Google
  '69.63.',  // Facebook
  '157.55.', // Bing
];

// UA genérico que parece humano mas roda headless → extra layer
const suspiciousPatterns = /(headless|puppeteer|selenium|scrapy|playwright)/i;

function isBotByUserAgent(userAgent = '') {
  const ua = userAgent.toLowerCase();
  if (userAgentBots.some(bot => ua.includes(bot.toLowerCase()))) return true;
  if (suspiciousPatterns.test(ua)) return true;
  return false;
}

function isBotByIP(ip = '') {
  return blockedIPs.some(blocked => ip.startsWith(blocked));
}

// 🔥 Nova função → combina fingerprint com IP e UA
function isBotAdvanced({ userAgent = '', ip = '', fp = '' }) {
  // Se UA ou IP forem suspeitos → já bloqueia
  if (isBotByUserAgent(userAgent) || isBotByIP(ip)) return true;

  // Se fingerprint vazio ou muito curto → suspeito (bots não geram FP consistente)
  if (!fp || fp.length < 10) return true;

  return false;
}

function isBot(userAgent = '', ip = '') {
  const botRegex = /(bot|crawl|spider|facebook|pinterest|slack|monitor|scan|headless|wget|python|go-http)/i;
  return botRegex.test(userAgent);
}

module.exports = {
  isBotByUserAgent,
  isBotByIP,
  isBotAdvanced,
  isBot
};
