import { askOpenRouter as askOllama } from "./openrouter.js";

export async function factCheckRequirement(requirementText, companyProfile) {
  const prompt = `
You are checking whether a company meets a specific RFP requirement, based only on the company profile facts given below. Do not guess anything not stated.

Company profile:
${JSON.stringify(companyProfile, null, 2)}

Requirement:
"${requirementText}"

Respond ONLY with valid JSON, no other text:
{
  "verdict": "PASS" | "FAIL" | "INSUFFICIENT_DATA",
  "reason": "one sentence explanation"
}
`;

  const raw = await askOllama(prompt); // aliased to askOpenRouter
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
}
