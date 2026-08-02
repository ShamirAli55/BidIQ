import express from "express";
import { scoreBid } from "../controllers/score.controller.js";

const router = express.Router();

router.get("/:id/score", scoreBid);

export default router;
