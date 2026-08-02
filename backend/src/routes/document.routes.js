// routes/document.routes.js
import express from "express";
import multer from "multer";
import {
  pdfUpload,
  extractRequirements,
  matchExtraction,
  generateDrafts,
  scoreBid,
} from "../controllers/document.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/upload", upload.single("rfpFile"), pdfUpload);
router.post("/:id/extract", extractRequirements);
router.post("/:id/match", matchExtraction);
router.post("/:id/draft", generateDrafts);
router.get("/:id/score", scoreBid);

export default router;