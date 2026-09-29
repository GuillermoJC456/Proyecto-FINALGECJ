const { mkdirSync } = require('node:fs');
const { createStore } = require('./store');
const { createApp } = require('./app');
mkdirSync('data', { recursive: true });
const store = createStore(process.env.DB_PATH || 'data/donantes.sqlite');
const app = createApp({ store, secret: process.env.JWT_SECRET });
const server = app.listen(process.env.PORT || 3000, '0.0.0.0', () => console.log('API de donantes disponible'));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { store.close(); process.exit(0); }));
