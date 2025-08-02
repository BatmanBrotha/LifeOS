import { useState } from "react";
import { askMistral } from "../ai";
import { loadCategories, saveCategories } from "../storage";
import "./SidebarChat.css";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom"; // ✅ added

export default function SidebarChat({ onConfirmCategories }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [suggestedCategories, setSuggestedCategories] = useState([]);
  const [confirmedList, setConfirmedList] = useState(loadCategories());

  const handleSend = async () => {
    if (!input || typeof input !== "string") return;

    const trimmedInput = input.trim().toLowerCase();
    if (!trimmedInput) return;

    // Handle confirm command
    if (trimmedInput === "confirm") {
      if (suggestedCategories.length === 0) {
        setMessages((msgs) => [
          ...msgs,
          { sender: "bot", text: "No categories to confirm yet." },
        ]);
      } else {
        const existingTitles = confirmedList.map((c) =>
          c.title?.toLowerCase?.()
        );

        const newOnes = suggestedCategories
          .filter((cat) => !existingTitles.includes(cat.toLowerCase()))
          .map((title) => ({
            id: uuidv4(),
            title,
            description: "",
            tasks: [],
            notes: [],
            progress: 0,
            mood: "",
            links: [],
            images: [],
          }));

        const updated = [...confirmedList, ...newOnes];

        saveCategories(updated);
        setConfirmedList(updated);
        onConfirmCategories(updated);
        setMessages((msgs) => [
          ...msgs,
          { sender: "bot", text: "Categories created and saved." },
        ]);
        setSuggestedCategories([]);
      }
      setInput("");
      return;
    }

    // Add user message
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);

    try {
      const response = await askMistral(input);

      const categories = response
        .split(",")
        .map((cat) => cat?.trim())
        .filter((cat) => cat);

      setSuggestedCategories(categories);
      setMessages((msgs) => [...msgs, { sender: "bot", text: response }]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { sender: "bot", text: "Failed to get AI response." },
      ]);
    }

    setInput("");
  };

  return (
    <div className="sidebar-chat">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`chat-message ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <div className="chat-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI for category suggestions..."
        />
        <button onClick={handleSend}>Send</button>
      </div>

      <div className="confirmed-list">
        <h4>Confirmed Categories</h4>
        {confirmedList.length === 0 ? (
          <p style={{ fontStyle: "italic", color: "#888" }}>None yet.</p>
        ) : (
          <ul>
            {confirmedList.map((cat) => (
              <li key={cat.id}>{cat.title}</li>
            ))}
          </ul>
        )}
      </div>

      {/* ✅ Added My Tasks link here */}
      <div className="todo-link" style={{ marginTop: "1rem" }}>
        <Link to="/todo">📝 View All My Tasks</Link>
      </div>
    </div>
  );
}
