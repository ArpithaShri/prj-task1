// frontend-react/src/services/api-enhanced.js
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

// Helper function for fetch requests
async function fetchWithCredentials(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

// ========== Auth API ==========

export async function signup(userData) {
  return fetchWithCredentials(`${API_URL}/auth/signup`, {
    method: "POST",
    body: JSON.stringify(userData),
  });
}

export async function login(credentials) {
  return fetchWithCredentials(`${API_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export async function logout() {
  return fetchWithCredentials(`${API_URL}/auth/logout`, {
    method: "POST",
  });
}

// ========== Task API (REST) ==========

export async function getTasks() {
  return fetchWithCredentials(`${API_URL}/tasks`);
}

export async function getTask(id) {
  return fetchWithCredentials(`${API_URL}/tasks/${id}`);
}

export async function addTask(taskData) {
  return fetchWithCredentials(`${API_URL}/tasks`, {
    method: "POST",
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(id, updates) {
  return fetchWithCredentials(`${API_URL}/tasks/${id}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function deleteTask(id) {
  return fetchWithCredentials(`${API_URL}/tasks/${id}`, {
    method: "DELETE",
  });
}

// ========== Notification API ==========

export async function getNotifications() {
  return fetchWithCredentials(`${API_URL}/notifications`);
}

export async function markNotificationRead(id) {
  return fetchWithCredentials(`${API_URL}/notifications/${id}/read`, {
    method: "PATCH",
  });
}

export async function markAllNotificationsRead() {
  return fetchWithCredentials(`${API_URL}/notifications/read-all`, {
    method: "PATCH",
  });
}

export async function deleteNotification(id) {
  return fetchWithCredentials(`${API_URL}/notifications/${id}`, {
    method: "DELETE",
  });
}

export default {
  signup,
  login,
  logout,
  getTasks,
  getTask,
  addTask,
  updateTask,
  deleteTask,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
};