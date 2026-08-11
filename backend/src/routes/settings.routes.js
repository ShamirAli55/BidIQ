import express from "express";
import { getSettings, upsertSettings } from "../controllers/settings.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protect, getSettings);
router.put("/", protect, upsertSettings);

export default router;
