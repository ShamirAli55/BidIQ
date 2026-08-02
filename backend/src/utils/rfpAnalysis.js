import { askLLM } from "./llm.js";
import { matchRequirement } from "./aiService.js";

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

const RAG_THRESHOLD = 350;

/**
 * Builds the structured JSON prompt for RFP document extraction.
 */
export function buildExtractionPrompt(text) {
  return `
Extract the following structured information from this RFP/tender document.
Return ONLY valid JSON matching this exact shape, no other text, no markdown code fences:

{
  "title": "",
  "organization": "",
  "rfpNumber": "",
  "country": "",
  "submissionDeadline": "",
  "projectDuration": "",
  "contractType": "",
  "estimatedBudget": "",
  "mandatoryRequirements": [],
  "technicalRequirements": [],
  "financialRequirements": [],
  "deliverables": [],
  "requiredDocuments": [],
  "evaluationCriteria": [],
  "contact": { "email": "", "address": "" }
}

Rules:
- estimatedBudget: total contract value, budget, or estimated cost if explicitly stated (e.g. "PKR 424M"). Leave empty string if not stated — do not calculate or guess.
- mandatoryRequirements: eligibility/compliance conditions a bidder must meet to qualify
- technicalRequirements: scope of work, methodology, deliverable specifications
- financialRequirements: pricing/financial submission rules
- deliverables: concrete outputs the winning bidder must produce
- requiredDocuments: documents that must be submitted with the proposal
- evaluationCriteria: how the bid will be scored
- If a field is not present, use an empty string or empty array — do not guess.

RFP text:
${text}
`;
}

/**
 * Normalizes fact check or RAG status strings into standard Match Schema enum values.
 */
export function normalizeMatchStatus(rawStatus) {
  if (!rawStatus) return "insufficient_data";
  const s = String(rawStatus).toLowerCase().trim();
  if (["pass", "passed", "success", "successful", "met", "true", "yes"].includes(s)) return "pass";
  if (["fail", "failed", "unmet", "false", "no"].includes(s)) return "fail";
  if (["matched", "match"].includes(s)) return "matched";
  if (["gap"].includes(s)) return "gap";
  return "insufficient_data";
}

/**
 * Evaluates RAG vector distance results to decide if requirement is matched or a gap.
 */
export function decideMatchStatus(matchedCapabilities) {
  if (!matchedCapabilities || !matchedCapabilities.length) return "gap";

  const best = matchedCapabilities[0].distance;
  const ABSOLUTE_CEILING = 400;

  if (best > ABSOLUTE_CEILING) return "gap";

  const others = matchedCapabilities.slice(1).map((m) => m.distance);
  const avgOthers = others.length
    ? others.reduce((a, b) => a + b, 0) / others.length
    : best;

  const relativelyStrong = best < avgOthers * 0.95;
  return relativelyStrong || best < RAG_THRESHOLD ? "matched" : "gap";
}

/**
 * Performs RAG Vector Matching against vector store capabilities.
 */
export async function ragMatch(text, requirementType) {
  const result = await matchRequirement(text);
  const matchedCapabilities = result.ids[0].map((capId, i) => ({
    capId,
    distance: result.distances[0][i],
    documentText: result.documents[0][i],
  }));
  const status = decideMatchStatus(matchedCapabilities);
  return { requirementType, method: "rag", matchedCapabilities, status };
}

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

  try {
    const raw = await askLLM(prompt, { task: "match" });
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return "experience";
    const parsed = JSON.parse(jsonMatch[0]);
    return parsed.category || "experience";
  } catch (err) {
    console.warn("classifyRequirement JSON parse warning:", err.message);
    return "experience";
  }
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
  try {
    const raw = await askLLM(prompt, { task: "score" });
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return "IT Services";
    const parsed = JSON.parse(jsonMatch[0]);
    return KNOWN_SECTORS.includes(parsed.sector) ? parsed.sector : "IT Services";
  } catch (err) {
    console.warn("classifySector JSON parse warning:", err.message);
    return "IT Services";
  }
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

  try {
    const raw = await askLLM(prompt, { task: "match" });
    const jsonMatch = raw.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return { verdict: "INSUFFICIENT_DATA", reason: "Parsing failed" };
    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    console.warn("factCheckRequirement JSON parse warning:", err.message);
    return { verdict: "INSUFFICIENT_DATA", reason: "Failed to parse fact-check verdict" };
  }
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
  return await askLLM(prompt, { task: "draft" });
}

/**
 * Generates a single sentence compliance statement for a factual requirement.
 */
export async function generateComplianceStatement(requirementText, factCheckReason) {
  const prompt = `
Write one short, professional sentence for a proposal document confirming compliance with this requirement, based on the fact given. Write in first person plural ("we," "our firm"). Do not invent details beyond what's stated.

Requirement:
"${requirementText}"

Fact:
"${factCheckReason}"

Return ONLY the sentence, no other text.
`;
  return await askLLM(prompt, { task: "draft" });
}
