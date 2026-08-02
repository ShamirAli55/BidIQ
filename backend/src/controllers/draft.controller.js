import Match from "../models/Match.js";
import DraftSection from "../models/DraftSection.js";
import { generateDraftsBatch } from "../utils/rfpAnalysis.js";

export const generateDrafts = async (req, res) => {
  try {
    const extractionId = req.params.id;

    await DraftSection.deleteMany({ extraction: extractionId });

    const ragMatches = await Match.find({
      extraction: extractionId,
      status: "matched",
    });
    const passedFacts = await Match.find({
      extraction: extractionId,
      status: "pass",
    });

    const draftTasks = [];

    for (const m of ragMatches) {
      const topCapability = m.matchedCapabilities[0];
      if (!topCapability) continue;

      draftTasks.push({
        type: "experience",
        requirementText: m.requirementText,
        evidenceText: topCapability.documentText,
        basedOnCapability: topCapability.capId,
        source: "rag",
      });
    }

    for (const m of passedFacts) {
      draftTasks.push({
        type: "fact",
        requirementText: m.requirementText,
        evidenceText: m.factCheckResult.reason,
        basedOnCapability: null,
        source: "fact_check",
      });
    }

    if (draftTasks.length === 0) {
      return res.json({ count: 0, drafts: [] });
    }

    console.log(`[Batch Draft] Generating ${draftTasks.length} draft paragraphs in a single batch LLM call...`);
    const results = await generateDraftsBatch(draftTasks);

    const draftsToSave = [];
    for (let i = 0; i < draftTasks.length; i++) {
      const task = draftTasks[i];
      const draftResult = results[i];

      draftsToSave.push({
        extraction: extractionId,
        requirementText: task.requirementText,
        draftText: draftResult?.draftText || "",
        basedOnCapability: task.basedOnCapability,
        source: task.source,
      });
    }

    const savedDrafts = await DraftSection.insertMany(draftsToSave);
    console.log(`[Batch Draft] Completed generating drafts. Saved ${savedDrafts.length} response sections.`);

    res.json({ count: savedDrafts.length, drafts: savedDrafts });
  } catch (err) {
    console.error("Draft generation error:", err);
    res.status(500).json({ error: "Draft generation failed" });
  }
};
