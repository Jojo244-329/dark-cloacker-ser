const User = require('../models/User');
const { gerarToken } = require('../utils/jwt');

async function register(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
    }

    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ erro: 'E-mail já registrado' });
    }

    const novoUser = new User({ email, senha });
    await novoUser.save();

    const token = gerarToken({ id: novoUser._id, role: novoUser.role });
    return res.status(201).json({ token });
  } catch (err) {
    console.error("❌ Erro em register:", err.message);
    return res.status(500).json({ erro: 'Falha no registro' });
  }
}

async function login(req, res) {
  try {
    const { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
    }

    const user = await User.findOne({ email });
    if (!user || !(await user.verificarSenha(senha))) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }

    const token = gerarToken({ id: user._id, role: user.role });
    return res.json({ token });
  } catch (err) {
    console.error("❌ Erro em login:", err.message);
    return res.status(500).json({ erro: 'Falha no login' });
  }
}

async function me(req, res) {
  try {
    const user = await User.findById(req.user.id).select('-senha');
    if (!user) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }
    return res.json(user);
  } catch (err) {
    console.error("❌ Erro em me:", err.message);
    return res.status(500).json({ erro: 'Erro ao buscar usuário' });
  }
}

module.exports = {
  register,
  login,
  me
};
