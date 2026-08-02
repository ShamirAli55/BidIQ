import React, { useState, useRef } from "react";
import { useDocumentStore } from "../stores/documentStore";
import { useNavigate } from "react-router-dom";
import { UploadCloud, FileText, X, Loader2, AlertCircle } from "lucide-react";

export default function UploadModal({ isOpen, onClose }) {
  const { uploadDocument, uploading } = useDocumentStore();
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || uploading) return;

    const documentId = await uploadDocument(selectedFile);
    if (documentId) {
      setSelectedFile(null);
      onClose();
      navigate(`/workspace/${documentId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
              <UploadCloud className="w-4 h-4 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white">Upload RFP Document</h3>
          </div>
          <button
            onClick={onClose}
            disabled={uploading}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
              isDragging
                ? "border-indigo-500 bg-indigo-500/10 scale-[0.99]"
                : selectedFile
                ? "border-emerald-500/40 bg-emerald-500/5"
                : "border-slate-800 hover:border-slate-700 bg-slate-950/50 hover:bg-slate-950/80"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-100 truncate max-w-xs">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF File
                  </p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                  className="text-xs text-rose-400 hover:underline mt-1 cursor-pointer"
                >
                  Remove & pick another
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <UploadCloud className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200">
                    <span className="text-indigo-400 font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    Upload RFP PDF document (Tender, Proposal Request, Scope of Work)
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-400">
            <AlertCircle className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Once uploaded, our LLM engine will extract requirements, match capabilities, and predict win probability.
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={uploading}
              className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-indigo-500/25 transition-all cursor-pointer"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Uploading PDF...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Upload & Analyze</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
