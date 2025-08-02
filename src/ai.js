/**
 * This is the central hub for AI interactions.
 * It will receive messages from the UI and route them to the appropriate AI service.
 */

/**
 * Gets a response from the AI by calling a local Mistral model.
 * @param {string} userInput - The user's input message.
 * @param {Array} chatHistory - The entire conversation history (not used by this prompt, but good practice).
 * @returns {Promise<string>} - A promise that resolves to the AI's response text.
 */
export const getAiResponse = async (userInput, chatHistory) => {
  const prompt = `
You are an assistant that ONLY outputs category names.

Given any user input, generate 3 to 6 relevant life categories such as:
gym, placement, dsa, frontend, productivity, mental health, etc.

Each category must be a short word or phrase (max 2–3 words).
Put each category on its own line.
No punctuation, no bullets, no numbers, no explanations.

You must also follow commands like:
“remove [category name]” – when the user asks to remove a specific category, exclude it from your response.

Just print the updated category names, one per line.
No comments or confirmations.

also, if i just say one single word, just output that....

User: ${userInput}
`;

  try {
    const res = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        prompt,
        stream: false,
      }),
    });

    if (!res.ok) {
        throw new Error(`API request failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.response.trim();

  } catch (error) {
    console.error("Error fetching from local Mistral model:", error);
    // Provide a user-friendly error message
    return "Sorry, I couldn't connect to the local AI model. Please make sure it's running.";
  }
};
