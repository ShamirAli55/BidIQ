import express from "express";
import { matchExtraction } from "../controllers/match.controller.js";

const router = express.Router();

router.post("/:id/match", matchExtraction);

export default router;
