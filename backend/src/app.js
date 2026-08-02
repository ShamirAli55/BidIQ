import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import documentRoutes from "./routes/document.routes.js";
import companyProfileRoutes from "./routes/companyProfile.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (_, res) => {
  res.send("Backend is working ...");
});

// Mounted Routes (100% backward compatible endpoint signatures)
app.use("/api/upload", documentRoutes);
app.use("/api/extractions", documentRoutes);
app.use("/api/company-profile", companyProfileRoutes);
app.use("/api/documents", documentRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on port ${PORT}`);
});
