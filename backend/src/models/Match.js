import mongoose from "mongoose";

const matchSchema = new mongoose.Schema({
  extraction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Extraction",
    required: true,
  },
  requirementText: String,
  requirementType: {
    type: String,
    enum: ["mandatory", "technical", "financial"],
  },
  method: { type: String, enum: ["rag", "fact_check"], required: true },
  matchedCapabilities: [
    { capId: String, distance: Number, documentText: String },
  ],
  factCheckResult: { verdict: String, reason: String },
  status: {
    type: String,
    enum: ["matched", "gap", "pass", "fail", "success", "insufficient_data"],
  },

  createdAt: { type: Date, default: Date.now },
});

const matchModel = mongoose.model("Match", matchSchema);

export default matchModel;
