import path from "path";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import { typeDefs } from "./graphql/typeDefs.js";
import { resolvers } from "./graphql/resolvers.js";
import { setupSocketHandlers } from "./socket/socketHandlers.js";
import { socketAuthMiddleware } from "./middleware/socketAuthMiddleware.js";

dotenv.config();
const app = express();
const httpServer = createServer(app);
const __dirname = path.resolve();

// ============ CORS Configuration ============
const corsOptions = {
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());

// ============ Socket.io Setup ============
const io = new Server(httpServer, {
  cors: {
    origin: process.env.SOCKET_CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  },
});

// Socket.io authentication middleware
io.use(socketAuthMiddleware);

// Setup socket event handlers
setupSocketHandlers(io);

// Make io accessible to routes
app.set("io", io);

// ============ REST API Routes ============
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/notifications", notificationRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ 
    status: "ok", 
    timestamp: new Date().toISOString(),
    services: {
      rest: "operational",
      websocket: "operational",
      graphql: "operational"
    }
  });
});

// ============ GraphQL Setup ============
const apolloServer = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

await apolloServer.start();

app.use(
  "/graphql",
  expressMiddleware(apolloServer, {
    context: async ({ req }) => {
      // Pass user from JWT cookie to GraphQL context
      const token = req.cookies?.token;
      let user = null;
      
      if (token) {
        try {
          const jwt = await import("jsonwebtoken");
          user = jwt.default.verify(token, process.env.JWT_SECRET);
        } catch (err) {
          console.log("Invalid token in GraphQL context");
        }
      }
      
      return { user, io };
    },
  })
);

// ============ Serve Frontend (Production) ============
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__dirname, "build", "index.html"))
  );
}

// ============ Database Connection & Server Start ============
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    const PORT = process.env.PORT || 5000;
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📡 REST API: http://localhost:${PORT}/api`);
      console.log(`🔌 WebSocket: ws://localhost:${PORT}`);
      console.log(`🚀 GraphQL: http://localhost:${PORT}/graphql`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, closing server gracefully...");
  await apolloServer.stop();
  httpServer.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});