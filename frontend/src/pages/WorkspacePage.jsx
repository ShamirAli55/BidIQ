import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useWorkspaceStore } from "../stores/workspaceStore";
import Navbar from "../components/Navbar";
import RequirementCard from "../components/RequirementCard";
import DraftSectionCard from "../components/DraftSectionCard";
import WinProbabilityCard from "../components/WinProbabilityCard";
import { WorkspaceSkeleton } from "../components/SkeletonLoader";
import {
  ArrowLeft,
  FileText,
  Building,
  Calendar,
  DollarSign,
  Clock,
  Globe,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Layers,
  Cpu,
  PenTool,
  TrendingUp,
  Loader2,
  FileCheck,
  Filter,
} from "lucide-react";

export default function WorkspacePage() {
  const { id } = useParams();
  const {
    document,
    extraction,
    matchSummary,
    matches,
    drafts,
    scoreData,
    loadingWorkspace,
    extracting,
    matching,
    drafting,
    scoring,
    fetchWorkspace,
    extractRequirements,
    matchRequirements,
    generateDrafts,
    fetchScore,
  } = useWorkspaceStore();

  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (id) {
      fetchWorkspace(id);
    }
  }, [id, fetchWorkspace]);

  // Filter compliance matches based on tab
  const filteredMatches = matches.filter((m) => {
    if (activeTab === "all") return true;
    if (activeTab === "matched") return m.status === "matched" || m.status === "pass";
    if (activeTab === "gaps") return m.status === "gap" || m.status === "fail";
    if (activeTab === "needsReview") return m.status === "insufficient_data";
    return true;
  });

  const handleExtract = async () => {
    await extractRequirements(id);
  };

  const handleMatch = async () => {
    if (!extraction?._id) return;
    await matchRequirements(extraction._id, id);
  };

  const handleDraft = async () => {
    if (!extraction?._id) return;
    await generateDrafts(extraction._id, id);
  };

  const handleScore = async () => {
    if (!extraction?._id) return;
    await fetchScore(extraction._id);
  };

  if (loadingWorkspace) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <WorkspaceSkeleton />
        </main>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
          <div className="text-rose-400 font-semibold text-lg">RFP Document Not Found</div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Dashboard</span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Link & Title */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to RFP List</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Status:</span>
            {extraction ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Extracted
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                Raw PDF Uploaded
              </span>
            )}
          </div>
        </div>

        {/* 1. Workspace Header Info Panel */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                <FileText className="w-4 h-4" />
                <span>RFP Workspace Analysis</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight leading-snug">
                {extraction?.title || document.originalName}
              </h1>
              {extraction?.organization && (
                <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
                  <Building className="w-4 h-4 text-slate-500" />
                  <span>{extraction.organization}</span>
                </div>
              )}
            </div>

            {/* Workflow Pipeline Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Button 1: Extract */}
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white shadow-lg shadow-indigo-500/20 transition-all cursor-pointer"
              >
                {extracting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Extracting LLM...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>{extraction ? "Re-Extract Requirements" : "Extract Requirements"}</span>
                  </>
                )}
              </button>

              {/* Button 2: Match (only if extraction exists) */}
              {extraction && (
                <button
                  onClick={handleMatch}
                  disabled={matching}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                >
                  {matching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Matching RAG...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4" />
                      <span>{matches.length > 0 ? "Re-Match Capabilities" : "Match Capabilities"}</span>
                    </>
                  )}
                </button>
              )}

              {/* Button 3: Draft (only if matches exist) */}
              {matches.length > 0 && (
                <button
                  onClick={handleDraft}
                  disabled={drafting}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white shadow-lg shadow-purple-500/20 transition-all cursor-pointer"
                >
                  {drafting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Drafting...</span>
                    </>
                  ) : (
                    <>
                      <PenTool className="w-4 h-4" />
                      <span>{drafts.length > 0 ? "Re-Generate Drafts" : "Generate Drafts"}</span>
                    </>
                  )}
                </button>
              )}

              {/* Button 4: Score (only if matches exist) */}
              {matches.length > 0 && (
                <button
                  onClick={handleScore}
                  disabled={scoring}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  {scoring ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scoring...</span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      <span>Predict Win Probability</span>
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Details Row */}
          {extraction && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 pt-4 border-t border-slate-800/80 text-xs">
              <div>
                <span className="text-slate-500 block">RFP Number</span>
                <span className="font-semibold text-slate-200">{extraction.rfpNumber || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Deadline</span>
                <span className="font-semibold text-slate-200">{extraction.submissionDeadline || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Estimated Budget</span>
                <span className="font-semibold text-indigo-300">{extraction.estimatedBudget || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Contract Type</span>
                <span className="font-semibold text-slate-200">{extraction.contractType || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Country</span>
                <span className="font-semibold text-slate-200">{extraction.country || "N/A"}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Project Duration</span>
                <span className="font-semibold text-slate-200">{extraction.projectDuration || "N/A"}</span>
              </div>
            </div>
          )}
        </div>

        {/* 2. Stat Cards Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Total Requirements</p>
              <p className="text-xl font-bold text-white font-mono">{matchSummary.total}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Matched Capabilities</p>
              <p className="text-xl font-bold text-emerald-400 font-mono">{matchSummary.matched}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Capability Gaps</p>
              <p className="text-xl font-bold text-rose-400 font-mono">{matchSummary.gaps}</p>
            </div>
          </div>

          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Needs Review</p>
              <p className="text-xl font-bold text-amber-400 font-mono">{matchSummary.needsReview}</p>
            </div>
          </div>
        </div>

        {/* 3. Win Probability Card (if score exists) */}
        {scoreData && <WinProbabilityCard scoreData={scoreData} />}

        {/* 4. Compliance Checklist Section */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-indigo-400" />
                Compliance Matrix & Requirements Match
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Filter and inspect individual requirements matched against vector capabilities & fact checks
              </p>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab("all")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "all"
                    ? "bg-indigo-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({matches.length})
              </button>
              <button
                onClick={() => setActiveTab("matched")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "matched"
                    ? "bg-emerald-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Matched ({matchSummary.matched})
              </button>
              <button
                onClick={() => setActiveTab("gaps")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "gaps"
                    ? "bg-rose-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Gaps ({matchSummary.gaps})
              </button>
              <button
                onClick={() => setActiveTab("needsReview")}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${
                  activeTab === "needsReview"
                    ? "bg-amber-600 text-white shadow"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Needs Review ({matchSummary.needsReview})
              </button>
            </div>
          </div>

          {/* List of Requirement Cards */}
          {filteredMatches.length === 0 ? (
            <div className="p-8 text-center bg-slate-950/40 border border-dashed border-slate-800 rounded-xl space-y-2">
              <p className="text-sm text-slate-400">
                {matches.length === 0
                  ? "No requirements matched yet. Click 'Extract Requirements' and 'Match Capabilities' above."
                  : "No requirements found under this filter tab."}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMatches.map((match) => (
                <RequirementCard key={match._id} match={match} />
              ))}
            </div>
          )}
        </div>

        {/* 5. Generated Proposal Draft Sections */}
        {drafts && drafts.length > 0 && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <PenTool className="w-5 h-5 text-purple-400" />
                  Generated Proposal Response Drafts
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  AI-generated proposal responses based on matched capabilities and compliance facts
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {drafts.length} Paragraphs
              </span>
            </div>

            <div className="space-y-4">
              {drafts.map((draft, idx) => (
                <DraftSectionCard key={draft._id || idx} draft={draft} index={idx} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
