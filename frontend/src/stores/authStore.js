import { create } from "zustand";
import api from "../lib/api";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  user: null,
  loading: false,
  authChecked: false,
  error: null,

  checkAuth: async () => {
    set({ loading: true, error: null });
    try {
      const res = await api.get("/auth/me");
      set({ user: res.data.user, authChecked: true, loading: false });
    } catch (err) {
      set({ user: null, authChecked: true, loading: false });
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/login", { email, password });
      set({ user: res.data.user, loading: false });
      toast.success("Welcome back! Login successful.");
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || "Login failed. Please check credentials.";
      set({ error: msg, loading: false });
      toast.error(msg);
      return false;
    }
  },

  signup: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post("/auth/signup", { email, password });
      toast.success("Account created successfully! Please log in.");
      set({ loading: false });
      return true;
    } catch (err) {
      const msg = err.response?.data?.error || "Signup failed. Please try again.";
      set({ error: msg, loading: false });
      toast.error(msg);
      return false;
    }
  },

  logout: async () => {
    set({ loading: true });
    try {
      await api.post("/auth/logout");
      set({ user: null, loading: false });
      toast.success("Logged out successfully.");
    } catch (err) {
      set({ user: null, loading: false });
      toast.error("Logout completed.");
    }
  },
}));
