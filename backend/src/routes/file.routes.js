import express from "express";
import multer from "multer";
import { pdfUpload } from "../controllers/file.controller.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.post("/pdf", upload.single("rfpFile"), pdfUpload);

export default router;
