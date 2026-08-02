import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Sparkles, LogOut, FileText, User as UserIcon } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                BidIQ
              </span>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 rounded-full uppercase">
                Engine
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
              AI Bid & Proposal Response
            </p>
          </div>
        </Link>

        {user && (
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <FileText className="w-4 h-4 text-indigo-400" />
              <span>RFPs Dashboard</span>
            </Link>

            <div className="h-4 w-px bg-slate-800" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300">
                <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate max-w-[150px]">{user.email}</span>
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
