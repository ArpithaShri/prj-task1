// src/services/api.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

async function fetchWithCredentials(url, options = {}) {
  const opts = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  };

  // If body is plain object -> stringify
  if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
    opts.body = JSON.stringify(opts.body);
  }

  const res = await fetch(url, opts);

  // Try to parse JSON safely
  const data = await res
    .json()
    .catch(() => null); // if no json, leave null

  if (!res.ok) {
    // Prefer server message, fallback to statusText
    const message = (data && (data.message || data.error || data.msg)) || res.statusText || "Request failed";
    const err = new Error(message);
    err.status = res.status;
    err.payload = data;
    throw err;
  }

  return data;
}

/* ===== AUTH ===== */

export async function signup({ username, password, role = "user" } = {}) {
  if (!username || !password) throw new Error("Username and password are required");
  return fetchWithCredentials(`${API_URL}/auth/signup`, {
    method: "POST",
    body: { username, password, role },
  });
}

export async function login({ username, password } = {}) {
  if (!username || !password) throw new Error("Username and password are required");
  return fetchWithCredentials(`${API_URL}/auth/login`, {
    method: "POST",
    body: { username, password },
  });
}

export async function logout() {
  return fetchWithCredentials(`${API_URL}/auth/logout`, { method: "POST" });
}

/* ===== TASKS (REST) ===== */

export async function getTasks() {
  return fetchWithCredentials(`${API_URL}/tasks`, { method: "GET" });
}

export async function getTask(id) {
  if (!id) throw new Error("Task id required");
  return fetchWithCredentials(`${API_URL}/tasks/${id}`, { method: "GET" });
}

export async function addTask(taskData = {}) {
  if (!taskData.title) throw new Error("Task title required");
  return fetchWithCredentials(`${API_URL}/tasks`, {
    method: "POST",
    body: taskData,
  });
}

export async function updateTask(id, updates = {}) {
  if (!id) throw new Error("Task id required");
  return fetchWithCredentials(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    body: updates,
  });
}

export async function deleteTask(id) {
  if (!id) throw new Error("Task id required");
  return fetchWithCredentials(`${API_URL}/tasks/${id}`, { method: "DELETE" });
}

/* ===== NOTIFICATIONS (optional) ===== */

export async function getNotifications() {
  return fetchWithCredentials(`${API_URL}/notifications`, { method: "GET" });
}

export async function markNotificationRead(id) {
  return fetchWithCredentials(`${API_URL}/notifications/${id}/read`, { method: "PATCH" });
}

export async function markAllNotificationsRead() {
  return fetchWithCredentials(`${API_URL}/notifications/read-all`, { method: "PATCH" });
}

export async function deleteNotification(id) {
  return fetchWithCredentials(`${API_URL}/notifications/${id}`, { method: "DELETE" });
}
