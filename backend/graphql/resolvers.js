import Task from "../models/Task.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import Message from "../models/Message.js";

export const resolvers = {
  Query: {
    // Get current user
    me: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      const currentUser = await User.findById(user.id);
      return {
        id: currentUser._id.toString(),
        username: currentUser.username,
        role: currentUser.role,
      };
    },

    // Get tasks
    tasks: async (_, { completed }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      
      const filter = { user: user.id };
      if (completed !== undefined) {
        filter.completed = completed;
      }
      
      const tasks = await Task.find(filter).populate("user").sort({ createdAt: -1 });
      return tasks.map(task => ({
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        completed: task.completed,
        user: {
          id: task.user._id.toString(),
          username: task.user.username,
          role: task.user.role,
        },
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      }));
    },

    // Get single task
    task: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      
      const task = await Task.findOne({ _id: id, user: user.id }).populate("user");
      if (!task) throw new Error("Task not found");
      
      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        completed: task.completed,
        user: {
          id: task.user._id.toString(),
          username: task.user.username,
          role: task.user.role,
        },
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      };
    },

    // Get notifications
    notifications: async (_, { unreadOnly }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      
      const filter = { user: user.id };
      if (unreadOnly) {
        filter.read = false;
      }
      
      const notifications = await Notification.find(filter)
        .populate("user")
        .populate("relatedTask")
        .sort({ createdAt: -1 })
        .limit(50);
      
      return notifications.map(notif => ({
        id: notif._id.toString(),
        user: {
          id: notif.user._id.toString(),
          username: notif.user.username,
          role: notif.user.role,
        },
        type: notif.type,
        message: notif.message,
        read: notif.read,
        relatedTask: notif.relatedTask ? {
          id: notif.relatedTask._id.toString(),
          title: notif.relatedTask.title,
          description: notif.relatedTask.description,
          completed: notif.relatedTask.completed,
          createdAt: notif.relatedTask.createdAt.toISOString(),
          updatedAt: notif.relatedTask.updatedAt.toISOString(),
        } : null,
        createdAt: notif.createdAt.toISOString(),
      }));
    },

    // Get messages
    messages: async (_, { room = "general", limit = 50 }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      
      const messages = await Message.find({ room })
        .populate("user")
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();
      
      return messages.reverse().map(msg => ({
        id: msg._id.toString(),
        user: {
          id: msg.user._id.toString(),
          username: msg.user.username,
          role: msg.user.role,
        },
        username: msg.username,
        content: msg.content,
        room: msg.room,
        createdAt: msg.createdAt.toISOString(),
      }));
    },
  },

  Mutation: {
    // Create task
    createTask: async (_, { title, description }, { user, io }) => {
      if (!user) throw new Error("Not authenticated");
      
      const task = await Task.create({
        title,
        description,
        user: user.id,
      });
      
      await task.populate("user");
      
      // Create notification
      await Notification.create({
        user: user.id,
        type: "task_created",
        message: `Task "${title}" created`,
        relatedTask: task._id,
      });
      
      // Emit socket event
      if (io) {
        io.emit("task:created", {
          id: task._id.toString(),
          title: task.title,
          username: task.user.username,
        });
      }
      
      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        completed: task.completed,
        user: {
          id: task.user._id.toString(),
          username: task.user.username,
          role: task.user.role,
        },
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      };
    },

    // Update task
    updateTask: async (_, { id, title, description, completed }, { user, io }) => {
      if (!user) throw new Error("Not authenticated");
      
      const updates = {};
      if (title !== undefined) updates.title = title;
      if (description !== undefined) updates.description = description;
      if (completed !== undefined) updates.completed = completed;
      
      const task = await Task.findOneAndUpdate(
        { _id: id, user: user.id },
        updates,
        { new: true, runValidators: true }
      ).populate("user");
      
      if (!task) throw new Error("Task not found");
      
      // Create notification
      await Notification.create({
        user: user.id,
        type: completed ? "task_completed" : "task_updated",
        message: `Task "${task.title}" ${completed ? 'completed' : 'updated'}`,
        relatedTask: task._id,
      });
      
      // Emit socket event
      if (io) {
        io.emit("task:updated", {
          id: task._id.toString(),
          title: task.title,
          completed: task.completed,
        });
      }
      
      return {
        id: task._id.toString(),
        title: task.title,
        description: task.description,
        completed: task.completed,
        user: {
          id: task.user._id.toString(),
          username: task.user.username,
          role: task.user.role,
        },
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
      };
    },

    // Delete task
    deleteTask: async (_, { id }, { user, io }) => {
      if (!user) throw new Error("Not authenticated");
      
      const task = await Task.findOneAndDelete({ _id: id, user: user.id });
      if (!task) throw new Error("Task not found");
      
      // Create notification
      await Notification.create({
        user: user.id,
        type: "task_deleted",
        message: `Task "${task.title}" deleted`,
      });
      
      // Emit socket event
      if (io) {
        io.emit("task:deleted", { id: task._id.toString() });
      }
      
      return {
        success: true,
        message: "Task deleted successfully",
      };
    },

    // Mark notification as read
    markNotificationRead: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      
      const notification = await Notification.findOneAndUpdate(
        { _id: id, user: user.id },
        { read: true },
        { new: true }
      ).populate("user");
      
      if (!notification) throw new Error("Notification not found");
      
      return {
        id: notification._id.toString(),
        user: {
          id: notification.user._id.toString(),
          username: notification.user.username,
          role: notification.user.role,
        },
        type: notification.type,
        message: notification.message,
        read: notification.read,
        createdAt: notification.createdAt.toISOString(),
      };
    },

    // Mark all notifications as read
    markAllNotificationsRead: async (_, __, { user }) => {
      if (!user) throw new Error("Not authenticated");
      
      const result = await Notification.updateMany(
        { user: user.id, read: false },
        { read: true }
      );
      
      return {
        success: true,
        message: "All notifications marked as read",
        count: result.modifiedCount,
      };
    },

    // Delete notification
    deleteNotification: async (_, { id }, { user }) => {
      if (!user) throw new Error("Not authenticated");
      
      const notification = await Notification.findOneAndDelete({
        _id: id,
        user: user.id,
      });
      
      if (!notification) throw new Error("Notification not found");
      
      return {
        success: true,
        message: "Notification deleted successfully",
      };
    },
  },
};
// backend/graphql/resolvers.js