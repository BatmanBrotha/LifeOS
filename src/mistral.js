/**
 * This file contains the direct API client for the local Mistral model.
 */

/**
 * Sends a prompt to the local Mistral API and returns the response.
 * @param {string} prompt - The complete prompt to send to the model.
 * @returns {Promise<string>} - The raw text response from the model.
 */
export async function askMistral(prompt) {
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
  return data.response;
}
