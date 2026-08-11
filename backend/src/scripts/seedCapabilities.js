import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import Capability from "../models/Capability.js";
import dotenv from "dotenv";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CSV_PATH = path.join(__dirname, "../data/Capability_Library.csv");

async function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());

  return lines.slice(1).map((line) => {
    const values = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    values.push(current.trim());

    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i] ?? "";
    });
    return row;
  });
}

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const rows = await parseCSV(CSV_PATH);

  const records = rows.map((r) => ({
    bidId: r["Bid ID"],
    client: r["Client"],
    sector: r["Sector"],
    budget: r["Budget"],
    budgetM: parseFloat(r["Budget_M"]) || 0,
    score: parseFloat(r["Score (%)"]) || 0,
    outcome: r["Outcome"],
    responseTimeHrs: parseFloat(r["Response Time (hrs)"]) || 0,
    compliancePercent: parseFloat(r["Compliance %"]) || 0,
    docPages: parseInt(r["Doc Pages"]) || 0,
    gapsFound: parseInt(r["Gaps Found"]) || 0,
    bidManager: r["Bid Manager"],
    submissionDate: r["Submission Date"],
    submissionMonth: parseInt(r["Submission_Month"]) || 0,
    submissionQuarter: parseInt(r["Submission_Quarter"]) || 0,
  }));

  await Capability.deleteMany({});
  await Capability.insertMany(records);
  console.log(`✅ Inserted ${records.length} bid history records into MongoDB`);

  mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
