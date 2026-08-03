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
    const rawResponseTimeHrs = Math.round(
      (Date.now() - (document.uploadedAt || Date.now())) / (1000 * 60 * 60)
    );
    // Use at least 24 hrs so the model isn't fed a zero for freshly-uploaded docs
    const responseTimeHrs = rawResponseTimeHrs < 1 ? 24 : rawResponseTimeHrs;
    const parsedBudget = parseBudget(extraction.estimatedBudget);
    // Use a typical mid-range budget fallback (~50M) when RFP doesn't state one,
    // so the model scores on compliance/gaps rather than defaulting to Loss.
    const budget = parsedBudget > 0 ? parsedBudget : 50000000;
    const sector = await classifySector(
      extraction.title,
      extraction.organization
    );

    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        budget,
        response_time_hrs: responseTimeHrs,
        compliance_percent: stats.compliance_percent,
        doc_pages: stats.doc_pages,
        gaps_found: stats.gaps_found,
        sector,
      }),
    });

    const result = await response.json();
    res.json({
      stats,
      budget: parsedBudget > 0 ? parsedBudget : null, // null = not stated in RFP
      responseTimeHrs: rawResponseTimeHrs,             // show real elapsed time in UI
      sector,
      prediction: result,
    });
  } catch (err) {
    console.error("Scoring error:", err);
    res.status(500).json({ error: "Scoring failed" });
  }
};
