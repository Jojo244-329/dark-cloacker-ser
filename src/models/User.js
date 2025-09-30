const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  senha: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'client'],
    default: 'client'
  },
  criadoEm: {
    type: Date,
    default: Date.now
  }
});

// Hash da senha antes de salvar
UserSchema.pre('save', async function (next) {
  if (!this.isModified('senha')) return next();
  const salt = await bcrypt.genSalt(10);
  this.senha = await bcrypt.hash(this.senha, salt);
  next();
});

// Método para verificar senha
UserSchema.methods.verificarSenha = async function (senha) {
  return await bcrypt.compare(senha, this.senha);
};

// Exporta com proteção contra OverwriteModelError
module.exports =
  mongoose.models.User || mongoose.model('User', UserSchema);
