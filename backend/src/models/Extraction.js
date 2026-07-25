import mongoose from "mongoose"

const extractionSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  mandatoryRequirements: [String],
  submissionDeadline: String,
  evaluationCriteria: [String],
  rawLLMResponse: String, // keep this for debugging bad parses
  createdAt: { type: Date, default: Date.now },
});

const extractionMode = mongoose.model("Extraction", extractionSchema);
export default extractionMode;
