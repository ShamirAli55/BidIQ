import Extraction from "../models/Extraction.js";
import Match from "../models/Match.js";
import CompanyProfile from "../models/CompanyProfile.js";
import {
  ragMatch,
  normalizeMatchStatus,
  classifyRequirementsBatch,
  factCheckRequirementsBatch,
} from "../utils/rfpAnalysis.js";

export const matchExtraction = async (req, res) => {
  try {
    const extraction = await Extraction.findById(req.params.id);
    if (!extraction)
      return res.status(404).json({ error: "Extraction not found" });

    const companyProfile = (await CompanyProfile.findOne()) || {};
    const matches = [];

    await Match.deleteMany({ extraction: extraction._id });

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

    if (toClassify.length > 0) {
      const classifications = await classifyRequirementsBatch(
        toClassify.map((item) => item.text)
      );

      const experienceItems = [];
      const factItems = [];

      toClassify.forEach((item, index) => {
        const category = classifications[index]?.category || "experience";
        if (category === "experience") {
          experienceItems.push(item);
        } else {
          factItems.push(item);
        }
      });

      for (const reqItem of experienceItems) {
        const result = await ragMatch(reqItem.text, reqItem.type);
        matches.push(
          await Match.create({
            extraction: extraction._id,
            requirementText: reqItem.text,
            ...result,
          })
        );
      }

      if (factItems.length > 0) {
        const factResults = await factCheckRequirementsBatch(
          factItems.map((item) => item.text),
          companyProfile
        );

        for (let i = 0; i < factItems.length; i++) {
          const reqItem = factItems[i];
          const result = factResults[i] || {
            verdict: "INSUFFICIENT_DATA",
            reason: "Batch fact check default fallback",
          };

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
    }

    res.json({ count: matches.length, matches });
  } catch (err) {
    console.error("Matching error:", err);
    res.status(500).json({ error: "Matching failed" });
  }
};
