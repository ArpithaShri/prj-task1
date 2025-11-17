import React from "react";
import { deleteTask } from "../services/api"; // named import

const TaskList = ({ tasks, onTaskDeleted }) => {
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this task?")) return;
    try {
      await deleteTask(id);
      onTaskDeleted(id);
    } catch (err) {
      console.error("Error deleting task:", err);
      alert(err.message || "Failed to delete task.");
    }
  };

  return (
    <div style={{ width: "60%", margin: "auto" }}>
      {tasks.map((task) => (
        <div
          key={task._id || task.id}
          style={{
            display: "flex",
            justifyContent: "space-between",
            background: "#f9f9f9",
            padding: "10px",
            margin: "5px 0",
            borderRadius: "8px",
          }}
        >
          <div>
            <strong>{task.title}</strong>
            <p>{task.description}</p>
          </div>
          <button onClick={() => handleDelete(task._id || task.id)}>🗑️</button>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
