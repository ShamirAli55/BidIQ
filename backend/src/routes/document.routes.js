import express from "express";
import multer from "multer";
import {
  listDocuments,
  pdfUpload,
  getWorkspace,
} from "../controllers/document.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/", listDocuments);
router.post("/upload", upload.single("rfpFile"), pdfUpload);
router.get("/:id/workspace", getWorkspace);

export default router;
