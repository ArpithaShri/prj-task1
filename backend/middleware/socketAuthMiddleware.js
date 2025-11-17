import jwt from "jsonwebtoken";
import cookie from "cookie";

export const socketAuthMiddleware = (socket, next) => {
  try {
    // Parse cookies from handshake
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");
    const token = cookies.token;

    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach user to socket
    socket.user = decoded;
    
    next();
  } catch (err) {
    console.error("Socket authentication error:", err.message);
    next(new Error("Authentication error: Invalid token"));
  }
};
// backend/middleware/socketAuthMiddleware.js