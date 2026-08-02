import mongoose from "mongoose";

const draftSectionSchema = new mongoose.Schema({
  extraction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Extraction",
    required: true,
  },
  requirementText: String,
  draftText: String,
  basedOnCapability: String, // capId used as evidence
  createdAt: { type: Date, default: Date.now },
});

const draftModel = mongoose.model("DraftSection", draftSectionSchema);

export default draftModel;
