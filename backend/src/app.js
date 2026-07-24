import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors({ origin: "http://localhost:5173" }));

app.get("/api/health", (_, res) => {
  res.send("Backend is working ...");
});

app.use("/api/auth", authRoutes);

const PORT = process.env.PORT;

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server is running on ${PORT}`);
});
