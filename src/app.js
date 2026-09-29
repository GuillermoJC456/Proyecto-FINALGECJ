const express = require('express');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const { rateLimit } = require('express-rate-limit');
const { verifyPassword, hashPassword } = require('./store');
const dummyHash = hashPassword('dummy-password-for-timing');
const validUsername = v => typeof v === 'string' && /^\w{3,40}$/.test(v);
const validPassword = v => typeof v === 'string' && v.length >= 12 && v.length <= 128;

function createApp({ store, secret, authLimit = 20 }) {
  if (typeof secret !== 'string' || secret.length < 32) throw new Error('JWT_SECRET debe tener al menos 32 caracteres');
  const app = express();
  app.disable('x-powered-by');
  app.disable('etag');
  app.use(helmet());
  app.use((_req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
  });
  app.use(express.json({ limit: '16kb' }));
  app.use(['/login', '/register'], rateLimit({ windowMs: 15 * 60 * 1000, limit: authLimit, standardHeaders: 'draft-8', legacyHeaders: false }));
  app.get('/health', (_req, res) => res.json({ status: 'ok' }));
  app.post('/register', (req, res) => {
    const { username, password, role } = req.body || {};
    if (!validUsername(username) || !validPassword(password) || role !== undefined) return res.status(400).json({ error: 'Datos inválidos; el rol lo asigna el servidor' });
    if (store.userByName(username)) return res.status(409).json({ error: 'Usuario existente' });
    store.createUser(username, password);
    res.status(201).json({ username, role: 'usuario' });
  });
  app.post('/login', (req, res) => {
    const { username, password } = req.body || {};
    if (!validUsername(username) || !validPassword(password)) return res.status(401).json({ error: 'Credenciales inválidas' });
    const user = store.userByName(username);
    const valid = verifyPassword(password, user ? user.password : dummyHash);
    if (!user || !valid) return res.status(401).json({ error: 'Credenciales inválidas' });
    const token = jwt.sign({ role: user.role }, secret, { algorithm: 'HS256', subject: String(user.id), expiresIn: '15m', issuer: 'donantes-api', audience: 'donantes-client' });
    res.json({ token, tokenType: 'Bearer', expiresIn: 900 });
  });
  app.use('/donantes', (req, res, next) => {
    const match = /^Bearer (\S+)$/.exec(req.headers.authorization || '');
    if (!match) return res.status(401).json({ error: 'Se requiere Bearer token' });
    try {
      const claims = jwt.verify(match[1], secret, { algorithms: ['HS256'], issuer: 'donantes-api', audience: 'donantes-client' });
      req.user = store.userById(claims.sub);
      if (!req.user) return res.status(401).json({ error: 'Usuario no disponible' });
      next();
    } catch { res.status(401).json({ error: 'Token inválido o vencido' }); }
  });
  app.get('/donantes', (req, res) => res.json(store.listDonors(req.user)));
  app.post('/donantes', (req, res) => {
    const { name, email } = req.body || {};
    if (typeof name !== 'string' || !/^[\p{L} .'-]{2,100}$/u.test(name) || typeof email !== 'string' || email.length > 254 || !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) return res.status(400).json({ error: 'Nombre o correo inválido' });
    try {
      const result = store.addDonor(name, email.toLowerCase(), req.user.id);
      res.status(201).json({ id: Number(result.lastInsertRowid), name, email: email.toLowerCase() });
    } catch (error) {
      if (error.message.includes('UNIQUE constraint')) return res.status(409).json({ error: 'Correo existente' });
      throw error;
    }
  });
  app.delete('/donantes/:id', (req, res) => {
    if (req.user.role !== 'administrador') return res.status(403).json({ error: 'Se requiere administrador' });
    if (!/^[1-9]\d*$/.test(req.params.id) || !Number.isSafeInteger(Number(req.params.id))) return res.status(400).json({ error: 'ID inválido' });
    if (!store.deleteDonor(Number(req.params.id)).changes) return res.status(404).json({ error: 'Donante no encontrado' });
    res.status(204).end();
  });
  app.use((_req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
  app.use((err, _req, res, _next) => {
    const status = new Map([['entity.parse.failed', 400], ['entity.too.large', 413]]).get(err.type) || 500;
    res.status(status).json({ error: status === 500 ? 'Error interno' : 'Solicitud inválida' });
  });
  return app;
}
module.exports = { createApp };
