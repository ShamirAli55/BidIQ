import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileCheck,
  Search,
  Filter,
} from "lucide-react";

export default function ComplianceMatrixTable({ matches = [], matchSummary = {} }) {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  const getStatusConfig = (status) => {
    switch (status) {
      case "matched":
      case "pass":
        return {
          label: "Compliant",
          badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case "gap":
      case "fail":
        return {
          label: "Gap",
          badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
      case "insufficient_data":
      default:
        return {
          label: "Under Review",
          badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
          icon: <AlertTriangle className="w-3.5 h-3.5" />,
        };
    }
  };

  const filteredMatches = matches.filter((item) => {
    const status = item.status;
    let matchesFilter = true;
    if (filter === "compliant") matchesFilter = status === "matched" || status === "pass";
    if (filter === "gap") matchesFilter = status === "gap" || status === "fail";
    if (filter === "review") matchesFilter = status === "insufficient_data";

    const matchesSearch = item.requirementText
      ?.toLowerCase()
      .includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              filter === "all"
                ? "bg-slate-800 text-white border border-slate-700"
                : "text-slate-400 hover:text-white"
            }`}
          >
            All Items ({matches.length})
          </button>
          <button
            onClick={() => setFilter("compliant")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              filter === "compliant"
                ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Compliant ({matchSummary.matched || 0})
          </button>
          <button
            onClick={() => setFilter("gap")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              filter === "gap"
                ? "bg-rose-950/80 text-rose-300 border border-rose-800"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Gaps ({matchSummary.gaps || 0})
          </button>
          <button
            onClick={() => setFilter("review")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
              filter === "review"
                ? "bg-amber-950/80 text-amber-300 border border-amber-800"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Under Review ({matchSummary.needsReview || 0})
          </button>
        </div>

        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search requirements..."
            className="w-full pl-8 pr-3 py-1 bg-slate-950 border border-slate-800 rounded-md text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700"
          />
        </div>
      </div>
      <div className="border border-slate-800 rounded-xl bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">#</th>
                <th className="py-3 px-4 min-w-[280px]">RFP Requirement</th>
                <th className="py-3 px-4 w-32">Category</th>
                <th className="py-3 px-4 w-40">Compliance Status</th>
                <th className="py-3 px-4 w-12 text-center">Detail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {filteredMatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500 italic">
                    {matches.length === 0
                      ? "No compliance analysis data available. Run 'Run Compliance Check' to populate the matrix."
                      : "No items match the selected filter query."}
                  </td>
                </tr>
              ) : (
                filteredMatches.map((item, index) => {
                  const statusConfig = getStatusConfig(item.status);
                  const isExpanded = expandedId === item._id;

                  return (
                    <React.Fragment key={item._id || index}>
                      <tr
                        onClick={() => setExpandedId(isExpanded ? null : item._id)}
                        className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                      >
                        <td className="py-3.5 px-4 text-center font-mono text-slate-500">
                          {index + 1}
                        </td>
                        <td className="py-3.5 px-4 font-medium leading-relaxed">
                          {item.requirementText}
                        </td>
                        <td className="py-3.5 px-4 capitalize text-slate-400">
                          {item.requirementType || "General"}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold border ${statusConfig.badgeClass}`}
                          >
                            {statusConfig.icon}
                            {statusConfig.label}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center text-slate-400">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 mx-auto" />
                          ) : (
                            <ChevronDown className="w-4 h-4 mx-auto" />
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-slate-950/60 border-b border-slate-800">
                          <td colSpan={5} className="p-4 space-y-2 text-xs">
                            <div className="font-semibold text-slate-300">
                              Verification Justification & Capability References:
                            </div>

                            {item.matchedCapabilities && item.matchedCapabilities.length > 0 ? (
                              <div className="space-y-2 pl-2 border-l-2 border-slate-700">
                                {item.matchedCapabilities.map((cap, capIdx) => (
                                  <div key={capIdx} className="space-y-1">
                                    <p className="text-slate-300 italic">
                                      "{cap.documentText}"
                                    </p>
                                    <p className="text-[11px] text-slate-500 font-mono">
                                      Reference Code: {cap.capId}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            ) : item.factCheckResult ? (
                              <div className="pl-2 border-l-2 border-slate-700 space-y-1">
                                <p className="text-slate-300">
                                  {item.factCheckResult.reason || "Verification passed standard company criteria."}
                                </p>
                              </div>
                            ) : (
                              <p className="text-slate-500 italic">
                                No additional rationale or evidence attached.
                              </p>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
