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

export function normalizeMatchStatus(rawStatus) {
  if (!rawStatus) return "insufficient_data";
  const s = String(rawStatus).toLowerCase().trim();
  if (["pass", "passed", "success", "successful", "met", "true", "yes"].includes(s)) return "pass";
  if (["fail", "failed", "unmet", "false", "no"].includes(s)) return "fail";
  if (["matched", "match"].includes(s)) return "matched";
  if (["gap"].includes(s)) return "gap";
  return "insufficient_data";
}

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

export async function classifyRequirementsBatch(requirementTexts) {
  if (!requirementTexts || requirementTexts.length === 0) return [];

  const itemsFormatted = requirementTexts
    .map((text, idx) => `${idx + 1}. "${text}"`)
    .join("\n");

  const prompt = `
Classify each of the following RFP requirements into exactly one category:

- "fact" — asks about a company fact/attribute that can be checked against a company profile (registration years, turnover, certifications, office location, blacklist status, document/format rules, submission process)
- "experience" — asks whether the company has done a specific kind of work or project before (past project experience, domain expertise, specific implementation history)

Requirements list (${requirementTexts.length} items):
${itemsFormatted}

Respond ONLY with a valid JSON array of objects in the EXACT same order as the input list, with no markdown formatting or extra text:
[
  { "category": "fact" | "experience" },
  ...
]
`;

  try {
    const raw = await askLLM(prompt, { task: "match" });
    const jsonMatch = raw.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length === requirementTexts.length) {
        return parsed.map((item) => ({
          category: item && item.category === "fact" ? "fact" : "experience",
        }));
      }
    }
  } catch (err) {
    console.warn("classifyRequirementsBatch error, falling back to defaults:", err.message);
  }

  return requirementTexts.map(() => ({ category: "experience" }));
}

export async function factCheckRequirementsBatch(factRequirements, companyProfile) {
  if (!factRequirements || factRequirements.length === 0) return [];

  const itemsFormatted = factRequirements
    .map((text, idx) => `${idx + 1}. "${text}"`)
    .join("\n");

  const prompt = `
You are checking whether a company meets specific RFP factual requirements, based ONLY on the company profile facts given below. Do not guess anything not stated.

Company profile:
${JSON.stringify(companyProfile, null, 2)}

Requirements list (${factRequirements.length} items):
${itemsFormatted}

Respond ONLY with a valid JSON array of objects in the EXACT same order as the input list, with no markdown formatting or extra text:
[
  {
    "verdict": "PASS" | "FAIL" | "INSUFFICIENT_DATA",
    "reason": "one sentence explanation"
  },
  ...
]
`;

  try {
    const raw = await askLLM(prompt, { task: "match" });
    const jsonMatch = raw.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length === factRequirements.length) {
        return parsed.map((item) => ({
          verdict: item?.verdict || "INSUFFICIENT_DATA",
          reason: item?.reason || "Factual check completed",
        }));
      }
    }
  } catch (err) {
    console.warn("factCheckRequirementsBatch error, falling back to defaults:", err.message);
  }

  return factRequirements.map(() => ({
    verdict: "INSUFFICIENT_DATA",
    reason: "Failed to parse batch fact-check response",
  }));
}

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

export async function generateDraftsBatch(draftTasks) {
  if (!draftTasks || draftTasks.length === 0) return [];

  const itemsFormatted = draftTasks
    .map((task, idx) => {
      if (task.type === "experience") {
        return `${idx + 1}. [EXPERIENCE REQUIREMENT]
Requirement: "${task.requirementText}"
Past Project Evidence: "${task.evidenceText}"
Task: Write a short, professional proposal paragraph (3-4 sentences) responding to this requirement using the past project evidence. Write in first person plural ("we", "our team").`;
      } else {
        return `${idx + 1}. [FACT REQUIREMENT]
Requirement: "${task.requirementText}"
Factual Reason: "${task.evidenceText}"
Task: Write one short, professional sentence confirming compliance with this requirement based on the fact given. Write in first person plural ("we", "our firm").`;
      }
    })
    .join("\n\n");

  const prompt = `
Write proposal responses for the following requirements list. Do not invent any facts beyond what is provided in the evidence/factual reasons.

Requirements list (${draftTasks.length} items):
${itemsFormatted}

Confirm requirements are answered exactly in the specified order. Respond ONLY with a valid JSON array of objects with "draftText" keys, with no markdown code fences or extra conversational text:
[
  { "draftText": "..." },
  ...
]
`;

  try {
    const raw = await askLLM(prompt, { task: "draft" });
    const jsonMatch = raw.match(/\[[\s\S]*?\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length === draftTasks.length) {
        return parsed.map((item) => ({
          draftText: (item?.draftText || "").trim(),
        }));
      }
    }
  } catch (err) {
    console.warn("generateDraftsBatch error, falling back to individual generation:", err.message);
  }

  const results = [];
  for (const task of draftTasks) {
    let text = "";
    try {
      if (task.type === "experience") {
        text = await generateDraftSection(task.requirementText, task.evidenceText);
      } else {
        text = await generateComplianceStatement(task.requirementText, task.evidenceText);
      }
    } catch (e) {
      console.error("Individual fallback draft generation failed for item:", task.requirementText, e);
    }
    results.push({ draftText: text.trim() });
  }

  return results;
}
