// frontend-react/src/pages/Dashboard.jsx
import React, { useEffect, useState } from "react";
import { getTasks, addTask, updateTask, deleteTask } from "../services/api";

export default function Dashboard({ user, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    async function fetchTasks() {
      const data = await getTasks();
      setTasks(data || []);
      setLoading(false);
    }
    fetchTasks();
  }, []);

  const handleAdd = async () => {
    if (!newTask.trim()) return;
    const task = await addTask({ title: newTask });
    setTasks([task, ...tasks]);
    setNewTask("");
  };

  const handleToggle = async (task) => {
    const updated = await updateTask(task._id, { completed: !task.completed });
    setTasks(tasks.map((t) => (t._id === task._id ? updated : t)));
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this task?")) {
      await deleteTask(id);
      setTasks(tasks.filter((t) => t._id !== id));
    }
  };

  const handleEditSave = async (task) => {
    if (!editText.trim()) return;
    const updated = await updateTask(task._id, { title: editText });
    setTasks(tasks.map((t) => (t._id === task._id ? updated : t)));
    setEditingId(null);
    setEditText("");
  };

  return (
    <div style={{ maxWidth: 600, margin: "60px auto", textAlign: "center" }}>
      <h2>Welcome, {user?.username}</h2>
      <p>Role: {user?.role}</p>
      <button onClick={onLogout}>Logout</button>
      <hr />

      <h3>Your Tasks</h3>
      <div>
        <input
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Enter a new task"
        />
        <button onClick={handleAdd}>Add</button>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : tasks.length === 0 ? (
        <p>No tasks yet.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: "20px" }}>
          {tasks.map((task) => (
            <li
              key={task._id}
              style={{
                background: "#f4f4f4",
                marginBottom: 10,
                padding: 10,
                borderRadius: 6,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggle(task)}
                />
                {editingId === task._id ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    style={{ marginLeft: 10 }}
                  />
                ) : (
                  <span
                    style={{
                      textDecoration: task.completed ? "line-through" : "none",
                      marginLeft: 10,
                    }}
                  >
                    {task.title}
                  </span>
                )}
              </div>
              <div>
                {editingId === task._id ? (
                  <>
                    <button onClick={() => handleEditSave(task)}>Save</button>
                    <button onClick={() => setEditingId(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(task._id);
                        setEditText(task.title);
                      }}
                    >
                      Edit
                    </button>
                    <button onClick={() => handleDelete(task._id)}>Delete</button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
