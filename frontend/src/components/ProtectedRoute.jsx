import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Loader2 } from "lucide-react";

export default function ProtectedRoute({ children }) {
  const { user, authChecked, checkAuth } = useAuthStore();

  useEffect(() => {
    if (!authChecked) {
      checkAuth();
    }
  }, [authChecked, checkAuth]);

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-4">
          <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
        </div>
        <p className="text-sm font-medium text-slate-400">Authenticating session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
