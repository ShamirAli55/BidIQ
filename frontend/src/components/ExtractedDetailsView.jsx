import React from "react";
import {
  FileText,
  Building,
  Calendar,
  DollarSign,
  Briefcase,
  Globe,
  Clock,
  CheckSquare,
  Layers,
  FileCheck2,
  Mail,
  Award,
} from "lucide-react";

export default function ExtractedDetailsView({ extraction, document }) {
  if (!extraction) {
    return (
      <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-8 text-center space-y-3">
        <FileText className="w-8 h-8 text-slate-500 mx-auto" />
        <p className="text-sm font-semibold text-slate-300">No Structured RFP Data Extracted Yet</p>
        <p className="text-xs text-slate-500 max-w-md mx-auto">
          Click "Extract RFP Information" in the top bar to analyze this document and extract structured requirements.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border border-slate-800 rounded-xl bg-slate-900 p-5 space-y-4">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          RFP Document Information Summary
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 block">RFP Number</span>
            <span className="font-semibold text-slate-200">{extraction.rfpNumber || "N/A"}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Issuing Organization</span>
            <span className="font-semibold text-slate-200 truncate block">
              {extraction.organization || "N/A"}
            </span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Submission Deadline</span>
            <span className="font-semibold text-slate-200">{extraction.submissionDeadline || "N/A"}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Estimated Budget</span>
            <span className="font-semibold text-emerald-400">{extraction.estimatedBudget || "Not Stated"}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Contract Type</span>
            <span className="font-semibold text-slate-200">{extraction.contractType || "N/A"}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Country / Region</span>
            <span className="font-semibold text-slate-200">{extraction.country || "N/A"}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Project Duration</span>
            <span className="font-semibold text-slate-200">{extraction.projectDuration || "N/A"}</span>
          </div>

          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-slate-500 block">Contact Email</span>
            <span className="font-semibold text-indigo-400 truncate block">
              {extraction.contact?.email || "N/A"}
            </span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-slate-800 rounded-xl bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>Mandatory & Compliance Requirements ({extraction.mandatoryRequirements?.length || 0})</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {extraction.mandatoryRequirements?.length > 0 ? (
              extraction.mandatoryRequirements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-md border border-slate-800">
                  <span className="text-slate-500 font-mono select-none">{idx + 1}.</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No mandatory requirements specified.</li>
            )}
          </ul>
        </div>
        <div className="border border-slate-800 rounded-xl bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span>Technical & Scope Requirements ({extraction.technicalRequirements?.length || 0})</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {extraction.technicalRequirements?.length > 0 ? (
              extraction.technicalRequirements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-md border border-slate-800">
                  <span className="text-slate-500 font-mono select-none">{idx + 1}.</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No technical requirements specified.</li>
            )}
          </ul>
        </div>
        <div className="border border-slate-800 rounded-xl bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
            <DollarSign className="w-4 h-4 text-amber-400" />
            <span>Financial & Pricing Requirements ({extraction.financialRequirements?.length || 0})</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {extraction.financialRequirements?.length > 0 ? (
              extraction.financialRequirements.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-md border border-slate-800">
                  <span className="text-slate-500 font-mono select-none">{idx + 1}.</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No financial requirements specified.</li>
            )}
          </ul>
        </div>
        <div className="border border-slate-800 rounded-xl bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-200 border-b border-slate-800 pb-2">
            <FileCheck2 className="w-4 h-4 text-cyan-400" />
            <span>Required Deliverables & Submission Documents ({extraction.deliverables?.length || 0})</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-300">
            {extraction.deliverables?.length > 0 ? (
              extraction.deliverables.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-950 p-2.5 rounded-md border border-slate-800">
                  <span className="text-slate-500 font-mono select-none">{idx + 1}.</span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))
            ) : (
              <li className="text-slate-500 italic">No deliverables specified.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
