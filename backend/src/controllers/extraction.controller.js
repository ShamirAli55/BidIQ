// import { askOllama } from "../utils/ollama.js";
import { askOpenRouter as askOllama } from "../utils/openrouter.js";
import Extraction from "../models/Extraction.js";
import Document from "../models/Document.js";

function buildPrompt(text) {
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
  "mandatoryRequirements": [],
  "technicalRequirements": [],
  "financialRequirements": [],
  "deliverables": [],
  "requiredDocuments": [],
  "evaluationCriteria": [],
  "contact": {
    "email": "",
    "address": ""
  }
}

Rules:
- mandatoryRequirements: eligibility/compliance conditions a bidder must meet to qualify (registration, turnover, experience, blacklist status, etc.)
- technicalRequirements: scope of work, methodology, deliverable specifications, technical scope items
- financialRequirements: pricing/financial submission rules (currency, taxes, payment terms, validity period)
- deliverables: concrete outputs the winning bidder must produce
- requiredDocuments: documents that must be submitted with the proposal (certificates, forms, annexures)
- evaluationCriteria: how the bid will be scored, including point allocations if stated
- If a field is not present in the text, use an empty string or empty array — do not guess or hallucinate.

RFP text:
${text}
`;
}

export const extractRequirements = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: "Document not found" });

    const prompt = buildPrompt(document.extractedText);
    const rawResponse = await askOllama(prompt);

    let parsed;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
      parsed = JSON.parse(jsonMatch[0]);
    } catch (e) {
      return res
        .status(422)
        .json({ error: "Failed to parse LLM response", rawResponse });
    }

    const extraction = await Extraction.create({
      document: document._id,
      title: parsed.title || "",
      organization: parsed.organization || "",
      rfpNumber: parsed.rfpNumber || "",
      country: parsed.country || "",
      submissionDeadline: parsed.submissionDeadline || "",
      projectDuration: parsed.projectDuration || "",
      contractType: parsed.contractType || "",
      mandatoryRequirements: parsed.mandatoryRequirements || [],
      technicalRequirements: parsed.technicalRequirements || [],
      financialRequirements: parsed.financialRequirements || [],
      deliverables: parsed.deliverables || [],
      requiredDocuments: parsed.requiredDocuments || [],
      evaluationCriteria: parsed.evaluationCriteria || [],
      contact: {
        email: parsed.contact?.email || "",
        address: parsed.contact?.address || "",
      },
      rawLLMResponse: rawResponse,
    });

    res.json(extraction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Extraction failed" });
  }
};
