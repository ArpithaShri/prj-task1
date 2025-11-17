// src/components/Chat.jsx
import React, { useState, useEffect, useRef } from "react";
import { getSocket } from "../services/socket";
import "../styles/Chat.css";

export default function Chat({ user }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const socket = getSocket();

  useEffect(() => {
    // Request chat history
    socket.emit("chat:history", { room: "general", limit: 50 });

    // Listen for chat history
    socket.on("chat:history", (history) => {
      setMessages(history);
    });

    // Listen for new messages
    socket.on("chat:message", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing indicators
    socket.on("typing:start", ({ username }) => {
      setTypingUsers((prev) => new Set([...prev, username]));
    });

    socket.on("typing:stop", ({ username }) => {
      setTypingUsers((prev) => {
        const updated = new Set(prev);
        updated.delete(username);
        return updated;
      });
    });

    // Listen for user join/leave
    socket.on("user:joined", ({ username }) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          content: `${username} joined the chat`,
          username: "System",
          createdAt: new Date(),
          isSystem: true,
        },
      ]);
    });

    socket.on("user:left", ({ username }) => {
      setMessages((prev) => [
        ...prev,
        {
          _id: Date.now(),
          content: `${username} left the chat`,
          username: "System",
          createdAt: new Date(),
          isSystem: true,
        },
      ]);
    });

    return () => {
      socket.off("chat:history");
      socket.off("chat:message");
      socket.off("typing:start");
      socket.off("typing:stop");
      socket.off("user:joined");
      socket.off("user:left");
    };
  }, [socket]);

  // Scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    socket.emit("chat:message", {
      content: newMessage,
      room: "general",
    });

    setNewMessage("");
    setIsTyping(false);
    socket.emit("typing:stop", { room: "general" });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typing:start", { room: "general" });
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing after 1 second of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typing:stop", { room: "general" });
    }, 1000);
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h3>💬 Live Chat</h3>
        <span className="online-indicator">🟢 Online</span>
      </div>

      <div className="messages-container">
        {messages.map((msg) => (
          <div
            key={msg._id}
            className={`message ${
              msg.isSystem
                ? "system-message"
                : msg.username === user?.username
                ? "own-message"
                : "other-message"
            }`}
          >
            {!msg.isSystem && (
              <div className="message-header">
                <strong>{msg.username}</strong>
                <span className="message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        {typingUsers.size > 0 && (
          <div className="typing-indicator">
            {Array.from(typingUsers).join(", ")} {typingUsers.size === 1 ? "is" : "are"}{" "}
            typing...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="message-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="message-input"
          maxLength={1000}
        />
        <button type="submit" className="send-button" disabled={!newMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}