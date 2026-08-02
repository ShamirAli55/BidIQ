import React, { useState } from "react";
import { Copy, Check, Edit3, Save, Sparkles, FileCheck } from "lucide-react";
import toast from "react-hot-toast";
import { useWorkspaceStore } from "../stores/workspaceStore";

export default function DraftSectionCard({ draft, index }) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(draft.draftText);
  const updateDraftText = useWorkspaceStore((state) => state.updateDraftText);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Draft paragraph copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    updateDraftText(draft._id, text);
    setIsEditing(false);
    toast.success("Draft section updated!");
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/50 hover:border-slate-700/80 transition-all p-5 space-y-3">
      {/* Header Info */}
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold">
            #{index + 1}
          </span>
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Proposal Section
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
            {draft.source === "rag" ? "Capability Evidence" : "Compliance Statement"}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isEditing ? (
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save</span>
            </button>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Section</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Target Requirement */}
      {draft.requirementText && (
        <div className="text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
          <span className="font-semibold text-slate-300">Target Requirement: </span>
          {draft.requirementText}
        </div>
      )}

      {/* Paragraph Editor / Display */}
      {isEditing ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          className="w-full p-3 rounded-lg bg-slate-950 border border-indigo-500/50 text-slate-100 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 leading-relaxed font-sans"
        />
      ) : (
        <p className="text-sm text-slate-200 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/50 font-sans whitespace-pre-wrap">
          {text}
        </p>
      )}
    </div>
  );
}
