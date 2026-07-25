import mongoose from "mongoose";

const extractionSchema = new mongoose.Schema({
  document: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },
  title: String,
  organization: String,
  rfpNumber: String,
  country: String,
  submissionDeadline: String,
  projectDuration: String,
  contractType: String,
  mandatoryRequirements: [String],
  technicalRequirements: [String],
  financialRequirements: [String],
  deliverables: [String],
  requiredDocuments: [String],
  evaluationCriteria: [String],
  contact: {
    email: String,
    address: String,
  },
  rawLLMResponse: String,
  createdAt: { type: Date, default: Date.now },
});

const extractionMode = mongoose.model("Extraction", extractionSchema);
export default extractionMode;
