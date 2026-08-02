import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import documentRoutes from "./routes/document.routes.js";
import companyProfileRoutes from "./routes/companyProfile.routes.js";
import authRoutes from "./routes/auth.routes.js";
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

// Auth Routes
app.use("/api/auth", authRoutes);

// Protected Mounted Routes
app.use("/api/upload", protect, documentRoutes);
app.use("/api/extractions", protect, documentRoutes);
app.use("/api/company-profile", companyProfileRoutes);
app.use("/api/documents", protect, documentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});

