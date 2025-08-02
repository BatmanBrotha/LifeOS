// server/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();

app.use(cors());
app.use(bodyParser.json());

app.post("/ask", async (req, res) => {
  const prompt = req.body.prompt;

  const response = await fetch("http://localhost:11434/api/generate", {
    method: "POST",
    body: JSON.stringify({
      model: "mistral",
      prompt,
      stream: false,
    }),
    headers: { "Content-Type": "application/json" },
  });

  const data = await response.json();
  res.json({ reply: data.response });
});

app.listen(3001, () => console.log("🔥 AI server running on http://localhost:3001"));
