import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Cpu,
  ShieldCheck,
  Award,
} from "lucide-react";

export default function RequirementCard({ match }) {
  const [expanded, setExpanded] = useState(false);

  const getStatusBadge = (status) => {
    switch (status) {
      case "matched":
      case "pass":
        return {
          label: status === "matched" ? "Matched" : "Passed",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "gap":
      case "fail":
        return {
          label: status === "gap" ? "Gap Identified" : "Failed Fact-Check",
          color: "bg-rose-500/10 text-rose-400 border-rose-500/30",
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
      case "insufficient_data":
      default:
        return {
          label: "Needs Review",
          color: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
    }
  };

  const badge = getStatusBadge(match.status);
  const isRag = match.method === "rag";

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 hover:bg-slate-900/70 transition-all overflow-hidden">
      {/* Summary Header Row */}
      <div
        onClick={() => setExpanded(!expanded)}
        className="p-4 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
      >
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badge.color}`}
            >
              {badge.icon}
              {badge.label}
            </span>

            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
              {isRag ? (
                <>
                  <Cpu className="w-3 h-3 text-indigo-400" />
                  RAG Vector
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  Fact Check
                </>
              )}
            </span>

            {match.requirementType && (
              <span className="text-[11px] text-slate-400 font-medium capitalize px-2 py-0.5 bg-slate-950 rounded border border-slate-800">
                {match.requirementType}
              </span>
            )}
          </div>

          <p className="text-sm font-medium text-slate-100 leading-snug">
            {match.requirementText}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isRag && match.matchedCapabilities && match.matchedCapabilities[0] && (
            <div className="hidden md:flex flex-col items-end text-xs">
              <span className="text-slate-400 text-[10px]">Vector Dist</span>
              <span className="font-mono text-indigo-300 font-semibold">
                {match.matchedCapabilities[0].distance}
              </span>
            </div>
          )}
          <button className="text-slate-400 hover:text-white p-1 rounded-lg">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded Detail Panel */}
      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-800/80 bg-slate-950/40 text-xs space-y-3">
          {isRag ? (
            <div>
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold mb-1">
                <Award className="w-3.5 h-3.5" />
                Matched Capability Details:
              </div>
              {match.matchedCapabilities && match.matchedCapabilities.length > 0 ? (
                <div className="space-y-2 mt-2">
                  {match.matchedCapabilities.map((cap, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1"
                    >
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Capability ID: <strong className="text-slate-200">{cap.capId}</strong></span>
                        <span className="font-mono text-indigo-300">Distance Score: {cap.distance}</span>
                      </div>
                      <p className="text-slate-200 text-xs leading-relaxed italic">
                        "{cap.documentText}"
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 italic">No matching capability records found in vector database.</p>
              )}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold mb-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Fact-Check Verdict & Rationale:
              </div>
              {match.factCheckResult ? (
                <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Verdict:</span>
                    <span className="font-semibold text-slate-100 capitalize">
                      {match.factCheckResult.verdict}
                    </span>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {match.factCheckResult.reason || "No detailed rationale provided."}
                  </p>
                </div>
              ) : (
                <p className="text-slate-400 italic">Fact check result unavailable.</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
