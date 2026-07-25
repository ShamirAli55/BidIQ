import fs from "fs";
import { createRequire } from "module";
import documenModel from "../models/Document.js";
import { normalizeParagraphs, cleanPdfText } from "../utils/pdfUtils.js";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

export const pdfUpload = async (req, res) => {
  const fileBuffer = fs.readFileSync(req.file.path);

  const data = await pdfParse(fileBuffer);

  const cleaned = cleanPdfText(data.text);

  const finalText = normalizeParagraphs(cleaned);

  const doc = await documenModel.create({
    originalName: req.file.originalname,
    filePath: req.file.path,
    extractedText: finalText,
  });

  res.json({
    message: "File saved",
    documentId: doc._id,
    textPreview: finalText.slice(0, 200),
  });
};
