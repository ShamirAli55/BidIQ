import Extraction from "../models/Extraction.js";
import Match from "../models/Match.js";
import { matchRequirement } from "../utils/aiService.js";

export const matchExtraction = async (req, res) => {
  try {
    const extraction = await Extraction.findById(req.params.id);
    if (!extraction)
      return res.status(404).json({ error: "Extraction not found" });

    // combine all requirement types into one list, tagged with their type
    const allRequirements = [
      ...extraction.mandatoryRequirements.map((text) => ({
        text,
        type: "mandatory",
      })),
      ...extraction.technicalRequirements.map((text) => ({
        text,
        type: "technical",
      })),
      ...extraction.financialRequirements.map((text) => ({
        text,
        type: "financial",
      })),
    ];

    const matches = [];

    for (const req of allRequirements) {
      const result = await matchRequirement(req.text);

      const matchedCapabilities = result.ids[0].map((capId, i) => ({
        capId,
        distance: result.distances[0][i],
        documentText: result.documents[0][i],
      }));

      const match = await Match.create({
        extraction: extraction._id,
        requirementText: req.text,
        requirementType: req.type,
        matchedCapabilities,
      });

      matches.push(match);
    }

    res.json({ count: matches.length, matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Matching failed" });
  }
};
