import { useParams, Link } from "react-router-dom";
import { useState } from "react";
import { getCategory, updateCategory } from "../storage";

export default function CategoryDetail() {
  const { id } = useParams();
  const [cat, setCat] = useState(() => {
    const loaded = getCategory(id);
    return {
      ...loaded,
      progress: loaded.progress || [],
      tasks: loaded.tasks || [],
      archivedTasks: loaded.archivedTasks || [],
    };
  });

  const [desc, setDesc] = useState(cat.description || "");
  const [newTaskText, setNewTaskText] = useState("");

  if (!cat) return <p>Category not found.</p>;

  function saveCategory(updated) {
    updateCategory(updated);
    setCat(updated);
  }

  function saveDescription() {
    saveCategory({ ...cat, description: desc });
  }

  function handleProgressChange(index, key, value) {
    const updatedProgress = [...cat.progress];
    updatedProgress[index] = {
      ...updatedProgress[index],
      [key]: key === "completed" || key === "total" ? parseInt(value) : value,
    };
    saveCategory({ ...cat, progress: updatedProgress });
  }

  function addProgressBar() {
    const newProgress = { label: "New Progress", completed: 0, total: 100 };
    saveCategory({ ...cat, progress: [...cat.progress, newProgress] });
  }

  function removeProgressBar(index) {
    const updatedProgress = cat.progress.filter((_, i) => i !== index);
    saveCategory({ ...cat, progress: updatedProgress });
  }

  function addTask() {
    if (!newTaskText.trim()) return;
    const updatedTasks = [...cat.tasks, { text: newTaskText.trim() }];
    setNewTaskText("");
    saveCategory({ ...cat, tasks: updatedTasks });
  }

  function archiveTask(index) {
    const archived = [...cat.archivedTasks, cat.tasks[index]];
    const active = cat.tasks.filter((_, i) => i !== index);
    saveCategory({ ...cat, tasks: active, archivedTasks: archived });
  }

  return (
    <div className="container">
      <Link to="/" className="back-link">← Back</Link>
      <h2>{cat.title}</h2>

      <textarea
        rows={5}
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        placeholder="Enter category description..."
      />
      <br />
      <button onClick={saveDescription}>Save Description</button>

      <hr />

      <h3>Progress Bars</h3>
      {cat.progress.map((p, index) => (
        <div key={index} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "10px" }}>
          <input
            type="text"
            value={p.label}
            onChange={(e) => handleProgressChange(index, "label", e.target.value)}
          />
          <br />
          <input
            type="number"
            value={p.completed}
            onChange={(e) => handleProgressChange(index, "completed", e.target.value)}
            min={0}
          />
          {" / "}
          <input
            type="number"
            value={p.total}
            onChange={(e) => handleProgressChange(index, "total", e.target.value)}
            min={1}
          />
          <br />
          <progress value={p.completed} max={p.total} style={{ width: "100%", height: "20px" }} />
          <br />
          <button onClick={() => removeProgressBar(index)} style={{ color: "red", marginTop: "5px" }}>
            Delete Progress
          </button>
        </div>
      ))}
      <button onClick={addProgressBar} style={{ marginTop: "1rem" }}>
        ➕ Add Progress Bar
      </button>

      <hr />

      <h3>Tasks</h3>
      <input
        type="text"
        value={newTaskText}
        onChange={(e) => setNewTaskText(e.target.value)}
        placeholder="Enter a new task..."
      />
      <button onClick={addTask}>Add Task</button>

      <ul style={{ marginTop: "1rem" }}>
        {cat.tasks.map((task, index) => (
          <li key={index}>
            <label>
              <input
                type="checkbox"
                onChange={() => archiveTask(index)}
              />{" "}
              {task.text}
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
