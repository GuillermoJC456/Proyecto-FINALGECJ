'use strict';
const el = id => document.getElementById(id);
let mode = 'login';
let session = null;
let donors = [];
let pendingDelete = null;
let expiryTimer;
let loading = false;

function message(id, text) {
  el(id).textContent = text;
  el(id).hidden = !text;
}
function setMode(value) {
  mode = value;
  el('auth-form').action = value === 'login' ? '/login' : '/register';
  const login = mode === 'login';
  el('login-tab').classList.toggle('active', login);
  el('register-tab').classList.toggle('active', !login);
  el('login-tab').setAttribute('aria-pressed', String(login));
  el('register-tab').setAttribute('aria-pressed', String(!login));
  el('auth-title').textContent = login ? 'Qué bueno verte.' : 'Empieza a sumar.';
  el('auth-description').textContent = login ? 'Ingresa a tu cuenta para continuar.' : 'Crea tu cuenta y registra a tus donantes.';
  el('auth-submit').textContent = login ? 'Entrar →' : 'Crear cuenta →';
  el('password').autocomplete = login ? 'current-password' : 'new-password';
  message('auth-error', '');
}
function logout(text = '') {
  session = null;
  donors = [];
  clearTimeout(expiryTimer);
  el('donor-dialog').close();
  el('delete-dialog').close();
  el('dashboard').hidden = true;
  el('account').hidden = true;
  el('welcome-label').hidden = false;
  el('auth-view').hidden = false;
  el('donors').replaceChildren();
  el('auth-form').reset();
  setMode('login');
  message('notice', text);
  el('username').focus();
}
async function api(path, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (session) headers.Authorization = `Bearer ${session.token}`;
  let response;
  try { response = await fetch(path, { ...options, headers }); }
  catch { throw new Error('No se pudo conectar. Revisa tu conexión e intenta de nuevo.'); }
  if (response.status === 429) throw new Error('Demasiados intentos. Espera 15 minutos antes de volver a intentar.');
  const data = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    if (response.status === 401 && session) logout('Tu sesión terminó. Inicia sesión de nuevo.');
    throw new Error(data?.error || 'No se pudo completar la operación.');
  }
  return data;
}
function render() {
  const query = el('search').value.trim().toLocaleLowerCase('es');
  const rows = donors.filter(donor => `${donor.name} ${donor.email}`.toLocaleLowerCase('es').includes(query));
  el('total').textContent = String(donors.length);
  el('total-label').textContent = donors.length === 1 ? 'persona registrada' : 'personas registradas';
  el('result-count').textContent = `${rows.length} de ${donors.length} registros`;
  el('actions-heading').hidden = session?.user.role !== 'administrador';
  el('table-wrap').hidden = loading || !rows.length;
  el('empty').hidden = loading || rows.length > 0;
  el('empty-title').textContent = query ? 'No encontramos coincidencias.' : 'Todo empieza con una persona.';
  el('empty-description').textContent = query ? 'Prueba con otro nombre o correo electrónico.' : 'Registra a tu primer donante para comenzar.';
  el('donors').replaceChildren();
  for (const donor of rows) {
    const row = document.createElement('tr');
    const name = document.createElement('td');
    const person = document.createElement('div');
    person.className = 'person';
    const avatar = document.createElement('span');
    avatar.className = 'avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.textContent = donor.name.trim().split(/\s+/).map(word => word[0]).slice(0, 2).join('').toLocaleUpperCase('es');
    const label = document.createElement('span');
    label.textContent = donor.name;
    person.append(avatar, label);
    name.append(person);
    const email = document.createElement('td');
    email.textContent = donor.email;
    row.append(name, email);
    if (session?.user.role === 'administrador') {
      const actions = document.createElement('td');
      const button = document.createElement('button');
      button.className = 'delete-button';
      button.type = 'button';
      button.textContent = 'Eliminar';
      button.setAttribute('aria-label', `Eliminar a ${donor.name}`);
      button.addEventListener('click', () => {
        pendingDelete = donor;
        message('delete-error', '');
        el('delete-description').textContent = `Se eliminará a ${donor.name} del directorio.`;
        el('delete-dialog').showModal();
        el('cancel-delete').focus();
      });
      actions.append(button);
      row.append(actions);
    }
    el('donors').append(row);
  }
}
async function loadDonors() {
  const current = session;
  loading = true;
  el('loading').hidden = false;
  el('refresh').disabled = true;
  message('list-error', '');
  render();
  try {
    const result = await api('/donantes');
    if (session === current) donors = result;
  } catch (error) {
    if (session === current) message('list-error', error.message);
  } finally {
    loading = false;
    el('loading').hidden = true;
    el('refresh').disabled = false;
    if (session === current) render();
  }
}
el('login-tab').addEventListener('click', () => setMode('login'));
el('register-tab').addEventListener('click', () => setMode('register'));
el('toggle-password').addEventListener('click', () => {
  const show = el('password').type === 'password';
  el('password').type = show ? 'text' : 'password';
  el('toggle-password').textContent = show ? 'Ocultar' : 'Ver';
  el('toggle-password').setAttribute('aria-label', show ? 'Ocultar contraseña' : 'Mostrar contraseña');
  el('toggle-password').setAttribute('aria-pressed', String(show));
});
el('auth-form').addEventListener('submit', async event => {
  event.preventDefault();
  const currentMode = mode;
  const body = { username: el('username').value.trim(), password: el('password').value };
  for (const id of ['auth-submit', 'login-tab', 'register-tab']) el(id).disabled = true;
  el('auth-submit').textContent = 'Un momento…';
  message('auth-error', '');
  message('notice', '');
  try {
    if (currentMode === 'register') {
      await api('/register', { method: 'POST', body: JSON.stringify(body) });
      setMode('login');
      el('password').value = '';
      message('notice', 'Tu cuenta está lista. Inicia sesión para comenzar.');
      el('password').focus();
    } else {
      const result = await api('/login', { method: 'POST', body: JSON.stringify(body) });
      session = result;
      el('auth-form').reset();
      el('auth-view').hidden = true;
      el('welcome-label').hidden = true;
      el('dashboard').hidden = false;
      el('account').hidden = false;
      el('account-name').textContent = result.user.username;
      const admin = result.user.role === 'administrador';
      el('role').textContent = admin ? 'Administrador' : 'Usuario';
      el('scope-description').textContent = admin ? 'Consulta todos los registros y administra el directorio.' : 'Consulta y organiza las personas que has registrado.';
      el('list-footer-text').textContent = admin ? 'Estás consultando los registros de todas las cuentas.' : 'Solo tú y el administrador pueden consultar tus registros.';
      el('search').value = '';
      expiryTimer = setTimeout(() => logout('Tu sesión terminó. Inicia sesión de nuevo.'), result.expiresIn * 1000);
      await loadDonors();
      el('new-donor').focus();
    }
  } catch (error) { message('auth-error', error.message); }
  finally {
    for (const id of ['auth-submit', 'login-tab', 'register-tab']) el(id).disabled = false;
    el('auth-submit').textContent = mode === 'login' ? 'Entrar →' : 'Crear cuenta →';
  }
});
el('logout').addEventListener('click', () => logout('Has cerrado sesión.'));
el('search').addEventListener('input', render);
el('refresh').addEventListener('click', loadDonors);
el('new-donor').addEventListener('click', () => {
  el('donor-form').reset();
  message('donor-error', '');
  el('donor-dialog').showModal();
});
for (const id of ['close-donor', 'cancel-donor']) el(id).addEventListener('click', () => el('donor-dialog').close());
el('donor-form').addEventListener('submit', async event => {
  event.preventDefault();
  const current = session;
  el('save-donor').disabled = true;
  el('save-donor').textContent = 'Guardando…';
  message('donor-error', '');
  try {
    await api('/donantes', { method: 'POST', body: JSON.stringify({ name: el('donor-name').value.trim(), email: el('donor-email').value.trim() }) });
    if (session !== current) return;
    el('donor-dialog').close();
    el('search').value = '';
    message('notice', 'Donante registrado correctamente.');
    await loadDonors();
  } catch (error) { message('donor-error', error.message); }
  finally { el('save-donor').disabled = false; el('save-donor').textContent = 'Guardar donante'; }
});
el('cancel-delete').addEventListener('click', () => el('delete-dialog').close());
el('confirm-delete').addEventListener('click', async () => {
  if (!pendingDelete) return;
  const current = session;
  el('confirm-delete').disabled = true;
  message('delete-error', '');
  try {
    await api(`/donantes/${pendingDelete.id}`, { method: 'DELETE' });
    if (session !== current) return;
    el('delete-dialog').close();
    pendingDelete = null;
    message('notice', 'Registro eliminado.');
    await loadDonors();
  } catch (error) { message('delete-error', error.message); }
  finally { el('confirm-delete').disabled = false; }
});
