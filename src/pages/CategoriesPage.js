import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  loadCategories,
  addCategory,
  deleteCategory,
  saveCategories,
} from "../storage";
import { askMistral } from "../ai";

export default function CategoriesPage({ confirmedCategories }) {
  const [cats, setCats] = useState(loadCategories());
  const [title, setTitle] = useState("");

  // Sync from confirmedCategories if passed
  useEffect(() => {
    if (confirmedCategories.length > 0) {
      setCats(confirmedCategories);
      saveCategories(confirmedCategories); // sync to storage too
    }
  }, [confirmedCategories]);

  function handleAdd(e) {
    e.preventDefault();
    if (!title.trim()) return;
    addCategory(title.trim());
    setCats(loadCategories());
    setTitle("");
  }

  function handleDelete(id) {
    deleteCategory(id);
    setCats(loadCategories());
  }

  async function handleAskAI() {
    const msg = await askMistral("Suggest 3 personal development categories.");
    alert(msg);
  }

  return (
    <div className="container">
      <h1>My Categories</h1>

      <form onSubmit={handleAdd} className="add-form">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="New category name"
        />
        <button type="submit">+</button>
      </form>

      <button onClick={handleAskAI} className="ai-button">
        Ask AI
      </button>

      <div className="cat-list">
        {cats.map((c) => (
          <div className="cat-item" key={c.id}>
            <Link to={`/category/${c.id}`} className="cat-link">
              {c.title}
            </Link>
            <span
              className="delete-btn"
              onClick={() => handleDelete(c.id)}
              title="Delete category"
            >
              🗑️
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
