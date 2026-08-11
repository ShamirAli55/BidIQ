import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import companyProfileRoutes from "./routes/companyProfile.routes.js";
import documentRoutes from "./routes/document.routes.js";
import extractionRoutes from "./routes/extraction.routes.js";
import matchRoutes from "./routes/match.routes.js";
import draftRoutes from "./routes/draft.routes.js";
import scoreRoutes from "./routes/score.routes.js";
import settingsRoutes from "./routes/settings.routes.js";
import { protect } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.get("/api/health", (_, res) => {
  res.send("Backend is working ...");
});

app.use("/api/auth", authRoutes);
app.use("/api/company-profile", companyProfileRoutes);

app.use("/api/settings", protect, settingsRoutes);
app.use("/api/documents", protect, documentRoutes);
app.use("/api/documents", protect, extractionRoutes);
app.use("/api/extractions", protect, matchRoutes);
app.use("/api/extractions", protect, draftRoutes);
app.use("/api/extractions", protect, scoreRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
