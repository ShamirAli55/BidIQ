import mongoose from "mongoose"

const matchSchema = new mongoose.Schema({
  extraction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Extraction",
    required: true,
  },
  requirementText: { type: String, required: true },
  requirementType: {
    type: String,
    enum: ["mandatory", "technical", "financial"],
    required: true,
  },
  matchedCapabilities: [
    {
      capId: String,
      distance: Number,
      documentText: String,
    },
  ],
  status: {
    type: String,
    enum: ["matched", "gap", "review"],
    default: "review",
  },
  createdAt: { type: Date, default: Date.now },
});

const matchModel = mongoose.model("Match", matchSchema);

export default matchModel