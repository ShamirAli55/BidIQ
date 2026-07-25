export async function matchRequirement(requirementText) {
  const res = await fetch("http://localhost:8000/match", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requirementText }),
  });

  if (!res.ok) {
    throw new Error(`AI service error: ${res.status}`);
  }

  return res.json();
}
