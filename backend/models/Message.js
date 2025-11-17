import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    room: {
      type: String,
      default: "general",
    },
  },
  { timestamps: true }
);

// Index for efficient queries
messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ user: 1 });

export default mongoose.model("Message", messageSchema);
// backend/models/Message.js