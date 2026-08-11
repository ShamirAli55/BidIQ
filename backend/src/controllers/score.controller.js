import Document from "../models/Document.js";
import Extraction from "../models/Extraction.js";
import Match from "../models/Match.js";
import { classifySector } from "../utils/rfpAnalysis.js";
import { computeBidStats, parseBudget } from "../utils/bidUtils.js";

export const scoreBid = async (req, res) => {
  try {
    const extraction = await Extraction.findById(req.params.id);
    if (!extraction)
      return res.status(404).json({ error: "Extraction not found" });

    const document = await Document.findById(extraction.document);
    const matches = await Match.find({ extraction: req.params.id });
    if (!matches.length)
      return res
        .status(404)
        .json({ error: "No matches found for this extraction" });

    const stats = computeBidStats(matches, document.pageCount || 0);
    const responseTimeHrs = Math.round(
      (Date.now() - (document.uploadedAt || Date.now())) / (1000 * 60 * 60)
    );
    const budget = parseBudget(extraction.estimatedBudget);
    const sector = await classifySector(
      extraction.title,
      extraction.organization
    );

    const aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000";
    const response = await fetch(`${aiServiceUrl}/predict`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budget,
        response_time_hrs: responseTimeHrs,
        compliance_percent: stats.compliance_percent,
        doc_pages: stats.doc_pages,
        gaps_found: stats.gaps_found,
        sector,
        submission_deadline: extraction.submissionDeadline || null,
      }),
    });

    const result = await response.json();
    res.json({ stats, budget, responseTimeHrs, sector, prediction: result });
  } catch (err) {
    console.error("Scoring error:", err);
    res.status(500).json({ error: "Scoring failed" });
  }
};
