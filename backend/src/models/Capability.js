import mongoose from "mongoose";

const capabilitySchema = new mongoose.Schema({
  capId: String,

  domain: String,

  projectSummary: String,

  certification: String,

  yearCompleted: Number,

  contractValue: String,

  durationMonths: Number,

  clientType: String,

  createdAt: { type: Date, default: Date.now },
});

const capabilityModel = mongoose.model("Capability", capabilitySchema);

export default capabilityModel;
