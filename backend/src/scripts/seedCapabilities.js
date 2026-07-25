import mongoose from "mongoose";
import xlsx from "xlsx";
import Capability from "../models/Capability.js";
import dotenv from "dotenv";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);

  const workbook = xlsx.readFile("src/data/Capability_Library.xlsx");
  const sheet = workbook.Sheets["PS1 – Capability Library"];

  // range: 2 tells it to skip the title/description rows and start reading headers at row 3 (0-indexed, so 2)
  const rawRecords = xlsx.utils.sheet_to_json(sheet, { range: 2 });

  const records = rawRecords.map((r) => ({
    capId: r["Cap ID"],
    domain: r["Domain"],
    projectSummary: r["Project Summary"],
    certification: r["Certification"],
    yearCompleted: r["Year Completed"],
    contractValue: r["Contract Value"],
    durationMonths: r["Duration (months)"],
    clientType: r["Client Type"],
  }));

  console.log("First mapped record:", records[0]); // sanity check before inserting

  await Capability.deleteMany({}); // clear old seed data if you re-run this script
  await Capability.insertMany(records);
  console.log(`Inserted ${records.length} capability records`);
  process.exit(0);
}

seed();
