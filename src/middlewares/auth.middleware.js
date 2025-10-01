const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'glitch-do-inferno';


function autenticar(req, res, next) {
const token = req.headers.authorization?.split(' ')[1];
if (!token) return res.status(401).json({ erro: 'Token ausente' });


try {
const payload = jwt.verify(token, SECRET);
req.user = payload;
next();
} catch (err) {
return res.status(403).json({ erro: 'Token inválido' });
}
}


function isAdmin(req, res, next) {
if (req.user?.role !== 'admin') {
return res.status(403).json({ erro: 'Acesso restrito ao admin' });
}
next();
}


function isClient(req, res, next) {
if (req.user?.role !== 'client') {
return res.status(403).json({ erro: 'Apenas clientes podem acessar' });
}
next();
}


module.exports = {
autenticar,
isAdmin,
isClient
};