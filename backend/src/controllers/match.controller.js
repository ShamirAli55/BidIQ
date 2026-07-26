import Extraction from "../models/Extraction.js";
import Match from "../models/Match.js";
import CompanyProfile from "../models/CompanyProfile.js";
import { matchRequirement } from "../utils/aiService.js";
import { factCheckRequirement } from "../utils/factCheck.js";
import { askOpenRouter as askOllama } from "../utils/openrouter.js";
import { classifyRequirement } from "../utils/classifyRequirement.js";

export const matchExtraction = async (req, res) => {
  try {
    const extraction = await Extraction.findById(req.params.id);
    if (!extraction)
      return res.status(404).json({ error: "Extraction not found" });

    const companyProfile = await CompanyProfile.findOne();
    const matches = [];

    // always RAG: technical requirements
    for (const text of extraction.technicalRequirements) {
      const result = await matchRequirement(text);
      const matchedCapabilities = result.ids[0].map((capId, i) => ({
        capId,
        distance: result.distances[0][i],
        documentText: result.documents[0][i],
      }));
      const status = matchedCapabilities[0]?.distance < 350 ? "matched" : "gap";

      matches.push(
        await Match.create({
          extraction: extraction._id,
          requirementText: text,
          requirementType: "technical",
          method: "rag",
          matchedCapabilities,
          status,
        }),
      );
    }

    // mandatory + financial: classify first, then route
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

    for (const req of toClassify) {
      const category = await classifyRequirement(req.text);

      if (category === "experience") {
        const result = await matchRequirement(req.text);
        const matchedCapabilities = result.ids[0].map((capId, i) => ({
          capId,
          distance: result.distances[0][i],
          documentText: result.documents[0][i],
        }));
        const status =
          matchedCapabilities[0]?.distance < 350 ? "matched" : "gap";

        matches.push(
          await Match.create({
            extraction: extraction._id,
            requirementText: req.text,
            requirementType: req.type,
            method: "rag",
            matchedCapabilities,
            status,
          }),
        );
      } else {
        const result = await factCheckRequirement(req.text, companyProfile);
        matches.push(
          await Match.create({
            extraction: extraction._id,
            requirementText: req.text,
            requirementType: req.type,
            method: "fact_check",
            factCheckResult: result,
            status: result.verdict.toLowerCase(),
          }),
        );
      }
    }

    res.json({ count: matches.length, matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Matching failed" });
  }
};
