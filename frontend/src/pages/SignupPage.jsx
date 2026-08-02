import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { Sparkles, Mail, Lock, ArrowRight, Loader2, AlertCircle } from "lucide-react";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const { signup, loading } = useAuthStore();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = "Invalid email format";
    }

    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await signup(email, password);
    if (success) {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-indigo-400" />
            </div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create your BidIQ account
          </h1>
          <p className="text-sm text-slate-400">
            Start automating your RFP response analysis & proposal generation
          </p>
        </div>

        {/* Centered Auth Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: null }));
                  }}
                  placeholder="name@company.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    fieldErrors.email
                      ? "border-rose-500/80 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
              </div>
              {fieldErrors.email && (
                <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.email}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: null }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    fieldErrors.password
                      ? "border-rose-500/80 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
              </div>
              {fieldErrors.password && (
                <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword)
                      setFieldErrors((prev) => ({ ...prev, confirmPassword: null }));
                  }}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-950 border rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none transition-all ${
                    fieldErrors.confirmPassword
                      ? "border-rose-500/80 focus:ring-1 focus:ring-rose-500"
                      : "border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  }`}
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-xs text-rose-400 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-500/25 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Toggle / Redirect to Login */}
          <div className="pt-4 border-t border-slate-800/80 text-center">
            <p className="text-xs text-slate-400">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-semibold text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Sign in instead
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
