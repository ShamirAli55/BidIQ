import Document from "../models/Document.js";
import Extraction from "../models/Extraction.js";
import { askLLM } from "../utils/llm.js";
import { buildExtractionPrompt } from "../utils/rfpAnalysis.js";

function parseExtractionJSON(rawResponse) {
  if (!rawResponse) throw new Error("Empty raw response from LLM");

  let cleaned = rawResponse
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  const targetStr = jsonMatch ? jsonMatch[0] : cleaned;

  try {
    return JSON.parse(targetStr);
  } catch (err1) {
    const sanitized = targetStr
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, " ")
      .replace(/,\s*([\}\]])/g, "$1");

    return JSON.parse(sanitized);
  }
}

export const extractRequirements = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: "Document not found" });

    const prompt = buildExtractionPrompt(document.extractedText);
    const rawResponse = await askLLM(prompt, { task: "extraction" });

    let parsed;
    try {
      parsed = parseExtractionJSON(rawResponse);
    } catch (e) {
      console.error("Extraction JSON parse error:", e.message, "Raw Response:", rawResponse);
      return res
        .status(422)
        .json({ error: "Failed to parse LLM response", rawResponse });
    }

    const extraction = await Extraction.create({
      document: document._id,
      title: parsed.title || document.originalName || "",
      organization: parsed.organization || "",
      rfpNumber: parsed.rfpNumber || "",
      country: parsed.country || "",
      submissionDeadline: parsed.submissionDeadline || "",
      projectDuration: parsed.projectDuration || "",
      contractType: parsed.contractType || "",
      estimatedBudget: parsed.estimatedBudget || "",
      mandatoryRequirements: Array.isArray(parsed.mandatoryRequirements) ? parsed.mandatoryRequirements : [],
      technicalRequirements: Array.isArray(parsed.technicalRequirements) ? parsed.technicalRequirements : [],
      financialRequirements: Array.isArray(parsed.financialRequirements) ? parsed.financialRequirements : [],
      deliverables: Array.isArray(parsed.deliverables) ? parsed.deliverables : [],
      requiredDocuments: Array.isArray(parsed.requiredDocuments) ? parsed.requiredDocuments : [],
      evaluationCriteria: Array.isArray(parsed.evaluationCriteria) ? parsed.evaluationCriteria : [],
      contact: {
        email: parsed.contact?.email || "",
        address: parsed.contact?.address || "",
      },
      rawLLMResponse: rawResponse,
    });

    res.json(extraction);
  } catch (err) {
    console.error("Extraction error:", err);
    res.status(500).json({ error: "Extraction failed" });
  }
};
