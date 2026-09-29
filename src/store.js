const { DatabaseSync } = require('node:sqlite');
const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  return timingSafeEqual(scryptSync(password, salt, 64), Buffer.from(hash, 'hex'));
}
function createStore(path = ':memory:') {
  const db = new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode=WAL;
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE NOT NULL, password TEXT NOT NULL, role TEXT NOT NULL CHECK(role IN ('administrador','usuario')));
    CREATE TABLE IF NOT EXISTS donors (id INTEGER PRIMARY KEY, name TEXT NOT NULL, email TEXT UNIQUE NOT NULL, owner INTEGER NOT NULL REFERENCES users(id));`);
  return {
    createUser(username, password, role = 'usuario') {
      return db.prepare('INSERT INTO users(username,password,role) VALUES (?,?,?)').run(username, hashPassword(password), role);
    },
    userByName: name => db.prepare('SELECT * FROM users WHERE username=?').get(name),
    userById: id => db.prepare('SELECT * FROM users WHERE id=?').get(id),
    addDonor: (name, email, owner) => db.prepare('INSERT INTO donors(name,email,owner) VALUES (?,?,?)').run(name, email, owner),
    listDonors: user => user.role === 'administrador' ? db.prepare('SELECT id,name,email FROM donors').all() : db.prepare('SELECT id,name,email FROM donors WHERE owner=?').all(user.id),
    deleteDonor: id => db.prepare('DELETE FROM donors WHERE id=?').run(id),
    close: () => db.close()
  };
}
module.exports = { createStore, hashPassword, verifyPassword };
