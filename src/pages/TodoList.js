import { Link } from "react-router-dom";
import { getAllCategories, updateCategory } from "../storage";
import { useState, useEffect, useCallback } from "react";

export default function TodoList() {
  const [allTasks, setAllTasks] = useState([]);

  const loadTasks = useCallback(() => {
    const cats = getAllCategories();
    const tasks = [];

    cats.forEach((cat) => {
      if (!cat.tasks || cat.tasks.length === 0) return;

      cat.tasks.forEach((task, idx) => {
        tasks.push({
          categoryId: cat.id,
          categoryTitle: cat.title,
          taskIndex: idx,
          taskText: task.text,
        });
      });
    });

    setAllTasks(tasks);
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const archiveTask = (categoryId, taskIndex) => {
    const cats = getAllCategories();
    const updatedCats = cats.map((cat) => {
      if (cat.id !== categoryId) return cat;

      const task = cat.tasks[taskIndex];
      const updated = {
        ...cat,
        tasks: cat.tasks.filter((_, i) => i !== taskIndex),
        archivedTasks: [...(cat.archivedTasks || []), task],
      };

      updateCategory(updated);
      return updated;
    });

    // Refresh UI
    const tasks = [];
    updatedCats.forEach((cat) => {
      cat.tasks?.forEach((task, idx) => {
        tasks.push({
          categoryId: cat.id,
          categoryTitle: cat.title,
          taskIndex: idx,
          taskText: task.text,
        });
      });
    });

    setAllTasks(tasks);
  };

  return (
    <div className="container" style={{ padding: "2rem" }}>
      <Link to="/" className="back-link" style={{ marginBottom: "1rem", display: "inline-block" }}>
        ← Back to Home
      </Link>

      <h2 style={{ marginBottom: "1rem" }}>📝 Global To-Do List</h2>

      {allTasks.length === 0 ? (
        <p>No tasks pending. All clear!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {allTasks.map((task, idx) => (
            <li key={idx} style={{ marginBottom: "0.75rem" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <input
                  type="checkbox"
                  onChange={() => archiveTask(task.categoryId, task.taskIndex)}
                />
                <span>
                  {task.taskText}{" "}
                  <span style={{ opacity: 0.5, fontStyle: "italic" }}>
                    ({task.categoryTitle})
                  </span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
