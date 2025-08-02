import { v4 as uuid } from "uuid";

const KEY = "categories";

export function loadCategories() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch {
    return [];
  }
}

export function saveCategories(categories) {
  localStorage.setItem("categories", JSON.stringify(categories));
}

export function addCategory(title) {
  const cats = loadCategories();
  const newCat = {
    id: uuid(),
    title,
    description: "",
    tasks: [],
    progressBars: [],
  };
  cats.push(newCat);
  saveCategories(cats);
  return newCat;
}

export function deleteCategory(id) {
  const cats = loadCategories().filter((c) => c.id !== id);
  saveCategories(cats);
}

export function getCategory(id) {
  return loadCategories().find((c) => c.id === id);
}

export function updateCategory(updated) {
  const cats = loadCategories().map((c) =>
    c.id === updated.id ? updated : c
  );
  saveCategories(cats);
}

// ✅ Add this export for the Todo List page
export function getAllCategories() {
  return loadCategories();
}
