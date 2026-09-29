const request = require('supertest');
const jwt = require('jsonwebtoken');
const { createStore, hashPassword, verifyPassword } = require('../src/store');
const { createApp } = require('../src/app');
const secret = 'a-test-secret-with-at-least-32-characters';
const password = 'A-test-password-123';
let store, app;
beforeEach(() => { store = createStore(); app = createApp({ store, secret }); });
afterEach(() => store.close());
async function token(role = 'usuario', username = 'tester') {
  store.createUser(username, password, role);
  return (await request(app).post('/login').send({ username, password })).body.token;
}
test('hash con sal y verificación', () => {
  const hash = hashPassword(password);
  expect(hash).not.toBe(hashPassword(password));
  expect(verifyPassword(password, hash)).toBe(true);
  expect(verifyPassword('incorrecta', hash)).toBe(false);
});
test('configuración, salud, cabeceras y rutas desconocidas', async () => {
  expect(() => createApp({ store, secret: 'short' })).toThrow();
  expect(() => createApp({ store })).toThrow();
  const res = await request(app).get('/health');
  expect(res.status).toBe(200);
  expect(res.headers['x-content-type-options']).toBe('nosniff');
  expect(res.headers['x-powered-by']).toBeUndefined();
  expect(res.headers['cache-control']).toBe('no-store');
  expect((await request(app).get('/missing')).status).toBe(404);
});
test('registro siempre usuario; duplicado y datos inválidos', async () => {
  expect((await request(app).post('/register').send({ username: 'ana', password })).body.role).toBe('usuario');
  expect(store.userByName('ana').password).not.toBe(password);
  expect((await request(app).post('/register').send({ username: 'ana', password })).status).toBe(409);
  for (const body of [{}, { username: 'ana', password: 'short' }, { username: 'ana', password, role: 'administrador' }, { username: 1, password }, { username: 'ana', password: 42 }, { username: 'ana', password: 'x'.repeat(129) }]) {
    expect((await request(app).post('/register').send(body)).status).toBe(400);
  }
  expect((await request(app).post('/register')).status).toBe(400);
});
test('login verifica contraseña y no confía en rol enviado', async () => {
  await token();
  for (const body of [{}, { username: 'unknown', password }, { username: 'tester', password: 'Wrong-password-123' }]) expect((await request(app).post('/login').send(body)).status).toBe(401);
  expect((await request(app).post('/login')).status).toBe(401);
  const res = await request(app).post('/login').send({ username: 'tester', password, role: 'administrador' });
  const claims = jwt.verify(res.body.token, secret);
  expect(claims.role).toBe('usuario');
  expect(res.body.user).toEqual({ username: 'tester', role: 'usuario' });
  expect(claims.exp - claims.iat).toBe(900);
});
test('interfaz pública y recursos con cabeceras de seguridad', async () => {
  const page = await request(app).get('/');
  expect(page.status).toBe(200);
  expect(page.type).toBe('text/html');
  expect(page.text).toContain('Donantes');
  expect(page.headers['content-security-policy']).toContain("script-src 'self'");
  expect(page.headers['content-security-policy']).toContain("font-src 'self';");
  expect((await request(app).get('/app.js')).type).toBe('text/javascript');
  expect((await request(app).get('/styles.css')).type).toBe('text/css');
});
test('rechaza JWT ausente, alterado, vencido, algoritmo y audiencia incorrectos', async () => {
  const good = await token();
  const sign = options => jwt.sign({}, secret, { subject: '1', issuer: 'donantes-api', audience: 'donantes-client', ...options });
  const invalid = ['bad', `${good}x`, sign({ expiresIn: -1 }), sign({ audience: 'other' }), sign({ algorithm: 'HS384' }), sign({ subject: '999' })];
  expect((await request(app).get('/donantes')).status).toBe(401);
  for (const value of invalid) expect((await request(app).get('/donantes').set('Authorization', `Bearer ${value}`)).status).toBe(401);
  expect((await request(app).get('/donantes').set('Authorization', good)).status).toBe(401);
});
test('registro persistente, aislamiento por propietario y borrado administrador', async () => {
  const user = await token();
  const other = await token('usuario', 'other');
  const admin = await token('administrador', 'admin');
  const create = await request(app).post('/donantes').set('Authorization', `Bearer ${user}`).send({ name: 'Ana Pérez', email: 'Ana@example.com' });
  expect(create.status).toBe(201);
  expect(create.body.email).toBe('ana@example.com');
  for (const [auth, count] of [[user, 1], [other, 0], [admin, 1]]) expect((await request(app).get('/donantes').set('Authorization', `Bearer ${auth}`)).body).toHaveLength(count);
  expect((await request(app).post('/donantes').set('Authorization', `Bearer ${user}`).send({ name: 'Ana Pérez', email: 'ana@example.com' })).status).toBe(409);
  expect((await request(app).delete(`/donantes/${create.body.id}`).set('Authorization', `Bearer ${user}`)).status).toBe(403);
  for (const id of ['0', 'abc', '9007199254740992']) expect((await request(app).delete(`/donantes/${id}`).set('Authorization', `Bearer ${admin}`)).status).toBe(400);
  expect((await request(app).delete('/donantes/999').set('Authorization', `Bearer ${admin}`)).status).toBe(404);
  expect((await request(app).delete(`/donantes/${create.body.id}`).set('Authorization', `Bearer ${admin}`)).status).toBe(204);
});
test('XSS y SQLi rechazados; consultas parametrizadas conservan datos', async () => {
  const auth = `Bearer ${await token()}`;
  for (const body of [{}, { name: '<script>alert(1)</script>', email: 'a@b.com' }, { name: "Robert'); DROP TABLE donors;--", email: 'a@b.com' }, { name: 'Ana', email: '<img onerror=alert(1)>@b.com' }, { name: 'Ana', email: 1 }, { name: 'Ana', email: 'a'.repeat(255) }]) expect((await request(app).post('/donantes').set('Authorization', auth).send(body)).status).toBe(400);
  expect((await request(app).post('/donantes').set('Authorization', auth)).status).toBe(400);
  expect(store.userByName("' OR 1=1 --")).toBeUndefined();
  store.addDonor("Robert'); DROP TABLE donors;--", 'x@y.com', 1);
  expect(store.listDonors(store.userById(1))).toHaveLength(1);
});
test('errores no filtran detalles y limita solicitudes', async () => {
  const auth = `Bearer ${await token()}`;
  store.addDonor = () => { throw new Error('internal database detail'); };
  const res = await request(app).post('/donantes').set('Authorization', auth).send({ name: 'Ana', email: 'a@b.com' });
  expect(res.status).toBe(500);
  expect(JSON.stringify(res.body)).not.toContain('database');
  expect((await request(app).post('/login').set('Content-Type', 'application/json').send('{bad')).status).toBe(400);
  expect((await request(app).post('/login').send({ data: 'x'.repeat(17000) })).status).toBe(413);
  const limited = createApp({ store, secret, authLimit: 1 });
  await request(limited).post('/login').send({});
  expect((await request(limited).post('/login').send({})).status).toBe(429);
});
