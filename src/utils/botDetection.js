

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
