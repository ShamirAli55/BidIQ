import { askLLM } from "./llm.js";

const KNOWN_SECTORS = [
  "Construction",
  "Education",
  "Energy",
  "Finance",
  "Healthcare",
  "IT Services",
  "Logistics",
  "Telecom",
];

/**
 * Classifies an RFP requirement into either 'fact' or 'experience'.
 */
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

  const raw = await askLLM(prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch[0]);
  return parsed.category;
}

/**
 * Classifies RFP title and organization into a standard industry sector.
 */
export async function classifySector(title, organization) {
  const prompt = `
Classify this RFP into exactly one sector from this list: ${KNOWN_SECTORS.join(", ")}.

Title: "${title}"
Organization: "${organization}"

Respond ONLY with valid JSON: { "sector": "..." }
Pick the closest match even if imperfect.
`;
  const raw = await askLLM(prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const parsed = JSON.parse(jsonMatch[0]);
  return KNOWN_SECTORS.includes(parsed.sector) ? parsed.sector : "IT Services";
}

/**
 * Verifies if a company profile meets a factual requirement.
 */
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

  const raw = await askLLM(prompt);
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  return JSON.parse(jsonMatch[0]);
}

/**
 * Generates a proposal draft paragraph for a requirement using capability evidence.
 */
export async function generateDraftSection(requirementText, capabilityText) {
  const prompt = `
Write a short, professional proposal paragraph (3-4 sentences) responding to this RFP requirement, using the past project experience below as supporting evidence. Write in first person plural ("our team," "we"). Do not invent facts beyond what's given.

Requirement:
"${requirementText}"

Past project evidence:
"${capabilityText}"

Return ONLY the paragraph text, no headers, no JSON.
`;
  return await askLLM(prompt);
}
