import { askOpenRouter as askOllama } from "./llm.js";

export async function generateComplianceStatement(
  requirementText,
  factCheckReason,
) {
  const prompt = `
Write one short, professional sentence for a proposal document confirming compliance with this requirement, based on the fact given. Write in first person plural ("we," "our firm"). Do not invent details beyond what's stated.

Requirement:
"${requirementText}"

Fact:
"${factCheckReason}"

Return ONLY the sentence, no other text.
`;
  return await askOllama(prompt);
}
