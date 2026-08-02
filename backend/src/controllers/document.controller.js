import fs from "fs";
import { createRequire } from "module";
import Document from "../models/Document.js";
import Extraction from "../models/Extraction.js";
import Match from "../models/Match.js";
import DraftSection from "../models/DraftSection.js";
import { cleanPdfText, normalizeParagraphs } from "../utils/pdfUtils.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

/**
 * GET /api/documents
 * List all uploaded RFP documents sorted by uploadedAt desc.
 */
export const listDocuments = async (req, res) => {
  try {
    const documents = await Document.find(
      {},
      "originalName pageCount uploadedAt"
    ).sort({ uploadedAt: -1 });
    res.json(documents);
  } catch (err) {
    console.error("List documents error:", err);
    res.status(500).json({ error: "Failed to list documents" });
  }
};

/**
 * GET /api/documents/:id/workspace
 * Retrieves full workspace state: Document, Extraction, Match Summary, Matches, and Drafts.
 */
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
          (m) => m.status === "matched" || m.status === "pass"
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
    console.error("Workspace load error:", err);
    res.status(500).json({ error: "Failed to load workspace" });
  }
};

/**
 * POST /api/documents/upload
 * Process uploaded RFP PDF document, clean text, and save to DB.
 */
export const pdfUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file provided" });
    }

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
