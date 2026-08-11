import mongoose from "mongoose";

const capabilitySchema = new mongoose.Schema({
  bidId: { type: String, unique: true },
  client: String,
  sector: String,
  budget: String,
  budgetM: Number,
  score: Number,
  outcome: String,
  responseTimeHrs: Number,
  compliancePercent: Number,
  docPages: Number,
  gapsFound: Number,
  bidManager: String,
  submissionDate: String,
  submissionMonth: Number,
  submissionQuarter: Number,
});

const Capability = mongoose.model("Capability", capabilitySchema);

export default Capability;
