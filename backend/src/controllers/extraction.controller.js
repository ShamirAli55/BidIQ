import Document from "../models/Document.js";
import Extraction from "../models/Extraction.js";
import { askLLM } from "../utils/llm.js";
import { buildExtractionPrompt } from "../utils/rfpAnalysis.js";

/**
 * POST /api/documents/:id/extract
 * Extracts structured RFP information via LLM.
 */
export const extractRequirements = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: "Document not found" });

    const prompt = buildExtractionPrompt(document.extractedText);
    const rawResponse = await askLLM(prompt, { task: "extraction" });

    let parsed;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*?\}/);
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
      estimatedBudget: parsed.estimatedBudget || "",
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
    console.error("Extraction error:", err);
    res.status(500).json({ error: "Extraction failed" });
  }
};
