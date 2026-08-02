import Match from "../models/Match.js";
import DraftSection from "../models/DraftSection.js";
import {
  generateDraftSection,
  generateComplianceStatement,
} from "../utils/rfpAnalysis.js";

/**
 * POST /api/extractions/:id/draft
 * Generates proposal draft sections for matched capabilities and passed facts.
 */
export const generateDrafts = async (req, res) => {
  try {
    const ragMatches = await Match.find({
      extraction: req.params.id,
      status: "matched",
    });
    const passedFacts = await Match.find({
      extraction: req.params.id,
      status: "pass",
    });
    const drafts = [];

    for (const m of ragMatches) {
      const topCapability = m.matchedCapabilities[0];
      if (!topCapability) continue;

      const draftText = await generateDraftSection(
        m.requirementText,
        topCapability.documentText
      );

      drafts.push(
        await DraftSection.create({
          extraction: req.params.id,
          requirementText: m.requirementText,
          draftText: draftText.trim(),
          basedOnCapability: topCapability.capId,
          source: "rag",
        })
      );
    }

    for (const m of passedFacts) {
      const draftText = await generateComplianceStatement(
        m.requirementText,
        m.factCheckResult.reason
      );

      drafts.push(
        await DraftSection.create({
          extraction: req.params.id,
          requirementText: m.requirementText,
          draftText: draftText.trim(),
          basedOnCapability: null,
          source: "fact_check",
        })
      );
    }

    res.json({ count: drafts.length, drafts });
  } catch (err) {
    console.error("Draft generation error:", err);
    res.status(500).json({ error: "Draft generation failed" });
  }
};
