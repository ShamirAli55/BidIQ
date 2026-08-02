import fs from "fs";
import { createRequire } from "module";
import Document from "../models/Document.js";
import Extraction from "../models/Extraction.js";
import Match from "../models/Match.js";
import DraftSection from "../models/DraftSection.js";
import CompanyProfile from "../models/CompanyProfile.js";
import { askLLM } from "../utils/llm.js";
import { matchRequirement } from "../utils/aiService.js";
import {
  classifyRequirement,
  classifySector,
  factCheckRequirement,
  generateDraftSection,
} from "../utils/rfpAnalysis.js";
import { computeBidStats, parseBudget } from "../utils/bidUtils.js";
import { cleanPdfText, normalizeParagraphs } from "../utils/pdfUtils.js";
import { generateComplianceStatement } from "../utils/generateComplianceStatement.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const RAG_THRESHOLD = 350;

// --- Helper to normalize fact check status strings into valid Match Schema enum values ---
function normalizeMatchStatus(rawStatus) {
  if (!rawStatus) return "insufficient_data";
  const s = String(rawStatus).toLowerCase().trim();
  if (
    ["pass", "passed", "success", "successful", "met", "true", "yes"].includes(
      s,
    )
  )
    return "pass";
  if (["fail", "failed", "unmet", "false", "no"].includes(s)) return "fail";
  if (["matched", "match"].includes(s)) return "matched";
  if (["gap"].includes(s)) return "gap";
  return "insufficient_data";
}

function decideStatus(matchedCapabilities) {
  if (!matchedCapabilities.length) return "gap";

  const best = matchedCapabilities[0].distance;
  const ABSOLUTE_CEILING = 400; // nothing worse than this is ever a real match

  if (best > ABSOLUTE_CEILING) return "gap";

  const others = matchedCapabilities.slice(1).map((m) => m.distance);
  const avgOthers = others.length
    ? others.reduce((a, b) => a + b, 0) / others.length
    : best;

  const relativelyStrong = best < avgOthers * 0.95;
  return relativelyStrong || best < RAG_THRESHOLD ? "matched" : "gap";
}

// --- Helper for RAG Vector Matching ---
async function ragMatch(text, requirementType) {
  const result = await matchRequirement(text);
  const matchedCapabilities = result.ids[0].map((capId, i) => ({
    capId,
    distance: result.distances[0][i],
    documentText: result.documents[0][i],
  }));
  const status = decideStatus(matchedCapabilities);
  return { requirementType, method: "rag", matchedCapabilities, status };
}

// --- Prompt Builder for Document Extraction ---
function buildExtractionPrompt(text) {
  return `
Extract the following structured information from this RFP/tender document.
Return ONLY valid JSON matching this exact shape, no other text, no markdown code fences:

{
  "title": "",
  "organization": "",
  "rfpNumber": "",
  "country": "",
  "submissionDeadline": "",
  "projectDuration": "",
  "contractType": "",
  "estimatedBudget": "",
  "mandatoryRequirements": [],
  "technicalRequirements": [],
  "financialRequirements": [],
  "deliverables": [],
  "requiredDocuments": [],
  "evaluationCriteria": [],
  "contact": { "email": "", "address": "" }
}

Rules:
- estimatedBudget: total contract value, budget, or estimated cost if explicitly stated (e.g. "PKR 424M"). Leave empty string if not stated — do not calculate or guess.
- mandatoryRequirements: eligibility/compliance conditions a bidder must meet to qualify
- technicalRequirements: scope of work, methodology, deliverable specifications
- financialRequirements: pricing/financial submission rules
- deliverables: concrete outputs the winning bidder must produce
- requiredDocuments: documents that must be submitted with the proposal
- evaluationCriteria: how the bid will be scored
- If a field is not present, use an empty string or empty array — do not guess.

RFP text:
${text}
`;
}

export const listDocuments = async (req, res) => {
  try {
    const documents = await Document.find(
      {},
      "originalName pageCount uploadedAt",
    ).sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to list documents" });
  }
};
export const getWorkspace = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: "Document not found" });

    const extraction = await Extraction.findOne({
      document: document._id,
    }).sort({ createdAt: -1 });
    let matches = [];
    let drafts = [];

    if (extraction) {
      matches = await Match.find({ extraction: extraction._id });
      drafts = await DraftSection.find({ extraction: extraction._id });
    }

    res.json({
      document,
      extraction,
      matchSummary: {
        total: matches.length,
        matched: matches.filter(
          (m) => m.status === "matched" || m.status === "pass",
        ).length,
        gaps: matches.filter((m) => m.status === "gap" || m.status === "fail")
          .length,
        needsReview: matches.filter((m) => m.status === "insufficient_data")
          .length,
      },
      matches,
      drafts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load workspace" });
  }
};
// 1. PDF File Upload
export const pdfUpload = async (req, res) => {
  try {
    const fileBuffer = fs.readFileSync(req.file.path);
    const data = await pdfParse(fileBuffer);
    const cleaned = cleanPdfText(data.text);
    const finalText = normalizeParagraphs(cleaned);

    const doc = await Document.create({
      originalName: req.file.originalname,
      filePath: req.file.path,
      extractedText: finalText,
      pageCount: data.numpages,
    });

    res.json({
      message: "File saved",
      documentId: doc._id,
      textPreview: finalText.slice(0, 200),
    });
  } catch (err) {
    console.error("PDF upload error:", err);
    res.status(500).json({ error: "PDF processing failed" });
  }
};

// 2. Extract Requirements via LLM
export const extractRequirements = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: "Document not found" });

    const prompt = buildExtractionPrompt(document.extractedText);
    const rawResponse = await askLLM(prompt, { task: "extraction" });

    let parsed;
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
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

// 3. Match Extraction Requirements against Capabilities & Facts
export const matchExtraction = async (req, res) => {
  try {
    const extraction = await Extraction.findById(req.params.id);
    if (!extraction)
      return res.status(404).json({ error: "Extraction not found" });

    const companyProfile = await CompanyProfile.findOne();
    const matches = [];

    for (const text of extraction.technicalRequirements) {
      const result = await ragMatch(text, "technical");
      matches.push(
        await Match.create({
          extraction: extraction._id,
          requirementText: text,
          ...result,
        }),
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

    for (const reqItem of toClassify) {
      const category = await classifyRequirement(reqItem.text);

      if (category === "experience") {
        const result = await ragMatch(reqItem.text, reqItem.type);
        matches.push(
          await Match.create({
            extraction: extraction._id,
            requirementText: reqItem.text,
            ...result,
          }),
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
          }),
        );
      }
    }

    res.json({ count: matches.length, matches });
  } catch (err) {
    console.error("Matching error:", err);
    res.status(500).json({ error: "Matching failed" });
  }
};

// 4. Generate Proposal Draft Sections
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
        topCapability.documentText,
      );

      drafts.push(
        await DraftSection.create({
          extraction: req.params.id,
          requirementText: m.requirementText,
          draftText: draftText.trim(),
          basedOnCapability: topCapability.capId,
          source: "rag",
        }),
      );
    }

    for (const m of passedFacts) {
      const draftText = await generateComplianceStatement(
        m.requirementText,
        m.factCheckResult.reason,
      );

      drafts.push(
        await DraftSection.create({
          extraction: req.params.id,
          requirementText: m.requirementText,
          draftText: draftText.trim(),
          basedOnCapability: null,
          source: "fact_check",
        }),
      );
    }

    res.json({ count: drafts.length, drafts });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Draft generation failed" });
  }
};

// 5. Score Bid & Win Probability Prediction
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
      (Date.now() - (document.uploadedAt || Date.now())) / (1000 * 60 * 60),
    );
    const budget = parseBudget(extraction.estimatedBudget);
    const sector = await classifySector(
      extraction.title,
      extraction.organization,
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
    res.json({ stats, budget, responseTimeHrs, sector, prediction: result });
  } catch (err) {
    console.error("Scoring error:", err);
    res.status(500).json({ error: "Scoring failed" });
  }
};
