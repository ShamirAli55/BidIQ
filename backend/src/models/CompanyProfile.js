import mongoose from "mongoose";
const companyProfileSchema = new mongoose.Schema({
  companyName: String,
  yearsRegistered: Number,
  avgTurnoverLast2Years: String,
  minTurnoverAnyYear: String,
  hasPakistanOffice: Boolean,
  isBlacklisted: Boolean,
  certifications: [String],
  canProvideAuditedStatements: Boolean,
  canPasswordProtectSubmissions: Boolean,
  canSubmitBothHardAndSoftCopy: Boolean,
  notes: String, // catch-all for anything not modeled yet
});

const companyProfileMdel = mongoose.model(
  "CompanyProfile",
  companyProfileSchema,
);

export default companyProfileMdel;
