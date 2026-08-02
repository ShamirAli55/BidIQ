import React from "react";
import { TrendingUp, AlertTriangle, CheckCircle2, DollarSign, Clock, Building2, FileCheck2, BarChart2 } from "lucide-react";

export default function WinProbabilityCard({ scoreData }) {
  if (!scoreData) return null;

  const { stats, budget, responseTimeHrs, sector, prediction } = scoreData;
  const isWin = prediction?.prediction === "Win" || (prediction?.winProbability && prediction.winProbability >= 50);
  const winPercentage = Math.round(
    typeof prediction?.winProbability === "number"
      ? prediction.winProbability
      : prediction?.prediction === "Win"
      ? 75
      : 25
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 space-y-6 shadow-xl relative overflow-hidden">
      {/* Glow Effect */}
      <div
        className={`absolute -top-24 -right-24 w-60 h-60 rounded-full blur-3xl opacity-20 pointer-events-none ${
          isWin ? "bg-emerald-500" : "bg-rose-500"
        }`}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Win Probability AI Prediction</h3>
            <p className="text-xs text-slate-400">Machine learning model bid success prediction</p>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
            isWin
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
          }`}
        >
          {isWin ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          Predicted Outcome: {prediction?.prediction || (isWin ? "Win" : "Loss")}
        </span>
      </div>

      {/* Main Gauge / Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Win Probability Score
          </span>
          <span
            className={`text-2xl font-black font-mono ${
              isWin ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {winPercentage}%
          </span>
        </div>

        <div className="w-full h-3 rounded-full bg-slate-950 border border-slate-800 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isWin
                ? "bg-gradient-to-r from-emerald-600 to-emerald-400"
                : "bg-gradient-to-r from-rose-600 to-amber-500"
            }`}
            style={{ width: `${Math.min(100, Math.max(5, winPercentage))}%` }}
          />
        </div>
      </div>

      {/* Metrics Breakdown Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
            <span>Budget</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">
            {budget ? `$${budget.toLocaleString()}` : "Not specified"}
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <FileCheck2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Compliance</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">
            {stats?.compliance_percent != null ? `${stats.compliance_percent}%` : "N/A"}
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Response Time</span>
          </div>
          <p className="text-sm font-semibold text-slate-200">
            {responseTimeHrs != null ? `${responseTimeHrs} hrs` : "N/A"}
          </p>
        </div>

        <div className="bg-slate-950/60 border border-slate-800/80 p-3 rounded-xl space-y-1">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Sector</span>
          </div>
          <p className="text-sm font-semibold text-slate-200 truncate capitalize">
            {sector || "General"}
          </p>
        </div>
      </div>
    </div>
  );
}
