import { useAuthStore } from "../stores/authStore";
import { useNavigate } from "react-router-dom";
import { User, Shield, Calendar, ArrowLeft, Layers, Mail } from "lucide-react";

export default function UserProfilePage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-12">
      <div className="max-w-md mx-auto space-y-8">
        {/* Navigation Bar */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </button>

        {/* Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center">
              <User className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Your Profile</h1>
              <p className="text-xs text-slate-400">Account status and subscription info</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/60">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Mail className="w-4 h-4 text-indigo-400" />
                Email Address
              </span>
              <span className="text-sm font-medium text-slate-200">{user?.email || "N/A"}</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/60">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Shield className="w-4 h-4 text-indigo-400" />
                Access Level
              </span>
              <span className="text-sm font-medium text-indigo-400">Administrator</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800/60">
              <span className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Joined
              </span>
              <span className="text-sm font-medium text-slate-200">August 2026</span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center text-xs text-slate-500">
            <span>Powered by BidIQ Platform</span>
            <div className="flex items-center gap-1">
              <Layers className="w-3 h-3 text-slate-600" />
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
