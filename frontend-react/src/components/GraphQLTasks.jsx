// frontend-react/src/components/GraphQLTasks.jsx
import React, { useState, useEffect } from "react";
import {
  graphqlRequest,
  GET_TASKS,
  CREATE_TASK,
  UPDATE_TASK,
  DELETE_TASK,
} from "../services/graphql";
import "../styles/GraphQLTasks.css";

export default function GraphQLTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all, completed, active

  useEffect(() => {
    fetchTasks();
  }, [filter]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const variables = filter === "all" ? {} : { completed: filter === "completed" };
      const data = await graphqlRequest(GET_TASKS, variables);
      setTasks(data.tasks);
      setError("");
    } catch (err) {
      setError(err.message);
      console.error("Error fetching tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      const data = await graphqlRequest(CREATE_TASK, {
        title: newTask,
        description: newDescription || undefined,
      });
      setTasks([data.createTask, ...tasks]);
      setNewTask("");
      setNewDescription("");
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      const data = await graphqlRequest(UPDATE_TASK, {
        id: task.id,
        completed: !task.completed,
      });
      setTasks(tasks.map((t) => (t.id === task.id ? { ...t, ...data.updateTask } : t)));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await graphqlRequest(DELETE_TASK, { id });
      setTasks(tasks.filter((t) => t.id !== id));
      setError("");
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="graphql-tasks-container">
      <div className="graphql-header">
        <h3>GraphQL Tasks</h3>
        <div className="filter-buttons">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            All
          </button>
          <button
            className={filter === "active" ? "active" : ""}
            onClick={() => setFilter("active")}
          >
            Active
          </button>
          <button
            className={filter === "completed" ? "active" : ""}
            onClick={() => setFilter("completed")}
          >
            Completed
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleCreateTask} className="task-form">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Task title"
          className="task-input"
        />
        <input
          type="text"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          placeholder="Description (optional)"
          className="task-input"
        />
        <button type="submit" className="add-task-btn" disabled={!newTask.trim()}>
          + Add Task
        </button>
      </form>

      {loading ? (
        <div className="loading">Loading tasks...</div>
      ) : (
        <div className="tasks-list">
          {tasks.length === 0 ? (
            <div className="no-tasks">No tasks found</div>
          ) : (
            tasks.map((task) => (
              <div key={task.id} className={`task-item ${task.completed ? "completed" : ""}`}>
                <div className="task-content">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => handleToggleComplete(task)}
                    className="task-checkbox"
                  />
                  <div className="task-details">
                    <h4 className="task-title">{task.title}</h4>
                    {task.description && (
                      <p className="task-description">{task.description}</p>
                    )}
                    <span className="task-meta">
                      Created: {new Date(task.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="delete-btn"
                  title="Delete task"
                >
                  🗑️
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}