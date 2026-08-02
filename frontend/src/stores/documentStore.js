import { create } from "zustand";
import api from "../lib/api";
import toast from "react-hot-toast";

export const useDocumentStore = create((set, get) => ({
  documents: [],
  loading: false,
  uploading: false,
  error: null,

  fetchDocuments: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/documents");
      set({ documents: res.data, loading: false });
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to load documents";
      set({ error: msg, loading: false });
      toast.error(msg);
    }
  },

  uploadDocument: async (file) => {
    if (!file) {
      toast.error("Please select a PDF document");
      return null;
    }

    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      toast.error("Only PDF files are supported");
      return null;
    }

    set({ uploading: true, error: null });
    const formData = new FormData();
    formData.append("rfpFile", file);

    try {
      const res = await api.post("/documents/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("RFP Document uploaded successfully!");
      set({ uploading: false });
      await get().fetchDocuments();
      return res.data.documentId;
    } catch (err) {
      const msg = err.response?.data?.error || "PDF upload failed";
      set({ error: msg, uploading: false });
      toast.error(msg);
      return null;
    }
  },
}));
