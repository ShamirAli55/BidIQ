import Extraction from "../models/Extraction.js";
import Match from "../models/Match.js";
import CompanyProfile from "../models/CompanyProfile.js";
import {
  ragMatch,
  normalizeMatchStatus,
  classifyRequirement,
  factCheckRequirement,
} from "../utils/rfpAnalysis.js";

/**
 * POST /api/extractions/:id/match
 * Matches requirements against vector capabilities and company profile facts.
 */
export const matchExtraction = async (req, res) => {
  try {
    const extraction = await Extraction.findById(req.params.id);
    if (!extraction)
      return res.status(404).json({ error: "Extraction not found" });

    const companyProfile = await CompanyProfile.findOne();
    const matches = [];

    // 1. Technical Requirements -> RAG matching
    for (const text of extraction.technicalRequirements) {
      const result = await ragMatch(text, "technical");
      matches.push(
        await Match.create({
          extraction: extraction._id,
          requirementText: text,
          ...result,
        })
      );
    }

    // 2. Mandatory & Financial Requirements -> Classify & Check
    const toClassify = [
      ...extraction.mandatoryRequirements.map((text) => ({
        text,
        type: "mandatory",
      })),
      ...extraction.financialRequirements.map((text) => ({
        text,
        type: "financial",
      })),
    ];

    for (const reqItem of toClassify) {
      const category = await classifyRequirement(reqItem.text);

      if (category === "experience") {
        const result = await ragMatch(reqItem.text, reqItem.type);
        matches.push(
          await Match.create({
            extraction: extraction._id,
            requirementText: reqItem.text,
            ...result,
          })
        );
      } else {
        const result = await factCheckRequirement(reqItem.text, companyProfile);
        matches.push(
          await Match.create({
            extraction: extraction._id,
            requirementText: reqItem.text,
            requirementType: reqItem.type,
            method: "fact_check",
            factCheckResult: result,
            status: normalizeMatchStatus(result.verdict),
          })
        );
      }
    }

    res.json({ count: matches.length, matches });
  } catch (err) {
    console.error("Matching error:", err);
    res.status(500).json({ error: "Matching failed" });
  }
};
