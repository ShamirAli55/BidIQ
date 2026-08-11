import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import {
  LogOut,
  User as UserIcon,
  Layers,
  Building2,
  Cpu,
  ChevronDown,
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate("/login");
  };

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="sticky top-0 z-45 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-13 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center font-bold text-xs text-indigo-400 group-hover:bg-indigo-600/30 transition-colors">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <span className="font-bold text-sm tracking-tight text-white">
              BidIQ
            </span>
          </Link>
        </div>

        {user && (
          <div className="relative" ref={dropdownRef}>
            <button
              id="user-menu-button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 bg-slate-900/90 border border-slate-800/80 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:border-slate-700/80 cursor-pointer transition-colors"
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[140px] font-medium">{user.email}</span>
              <ChevronDown className="w-3 h-3 text-slate-500" />
            </button>

            {dropdownOpen && (
              <div
                id="user-menu-dropdown"
                className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-800 shadow-xl py-1.5 text-xs text-slate-300 z-50 animate-in fade-in slide-in-from-top-1 duration-100"
              >
                <Link
                  id="link-profile"
                  to="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                  Your Profile
                </Link>

                <Link
                  id="link-company-profile"
                  to="/company-profile"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  Company Profile
                </Link>

                <Link
                  id="link-ai-settings"
                  to="/ai-settings"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  <Cpu className="w-3.5 h-3.5 text-slate-500" />
                  AI Settings
                </Link>

                <div className="border-t border-slate-800/80 my-1.5" />

                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors text-left cursor-pointer font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
