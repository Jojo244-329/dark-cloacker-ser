const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'glitch-do-inferno';

function gerarToken(payload, tempoExpiracao = '7d') {
  return jwt.sign(payload, SECRET, { expiresIn: tempoExpiracao });
}

function validarToken(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
}

function extrairPayload(token) {
  try {
    return jwt.decode(token);
  } catch (err) {
    return null;
  }
}

module.exports = {
  gerarToken,
  validarToken,
  extrairPayload
};
