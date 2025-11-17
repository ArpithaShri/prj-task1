import React, { useState } from "react";
import { addTask } from "../services/api"; // named import

const AddTask = ({ onTaskAdded }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Task title cannot be empty");

    try {
      setLoading(true);
      // addTask expects an object { title, description }
      const task = await addTask({ title, description });
      // backend returns the created task
      onTaskAdded(task);
      setTitle("");
      setDescription("");
    } catch (err) {
      console.error("Error adding task:", err);
      alert(err.message || "Failed to add task.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        display: "flex",
        gap: "10px",
        justifyContent: "center",
        marginBottom: "20px",
      }}
    >
      <input
        type="text"
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <input
        type="text"
        placeholder="Task description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <button type="submit" disabled={loading}>
        {loading ? "Adding..." : "Add Task"}
      </button>
    </form>
  );
};

export default AddTask;
