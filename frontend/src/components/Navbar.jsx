import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { LogOut, User as UserIcon, Layers } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const isDashboard = location.pathname === "/";

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between">
        {/* Brand logo & nav link */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400 group-hover:bg-indigo-600/30 transition-colors">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              BidIQ
            </span>
          </Link>

          {user && (
            <nav className="hidden sm:flex items-center text-xs">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                  isDashboard
                    ? "bg-slate-900 text-white border border-slate-800"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Documents
              </Link>
            </nav>
          )}
        </div>

        {/* User profile & Sign Out */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800/80 px-2.5 py-1 rounded-md text-xs text-slate-300">
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[140px] font-medium">{user.email}</span>
            </div>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800/80 border border-transparent hover:border-slate-700/60 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
