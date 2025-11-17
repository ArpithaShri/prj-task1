// frontend-react/src/services/socket.js
/*
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

let socket = null;

export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });

    // Connection event handlers
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("error", (error) => {
      console.error("⚠️ Socket error:", error);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Connection error:", error.message);
    });
  }
  return socket;
};

export const connectSocket = () => {
  if (socket && !socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export const getSocket = () => {
  if (!socket) {
    throw new Error("Socket not initialized. Call initializeSocket() first.");
  }
  return socket;
};

export default {
  initializeSocket,
  connectSocket,
  disconnectSocket,
  getSocket,
};
*/
// src/services/socket.js
import { io } from "socket.io-client";

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || "http://localhost:5000";

let socket = null;

// Initialize socket safely
export const initializeSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket.id);
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
    });

    socket.on("connect_error", (error) => {
      console.error("⚠️ Socket connection error:", error.message);
    });
  }
  return socket;
};

// Safe getter (never throw)
export const getSocket = () => {
  if (!socket) {
    console.warn("⚠️ getSocket() called before initialization — returning null");
    return null;
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket && socket.connected) {
    socket.disconnect();
  }
};

export default {
  initializeSocket,
  getSocket,
  disconnectSocket,
};
