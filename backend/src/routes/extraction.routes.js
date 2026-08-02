import express from "express";
import { extractRequirements } from "../controllers/extraction.controller.js";

const router = express.Router();

router.post("/:id/extract", extractRequirements);

export default router;
