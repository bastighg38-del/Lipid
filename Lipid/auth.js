// ================== API ==================
const API_URL = "https://lipidsapi.onrender.com";

// ================== Base Path ==================
function getBasePath() {
  return window.location.pathname.includes("/Risiko/") ? "../" : "";
}

// ================== Token / Session ==================
function getToken() {
  return localStorage.getItem("access_token");
}

function isLoggedIn() {
  return !!getToken();
}

function isGuest() {
  return localStorage.getItem("is_guest") === "true";
}

function getUsername() {
  return localStorage.getItem("username") || "";
}

function authHeaders() {
  const token = getToken();
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// ================== Login ==================
async function loginUser(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const response = await fetch(`${API_URL}/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Benutzername oder Passwort falsch.");
  }

  const data = await response.json();
  localStorage.setItem("access_token", data.access_token);
  localStorage.setItem("username", username);
  localStorage.removeItem("is_guest");
  return data;
}

function loginAsGuest() {
  localStorage.setItem("is_guest", "true");
  localStorage.removeItem("access_token");
  localStorage.removeItem("username");
  window.location.href = getBasePath() + "index.html";
}

function logout() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("is_guest");
  localStorage.removeItem("username");
  window.location.href = getBasePath() + "login.html";
}

// ================== Guards ==================
// Aufruf auf jeder geschützten Seite
function requireLogin() {
  if (!isLoggedIn()) {
    alert("Bitte einloggen, um auf diese Seite zuzugreifen.");
    window.location.href = getBasePath() + "login.html";
    return false;
  }
  return true;
}

// index.html: Login oder Gast erlaubt
function requireSession() {
  if (!isLoggedIn() && !isGuest()) {
    window.location.href = getBasePath() + "login.html";
    return false;
  }
  return true;
}

// Session gegen Server prüfen
async function checkSession() {
  const token = getToken();
  if (!token) return false;
  try {
    const r = await fetch(`${API_URL}/me`, { headers: authHeaders() });
    return r.ok;
  } catch {
    return false;
  }
}
