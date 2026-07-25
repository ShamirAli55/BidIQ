export async function askOpenRouter(prompt) {
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "inclusionai/ling-3.0-flash:free",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`OpenRouter error: ${JSON.stringify(data.error)}`);
  }

  return data.choices?.[0]?.message?.content ?? "";
}