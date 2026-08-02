import ollama from "ollama";

/**
 * Centralized LLM Dispatcher for BidIQ Backend.
 * Allows seamless switching between OpenRouter and Ollama via environment variables.
 *
 * Configurable via .env:
 *   LLM_PROVIDER: "openrouter" | "ollama" (Default: "openrouter")
 *   OPENROUTER_API_KEY: OpenRouter API key
 *   OPENROUTER_MODEL: Default OpenRouter model (Default: "inclusionai/ling-3.0-flash:free")
 *   OLLAMA_MODEL: Default Ollama model (Default: "qwen2.5:3b")
 *   OLLAMA_HOST: Ollama host address (Default: "http://127.0.0.1:11434")
 */

export async function askOpenRouter(prompt, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured in .env file.");
  }

  const model = options.model || process.env.OPENROUTER_MODEL || "inclusionai/ling-3.0-flash:free";

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:5000",
      "X-Title": "BidIQ Backend",
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: options.max_tokens || 8000,
    }),
  });

  const data = await res.json();

  if (!res.ok || data.error) {
    const errorMsg = data.error?.message || JSON.stringify(data.error || data);
    throw new Error(`OpenRouter error (${model}): ${errorMsg}`);
  }

  return data.choices?.[0]?.message?.content ?? "";
}

export async function askOllama(prompt, options = {}) {
  const model = options.model || process.env.OLLAMA_MODEL || "qwen2.5:3b";

  try {
    const response = await ollama.chat({
      model: model,
      messages: [{ role: "user", content: prompt }],
    });
    return response.message?.content ?? "";
  } catch (err) {
    console.error(`[LLM] Ollama error with model '${model}':`, err);
    throw new Error(`Ollama error (${model}): ${err.message}`);
  }
}

export async function askLLM(prompt, options = {}) {
  const provider = (options.provider || process.env.LLM_PROVIDER || "openrouter")
    .toLowerCase()
    .trim();

  if (provider === "ollama") {
    const model = options.model || process.env.OLLAMA_MODEL || "qwen2.5:3b";
    console.log(`[LLM] Dispatching request to Ollama using model '${model}'...`);
    return await askOllama(prompt, { ...options, model });
  } else {
    const model = options.model || process.env.OPENROUTER_MODEL || "inclusionai/ling-3.0-flash:free";
    console.log(`[LLM] Dispatching request to OpenRouter using model '${model}'...`);
    return await askOpenRouter(prompt, { ...options, model });
  }
}

export default askLLM;
