const { mkdirSync } = require('node:fs');
const { createStore } = require('../src/store');
const { ADMIN_USERNAME: username, ADMIN_PASSWORD: password } = process.env;
if (!/^[a-zA-Z0-9_]{3,40}$/.test(username || '') || !password || password.length < 12 || password.length > 128) throw new Error('Defina ADMIN_USERNAME y ADMIN_PASSWORD (12–128 caracteres)');
mkdirSync('data', { recursive: true });
const store = createStore(process.env.DB_PATH || 'data/donantes.sqlite');
try { store.createUser(username, password, 'administrador'); console.log('Administrador creado'); } finally { store.close(); }
