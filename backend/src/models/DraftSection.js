import mongoose from "mongoose";

const draftSectionSchema = new mongoose.Schema({
  extraction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Extraction",
    required: true,
  },
  requirementText: String,
  draftText: String,
  basedOnCapability: String,
  source: { type: String, enum: ["rag", "fact_check"], default: "rag" },
  createdAt: { type: Date, default: Date.now },
});

const draftModel = mongoose.model("DraftSection", draftSectionSchema);

export default draftModel;
