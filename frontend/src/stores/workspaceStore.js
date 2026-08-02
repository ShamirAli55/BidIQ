import { create } from "zustand";
import api from "../lib/api";
import toast from "react-hot-toast";

export const useWorkspaceStore = create((set, get) => ({
  document: null,
  extraction: null,
  matchSummary: { total: 0, matched: 0, gaps: 0, needsReview: 0 },
  matches: [],
  drafts: [],
  scoreData: null,

  loadingWorkspace: false,
  extracting: false,
  matching: false,
  drafting: false,
  scoring: false,
  error: null,

  fetchWorkspace: async (docId) => {
    set({ loadingWorkspace: true, error: null });
    try {
      const res = await api.get(`/documents/${docId}/workspace`);
      const { document, extraction, matchSummary, matches, drafts } = res.data;
      set({
        document,
        extraction,
        matchSummary: matchSummary || { total: 0, matched: 0, gaps: 0, needsReview: 0 },
        matches: matches || [],
        drafts: drafts || [],
        loadingWorkspace: false,
      });

      // If extraction exists, try fetching score if matching was done
      if (extraction && matches && matches.length > 0) {
        get().fetchScore(extraction._id, true);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to load workspace data";
      set({ error: msg, loadingWorkspace: false });
      toast.error(msg);
    }
  },

  extractRequirements: async (docId) => {
    set({ extracting: true });
    const toastId = toast.loading("Analyzing RFP document & extracting requirements...");
    try {
      const res = await api.post(`/documents/${docId}/extract`);
      toast.success("Requirement extraction completed successfully!", { id: toastId });
      set({ extracting: false });
      await get().fetchWorkspace(docId);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || "Requirement extraction failed";
      set({ extracting: false });
      toast.error(msg, { id: toastId });
      return null;
    }
  },

  matchRequirements: async (extractionId, docId) => {
    set({ matching: true });
    const toastId = toast.loading("Running RAG vector matching & fact-checks against capabilities...");
    try {
      const res = await api.post(`/extractions/${extractionId}/match`);
      toast.success(`Matched ${res.data.count || res.data.matches?.length || 0} requirements successfully!`, { id: toastId });
      set({ matching: false });
      await get().fetchWorkspace(docId);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || "Requirement matching failed";
      set({ matching: false });
      toast.error(msg, { id: toastId });
      return null;
    }
  },

  generateDrafts: async (extractionId, docId) => {
    set({ drafting: true });
    const toastId = toast.loading("Generating AI proposal response paragraphs...");
    try {
      const res = await api.post(`/extractions/${extractionId}/draft`);
      toast.success(`Generated ${res.data.count || res.data.drafts?.length || 0} proposal draft sections!`, { id: toastId });
      set({ drafting: false });
      await get().fetchWorkspace(docId);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || "Draft generation failed";
      set({ drafting: false });
      toast.error(msg, { id: toastId });
      return null;
    }
  },

  fetchScore: async (extractionId, silent = false) => {
    set({ scoring: true });
    let toastId;
    if (!silent) {
      toastId = toast.loading("Evaluating bid stats & predicting win probability...");
    }
    try {
      const res = await api.get(`/extractions/${extractionId}/score`);
      set({ scoreData: res.data, scoring: false });
      if (!silent) {
        toast.success("Win probability calculated!", { id: toastId });
      }
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.error || "Scoring bid failed";
      set({ scoring: false });
      if (!silent) {
        toast.error(msg, { id: toastId });
      }
      return null;
    }
  },

  updateDraftText: (draftId, newText) => {
    set((state) => ({
      drafts: state.drafts.map((d) =>
        d._id === draftId ? { ...d, draftText: newText } : d
      ),
    }));
  },
}));
