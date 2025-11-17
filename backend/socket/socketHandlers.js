import Message from "../models/Message.js";
import Notification from "../models/Notification.js";

// Store connected users
const connectedUsers = new Map();

export function setupSocketHandlers(io) {
  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

    // Store user connection
    connectedUsers.set(socket.user.id, {
      socketId: socket.id,
      username: socket.user.username,
      userId: socket.user.id,
    });

    // Notify others about new user
    socket.broadcast.emit("user:joined", {
      username: socket.user.username,
      timestamp: new Date(),
    });

    // Join default room
    socket.join("general");

    // ========== Chat Handlers ==========
    
    // Handle chat message
    socket.on("chat:message", async (data) => {
      try {
        const { content, room = "general" } = data;

        if (!content || content.trim().length === 0) {
          socket.emit("error", { message: "Message content cannot be empty" });
          return;
        }

        // Save message to database
        const message = await Message.create({
          user: socket.user.id,
          username: socket.user.username,
          content: content.trim(),
          room,
        });

        // Broadcast to all users in the room
        io.to(room).emit("chat:message", {
          _id: message._id,
          username: message.username,
          content: message.content,
          room: message.room,
          createdAt: message.createdAt,
        });
      } catch (err) {
        console.error("Error handling chat message:", err);
        socket.emit("error", { message: "Failed to send message" });
      }
    });

    // Get chat history
    socket.on("chat:history", async (data) => {
      try {
        const { room = "general", limit = 50 } = data;
        const messages = await Message.find({ room })
          .sort({ createdAt: -1 })
          .limit(limit)
          .lean();

        socket.emit("chat:history", messages.reverse());
      } catch (err) {
        console.error("Error fetching chat history:", err);
        socket.emit("error", { message: "Failed to fetch chat history" });
      }
    });

    // Join specific room
    socket.on("room:join", (data) => {
      const { room } = data;
      socket.join(room);
      socket.emit("room:joined", { room });
      console.log(`User ${socket.user.username} joined room: ${room}`);
    });

    // Leave room
    socket.on("room:leave", (data) => {
      const { room } = data;
      socket.leave(room);
      socket.emit("room:left", { room });
      console.log(`User ${socket.user.username} left room: ${room}`);
    });

    // ========== Notification Handlers ==========
    
    // Send notification to specific user
    socket.on("notification:send", async (data) => {
      try {
        const { userId, type, message, relatedTask } = data;

        // Create notification in database
        const notification = await Notification.create({
          user: userId,
          type,
          message,
          relatedTask,
        });

        // Send to user if connected
        const targetUser = connectedUsers.get(userId);
        if (targetUser) {
          io.to(targetUser.socketId).emit("notification:new", {
            _id: notification._id,
            type: notification.type,
            message: notification.message,
            read: notification.read,
            createdAt: notification.createdAt,
          });
        }
      } catch (err) {
        console.error("Error sending notification:", err);
      }
    });

    // ========== Task Real-time Updates ==========
    
    // Broadcast task created
    socket.on("task:created", (task) => {
      socket.broadcast.emit("task:created", {
        ...task,
        username: socket.user.username,
      });
    });

    // Broadcast task updated
    socket.on("task:updated", (task) => {
      socket.broadcast.emit("task:updated", {
        ...task,
        username: socket.user.username,
      });
    });

    // Broadcast task deleted
    socket.on("task:deleted", (taskId) => {
      socket.broadcast.emit("task:deleted", {
        taskId,
        username: socket.user.username,
      });
    });

    // ========== Typing Indicator ==========
    
    socket.on("typing:start", (data) => {
      const { room = "general" } = data;
      socket.to(room).emit("typing:start", {
        username: socket.user.username,
        room,
      });
    });

    socket.on("typing:stop", (data) => {
      const { room = "general" } = data;
      socket.to(room).emit("typing:stop", {
        username: socket.user.username,
        room,
      });
    });

    // ========== Disconnect Handler ==========
    
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.user.username} (${socket.id})`);
      connectedUsers.delete(socket.user.id);
      
      // Notify others about user leaving
      socket.broadcast.emit("user:left", {
        username: socket.user.username,
        timestamp: new Date(),
      });
    });
  });

  // Function to emit to specific user (can be called from REST routes)
  io.emitToUser = (userId, event, data) => {
    const user = connectedUsers.get(userId);
    if (user) {
      io.to(user.socketId).emit(event, data);
      return true;
    }
    return false;
  };

  return io;
}
// backend/socket/socketHandlers.js