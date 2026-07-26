import express from "express";
import { createProfile } from "../controllers/companyProfile.controller.js";

const router = express.Router();

router.post("/", createProfile);

export default router;
