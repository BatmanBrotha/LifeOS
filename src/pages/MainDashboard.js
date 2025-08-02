import { useState } from "react";

export default function MainDashboard() {
  const [viewType, setViewType] = useState("cards"); // "cards", "grid", or "list"
  const [aiExpanded, setAiExpanded] = useState(false);

  return (
    <div className="dashboard-page">

      {/* Part 2: AI Search Bar */}
      <div className={`ai-bar ${aiExpanded ? "expanded" : ""}`}>
        {aiExpanded ? (
          <div className="ai-input-area">
            <input type="text" placeholder="Ask me anything..." />
            <button onClick={() => setAiExpanded(false)}>✖</button>
          </div>
        ) : (
          <button className="ai-toggle" onClick={() => setAiExpanded(true)}>
            🤖 AI Assistant
          </button>
        )}
      </div>

      {/* Part 3: View Switcher */}
      <div className="view-switcher">
        <select onChange={(e) => setViewType(e.target.value)} value={viewType}>
          <option value="cards">Card View</option>
          <option value="grid">Grid View</option>
          <option value="list">List View</option>
        </select>
      </div>

      {/* Part 1: Scrollable Task/Cards Area */}
      <div className={`cards-area ${viewType}`}>
        {/* Cards will go here */}
        <p>[ 🧪 Sample Cards will appear here later... ]</p>
      </div>
    </div>
  );
}
