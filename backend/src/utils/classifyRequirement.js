import { askOpenRouter as askOllama } from "./openrouter.js";

export async function classifyRequirement(requirementText) {
  const prompt = `
Classify this RFP requirement into exactly one category:

- "fact" — asks about a company fact/attribute that can be checked against a company profile (registration years, turnover, certifications, office location, blacklist status, document format rules, submission process)
- "experience" — asks whether the company has done a specific kind of work or project before (past project experience, domain expertise, specific implementation history)

Requirement:
"${requirementText}"

Respond ONLY with valid JSON, no other text:
{ "category": "fact" | "experience" }
`;

  const raw = await askOllama(prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.category;
}