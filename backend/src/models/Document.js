import mongoose from "mongoose"

const documentSchema = new mongoose.Schema({
  originalName: String,
  filePath: String,
  extractedText: String,
  pageCount: Number,
  uploadedAt: { type: Date, default: Date.now },
});

const documentModel = mongoose.model('Document', documentSchema);

export default documentModel