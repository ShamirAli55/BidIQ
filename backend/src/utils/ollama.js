import ollama from "ollama";

export const askOllama = async (prompt) => {
  try {
    const response = await ollama.chat({
      model: "qwen2.5:3b",
      messages: [{ role: "user", content: prompt }],
    });
    return response.message.content;
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Extraction failed" });
  }
};
