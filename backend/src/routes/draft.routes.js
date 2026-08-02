import express from "express";
import { generateDrafts } from "../controllers/draft.controller.js";

const router = express.Router();

router.post("/:id/draft", generateDrafts);

export default router;
