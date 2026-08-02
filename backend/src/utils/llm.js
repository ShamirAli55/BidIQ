import ollama from "ollama";

/**
 * Centralized Flexible LLM Dispatcher for BidIQ Backend.
 * Allows task-based or per-call provider selection:
 *   - Extraction & Scoring -> OpenRouter
 *   - Draft Generation    -> HuggingFace (with automatic fallback)
 *   - Matching            -> Local Ollama
 *
 * Configurable via .env:
 *   EXTRACTION_LLM_PROVIDER: "openrouter"
 *   MATCH_LLM_PROVIDER: "ollama"
 *   DRAFT_LLM_PROVIDER: "huggingface"
 *   SCORE_LLM_PROVIDER: "openrouter"
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
  const model = options.model || process.env.OLLAMA_MODEL || "phi4-mini:latest";

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

export async function askHuggingFace(prompt, options = {}) {
  const apiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
  const routerUrl = process.env.HF_ROUTER_URL || "https://router.huggingface.co/v1/chat/completions";
  const model = options.model || process.env.HF_MODEL_DEFAULT || "Qwen/Qwen2.5-7B-Instruct";

  try {
    // Attempt 1: HuggingFace Router v1 Chat Completions (OpenAI Compatible)
    const res = await fetch(routerUrl, {
      method: "POST",
      headers: {
        Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options.max_tokens || 2048,
      }),
    });

    const data = await res.json();

    if (res.ok && data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }

    // Attempt 2: Fallback to direct Inference API
    const inferenceUrl = `${process.env.HF_INFERENCE_URL || "https://api-inference.huggingface.co/models"}/${model}`;
    const infRes = await fetch(inferenceUrl, {
      method: "POST",
      headers: {
        Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: { max_new_tokens: 1000, return_full_text: false },
      }),
    });

    const infData = await infRes.json();

    if (Array.isArray(infData) && infData[0]?.generated_text) {
      return infData[0].generated_text.trim();
    } else if (infData.generated_text) {
      return infData.generated_text.trim();
    } else if (infData.choices?.[0]?.message?.content) {
      return infData.choices[0].message.content.trim();
    }

    console.warn(`[LLM] HuggingFace endpoint warning, falling back to OpenRouter:`, data || infData);
    return await askOpenRouter(prompt, options);
  } catch (err) {
    console.warn(`[LLM] HuggingFace request failed (${err.message}), falling back to OpenRouter`);
    return await askOpenRouter(prompt, options);
  }
}

export async function askLLM(prompt, options = {}) {
  let provider = options.provider;

  if (!provider && options.task) {
    const envKey = `${options.task.toUpperCase()}_LLM_PROVIDER`;
    provider = process.env[envKey];
  }

  if (!provider) {
    provider = process.env.LLM_PROVIDER || "openrouter";
  }

  provider = provider.toLowerCase().trim();

  if (provider === "ollama" || provider === "local") {
    const model = options.model || process.env.OLLAMA_MODEL || "phi4-mini:latest";
    console.log(`[LLM] Dispatching '${options.task || "general"}' to Local Ollama (${model})...`);
    return await askOllama(prompt, { ...options, model });
  } else if (provider === "huggingface" || provider === "hf") {
    console.log(`[LLM] Dispatching '${options.task || "general"}' to HuggingFace Inference...`);
    return await askHuggingFace(prompt, options);
  } else {
    const model = options.model || process.env.OPENROUTER_MODEL || "inclusionai/ling-3.0-flash:free";
    console.log(`[LLM] Dispatching '${options.task || "general"}' to OpenRouter (${model})...`);
    return await askOpenRouter(prompt, { ...options, model });
  }
}

export default askLLM;
