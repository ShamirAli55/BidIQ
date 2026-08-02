import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useWorkspaceStore } from "../stores/workspaceStore";
import { useDocumentStore } from "../stores/documentStore";
import Navbar from "../components/Navbar";
import ExtractedDetailsView from "../components/ExtractedDetailsView";
import ComplianceMatrixTable from "../components/ComplianceMatrixTable";
import DraftSectionCard from "../components/DraftSectionCard";
import WinProbabilityCard from "../components/WinProbabilityCard";
import { WorkspaceSkeleton } from "../components/SkeletonLoader";
import {
  ArrowLeft,
  FileText,
  Building,
  PenTool,
  TrendingUp,
  Loader2,
  BarChart3,
  ShieldCheck,
  FolderOpen,
  ChevronRight,
  FileCheck,
} from "lucide-react";

export default function WorkspacePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { documents, fetchDocuments } = useDocumentStore();
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

  const [activeSection, setActiveSection] = useState("overview");

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  useEffect(() => {
    if (id) {
      fetchWorkspace(id);
    }
  }, [id, fetchWorkspace]);

  const handleWorkspaceChange = (e) => {
    const selectedId = e.target.value;
    if (selectedId && selectedId !== id) {
      navigate(`/workspace/${selectedId}`);
    }
  };

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
          <div className="text-slate-300 font-semibold text-lg">RFP Document Workspace Not Found</div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Documents Repository</span>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-5 space-y-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Link
                to="/"
                className="hover:text-slate-200 transition-colors flex items-center gap-1 font-medium"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Documents</span>
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
              <span className="text-slate-300 font-medium truncate max-w-[200px] sm:max-w-xs">
                {document.originalName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-medium">Switch Workspace:</span>
              <select
                value={id}
                onChange={handleWorkspaceChange}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-md px-2.5 py-1 focus:outline-none focus:border-slate-700 cursor-pointer max-w-[180px] sm:max-w-[240px] truncate"
              >
                {documents.map((doc) => (
                  <option key={doc._id} value={doc._id}>
                    {doc.originalName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                {extraction?.title || document.originalName}
              </h1>
              {extraction?.organization && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-slate-500" />
                  <span>{extraction.organization}</span>
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-50 text-slate-200 border border-slate-700/70 transition-colors cursor-pointer"
              >
                {extracting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileText className="w-3.5 h-3.5 text-slate-400" />}
                <span>{extraction ? "Re-Extract" : "Extract Data"}</span>
              </button>

              {extraction && (
                <button
                  onClick={handleMatch}
                  disabled={matching}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-50 text-slate-200 border border-slate-700/70 transition-colors cursor-pointer"
                >
                  {matching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{matches.length > 0 ? "Re-Check Compliance" : "Check Compliance"}</span>
                </button>
              )}

              {matches.length > 0 && (
                <button
                  onClick={handleDraft}
                  disabled={drafting}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700/80 disabled:opacity-50 text-slate-200 border border-slate-700/70 transition-colors cursor-pointer"
                >
                  {drafting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <PenTool className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{drafts.length > 0 ? "Re-Generate Drafts" : "Generate Drafts"}</span>
                </button>
              )}

              {matches.length > 0 && (
                <button
                  onClick={handleScore}
                  disabled={scoring}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold shadow transition-colors cursor-pointer"
                >
                  {scoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  <span>Calculate Score</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-900/70 border border-slate-800/80 p-3 rounded-xl space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium block">Total Requirements</span>
            <span className="text-base font-bold text-white font-mono">{matchSummary.total}</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 p-3 rounded-xl space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium block">Compliant</span>
            <span className="text-base font-bold text-emerald-400 font-mono">{matchSummary.matched}</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 p-3 rounded-xl space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium block">Gaps</span>
            <span className="text-base font-bold text-rose-400 font-mono">{matchSummary.gaps}</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800/80 p-3 rounded-xl space-y-0.5">
            <span className="text-[11px] text-slate-400 font-medium block">Under Review</span>
            <span className="text-base font-bold text-amber-400 font-mono">{matchSummary.needsReview}</span>
          </div>
        </div>
        <div className="border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveSection("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === "overview"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>RFP Overview & Requirements</span>
          </button>

          <button
            onClick={() => setActiveSection("compliance")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === "compliance"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            <span>Compliance Matrix ({matches.length})</span>
          </button>

          <button
            onClick={() => setActiveSection("drafts")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === "drafts"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <PenTool className="w-3.5 h-3.5" />
            <span>Proposal Response Drafts ({drafts.length})</span>
          </button>

          <button
            onClick={() => setActiveSection("evaluation")}
            className={`flex items-center gap-2 px-4 py-2.5 border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
              activeSection === "evaluation"
                ? "border-indigo-500 text-white"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Bid Score & Win Probability</span>
          </button>
        </div>
        <div className="pt-2">
          {activeSection === "overview" && (
            <ExtractedDetailsView extraction={extraction} document={document} />
          )}

          {activeSection === "compliance" && (
            <ComplianceMatrixTable matches={matches} matchSummary={matchSummary} />
          )}

          {activeSection === "drafts" && (
            <div className="space-y-4">
              {drafts.length === 0 ? (
                <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-8 text-center space-y-3">
                  <PenTool className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No Proposal Drafts Generated Yet</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Run compliance check first, then click "Generate Drafts" to create response paragraphs.
                  </p>
                </div>
              ) : (
                drafts.map((draft, idx) => (
                  <DraftSectionCard key={draft._id || idx} draft={draft} index={idx} />
                ))
              )}
            </div>
          )}

          {activeSection === "evaluation" && (
            <div className="space-y-6">
              {scoreData ? (
                <WinProbabilityCard scoreData={scoreData} />
              ) : (
                <div className="border border-slate-800 bg-slate-900/60 rounded-xl p-8 text-center space-y-3">
                  <TrendingUp className="w-8 h-8 text-slate-500 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">No Bid Score Assessment Calculated Yet</p>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Click "Calculate Score" to evaluate compliance percentage and win probability.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
