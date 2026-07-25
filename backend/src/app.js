import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";
import FileRoutes from "./routes/file.routes.js";
import extractionRoutes from "./routes/extraction.routes.js";
import matchRoutes from "./routes/match.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (_, res) => {
  res.send("Backend is working ...");
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", FileRoutes);
app.use("/api/documents", extractionRoutes);
app.use("/api/extractions", matchRoutes);

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on ${PORT}`);
});
