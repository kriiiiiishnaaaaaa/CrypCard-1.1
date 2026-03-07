/* ===== auth.js — CryptoCard Authentication ===== */

const CC_USERS_KEY   = 'cc_users';
const CC_SESSION_KEY = 'cryptocard_user';

/* ---- Seed default test account if not exists ---- */
(function seedDefaultAccount() {
  let users = [];
  try { users = JSON.parse(localStorage.getItem(CC_USERS_KEY) || '[]'); } catch(e) {}
  const exists = users.find(u => u.email === 'test@gmail.com');
  if (!exists) {
    users.push({
      name:     'Test User',
      email:    'test@gmail.com',
      password: 'Test12345',
      balance:  0,
      deposits: [],
      joined:   Date.now()
    });
    localStorage.setItem(CC_USERS_KEY, JSON.stringify(users));
  }
})();

/* ---- getCurrentUser ---- */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem(CC_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch(e) { return null; }
}
window.getCurrentUser = getCurrentUser;

/* ---- authGuard: redirect to auth.html if not logged in ---- */
function authGuard() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = 'auth.html';
    return false;
  }
  return true;
}
window.authGuard = authGuard;

/* ---- logout ---- */
function logout() {
  localStorage.removeItem(CC_SESSION_KEY);
  window.location.href = 'auth.html';
}
window.logout = logout;

/* ---- loginUser(email, password) → {ok, user, error} ---- */
function loginUser(email, password) {
  let users = [];
  try { users = JSON.parse(localStorage.getItem(CC_USERS_KEY) || '[]'); } catch(e) {}
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user)          return { ok: false, error: 'No account found with this email.' };
  if (user.password !== password) return { ok: false, error: 'Incorrect password.' };
  // Save session
  localStorage.setItem(CC_SESSION_KEY, JSON.stringify(user));
  return { ok: true, user };
}
window.loginUser = loginUser;

/* ---- registerUser(name, email, password) → {ok, user, error} ---- */
function registerUser(name, email, password) {
  if (!name || !email || !password) return { ok: false, error: 'All fields are required.' };
  if (password.length < 6)          return { ok: false, error: 'Password must be at least 6 characters.' };
  let users = [];
  try { users = JSON.parse(localStorage.getItem(CC_USERS_KEY) || '[]'); } catch(e) {}
  if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
    return { ok: false, error: 'An account with this email already exists.' };
  }
  const user = { name: name.trim(), email: email.toLowerCase().trim(), password, balance: 0, deposits: [], joined: Date.now() };
  users.push(user);
  localStorage.setItem(CC_USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CC_SESSION_KEY, JSON.stringify(user));
  return { ok: true, user };
}
window.registerUser = registerUser;

/* ---- updateCurrentUser(updates) — persists changes to session + users array ---- */
function updateCurrentUser(updates) {
  const session = getCurrentUser();
  if (!session) return;
  const updated = Object.assign({}, session, updates);
  localStorage.setItem(CC_SESSION_KEY, JSON.stringify(updated));
  // Also sync to users array
  let users = [];
  try { users = JSON.parse(localStorage.getItem(CC_USERS_KEY) || '[]'); } catch(e) {}
  const idx = users.findIndex(u => u.email === session.email);
  if (idx > -1) { users[idx] = updated; localStorage.setItem(CC_USERS_KEY, JSON.stringify(users)); }
}
window.updateCurrentUser = updateCurrentUser;
