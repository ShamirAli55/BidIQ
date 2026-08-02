import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useDocumentStore } from "../stores/documentStore";
import Navbar from "../components/Navbar";
import UploadModal from "../components/UploadModal";
import { DashboardSkeleton } from "../components/SkeletonLoader";
import {
  UploadCloud,
  FileText,
  Calendar,
  Layers,
  ChevronRight,
  Plus,
  Search,
  Sparkles,
  RefreshCw,
} from "lucide-react";

export default function DashboardPage() {
  const { documents, loading, fetchDocuments } = useDocumentStore();
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const filteredDocuments = documents.filter((doc) =>
    doc.originalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl relative overflow-hidden">
          <div className="space-y-1 z-10">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                RFP Documents Repository
              </h1>
              <span className="px-2.5 py-0.5 text-xs font-semibold text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                {documents.length} Uploaded
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-xl">
              Upload RFP PDFs to extract requirements, evaluate compliance against company capabilities, and predict bid win probability.
            </p>
          </div>

          <div className="flex items-center gap-3 z-10">
            <button
              onClick={() => fetchDocuments()}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Refresh list"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload New RFP</span>
            </button>
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search RFP by document name..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
          </div>
        </div>
        {loading ? (
          <DashboardSkeleton />
        ) : filteredDocuments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 p-12 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-md">
              <h3 className="text-lg font-bold text-white">
                {searchTerm ? "No matching documents found" : "Upload your first RFP"}
              </h3>
              <p className="text-sm text-slate-400">
                {searchTerm
                  ? "Try searching for another filename or clear the search query."
                  : "Get started by uploading an RFP PDF document. BidIQ will analyze requirements and draft winning proposals."}
              </p>
            </div>
            {!searchTerm && (
              <button
                onClick={() => setIsUploadOpen(true)}
                className="mt-2 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 cursor-pointer hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>Upload RFP PDF</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocuments.map((doc) => (
              <Link
                key={doc._id}
                to={`/workspace/${doc._id}`}
                className="group rounded-2xl border border-slate-800 bg-slate-900/50 hover:bg-slate-900 hover:border-indigo-500/40 p-5 space-y-4 transition-all duration-200 shadow-lg hover:shadow-indigo-500/5 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="px-2.5 py-0.5 text-[11px] font-semibold text-slate-300 bg-slate-800 border border-slate-700 rounded-full">
                      {doc.pageCount ? `${doc.pageCount} Pages` : "PDF"}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2 leading-snug">
                      {doc.originalName}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>
                        Uploaded {new Date(doc.uploadedAt || Date.now()).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Open Workspace</span>
                  </div>
                  <div className="w-7 h-7 rounded-lg bg-slate-800 group-hover:bg-indigo-600 text-slate-400 group-hover:text-white flex items-center justify-center transition-colors">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
    </div>
  );
}
