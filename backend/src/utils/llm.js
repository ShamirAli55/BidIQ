import ollama from "ollama";

export async function askOpenRouter(prompt, options = {}) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured.");
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
    throw new Error(`Ollama error (${model}): ${err.message}`);
  }
}

export async function askHuggingFaceDirect(prompt, options = {}) {
  const apiKey = process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY;
  const routerUrl = process.env.HF_ROUTER_URL || "https://router.huggingface.co/v1/chat/completions";
  const model = options.model || process.env.HF_MODEL_DEFAULT || "Qwen/Qwen2.5-7B-Instruct";

  try {
    const res = await fetch(routerUrl, {
      method: "POST",
      headers: {
        Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        max_tokens: options.max_tokens || 4096,
      }),
    });

    const data = await res.json();
    if (res.ok && data.choices?.[0]?.message?.content) {
      return data.choices[0].message.content.trim();
    }
  } catch (e) {
    console.warn(`[LLM] HF Router request failed, trying direct inference: ${e.message}`);
  }

  const inferenceUrl = `${process.env.HF_INFERENCE_URL || "https://api-inference.huggingface.co/models"}/${model}`;
  const res = await fetch(inferenceUrl, {
    method: "POST",
    headers: {
      Authorization: apiKey ? `Bearer ${apiKey}` : undefined,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 2048, return_full_text: false },
    }),
  });

  const data = await res.json();
  if (Array.isArray(data) && data[0]?.generated_text) {
    return data[0].generated_text.trim();
  } else if (data.generated_text) {
    return data.generated_text.trim();
  } else if (data.choices?.[0]?.message?.content) {
    return data.choices[0].message.content.trim();
  }

  throw new Error(`HuggingFace API response was unparseable: ${JSON.stringify(data)}`);
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

  const primaryProvider = provider.toLowerCase().trim();

  const providersToTry = [];
  if (primaryProvider === "huggingface" || primaryProvider === "hf") {
    providersToTry.push("huggingface", "openrouter");
  } else if (primaryProvider === "ollama" || primaryProvider === "local") {
    providersToTry.push("ollama", "huggingface", "openrouter");
  } else {
    providersToTry.push("openrouter", "huggingface");
  }

  let finalError = null;

  for (const prov of providersToTry) {
    try {
      if (prov === "ollama") {
        const model = options.model || process.env.OLLAMA_MODEL || "phi4-mini:latest";
        console.log(`[LLM] Dispatching '${options.task || "general"}' to Local Ollama (${model})...`);
        return await askOllama(prompt, { ...options, model });
      } else if (prov === "huggingface") {
        console.log(`[LLM] Dispatching '${options.task || "general"}' to HuggingFace Inference...`);
        return await askHuggingFaceDirect(prompt, options);
      } else {
        const model = options.model || process.env.OPENROUTER_MODEL || "inclusionai/ling-3.0-flash:free";
        console.log(`[LLM] Dispatching '${options.task || "general"}' to OpenRouter (${model})...`);
        return await askOpenRouter(prompt, { ...options, model });
      }
    } catch (err) {
      console.warn(`[LLM] Provider '${prov}' failed: ${err.message}. Trying next available fallback...`);
      finalError = err;
    }
  }

  throw new Error(`All LLM providers failed. Last error: ${finalError?.message}`);
}

export default askLLM;
