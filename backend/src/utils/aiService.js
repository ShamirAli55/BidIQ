const AI_SERVICE_URL = process.env.AI_SERVICE_URL || "http://localhost:8000";

export async function matchRequirement(requirementText) {
  const res = await fetch(`${AI_SERVICE_URL}/match`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requirementText }),
  });

  if (!res.ok) {
    throw new Error(`AI service error: ${res.status}`);
  }

  return res.json();
}
