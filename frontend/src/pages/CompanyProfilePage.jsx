import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ShieldCheck,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const FIELD_CONFIG = [
  { key: "companyName", label: "Company Name", type: "text", placeholder: "e.g. Nexus Solutions Pvt Ltd" },
  { key: "yearsRegistered", label: "Years Registered", type: "number", placeholder: "e.g. 12" },
  { key: "avgTurnoverLast2Years", label: "Avg Turnover (Last 2 Years)", type: "text", placeholder: "e.g. PKR 500M" },
  { key: "minTurnoverAnyYear", label: "Min Turnover (Any Single Year)", type: "text", placeholder: "e.g. PKR 350M" },
  { key: "notes", label: "Additional Notes", type: "textarea", placeholder: "Any other relevant company information for compliance checks..." },
];

const BOOL_FIELDS = [
  { key: "hasPakistanOffice", label: "Has Registered Pakistan Office" },
  { key: "isBlacklisted", label: "Is Blacklisted by any Authority" },
  { key: "canProvideAuditedStatements", label: "Can Provide Audited Financial Statements" },
  { key: "canPasswordProtectSubmissions", label: "Can Password-Protect Digital Submissions" },
  { key: "canSubmitBothHardAndSoftCopy", label: "Can Submit Both Hard & Soft Copy" },
];

export default function CompanyProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    companyName: "",
    yearsRegistered: "",
    avgTurnoverLast2Years: "",
    minTurnoverAnyYear: "",
    certifications: "",
    notes: "",
    hasPakistanOffice: false,
    isBlacklisted: false,
    canProvideAuditedStatements: false,
    canPasswordProtectSubmissions: false,
    canSubmitBothHardAndSoftCopy: false,
  });

  const [status, setStatus] = useState(null); // "saving" | "saved" | "error"
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/company-profile`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        if (data && data.companyName) {
          setForm({
            companyName: data.companyName || "",
            yearsRegistered: data.yearsRegistered ?? "",
            avgTurnoverLast2Years: data.avgTurnoverLast2Years || "",
            minTurnoverAnyYear: data.minTurnoverAnyYear || "",
            certifications: (data.certifications || []).join(", "),
            notes: data.notes || "",
            hasPakistanOffice: data.hasPakistanOffice ?? false,
            isBlacklisted: data.isBlacklisted ?? false,
            canProvideAuditedStatements: data.canProvideAuditedStatements ?? false,
            canPasswordProtectSubmissions: data.canPasswordProtectSubmissions ?? false,
            canSubmitBothHardAndSoftCopy: data.canSubmitBothHardAndSoftCopy ?? false,
          });
        }
      })
      .catch(() => setLoadError("Could not load existing profile."));
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setStatus(null);
  };

  const handleSave = async () => {
    setStatus("saving");
    try {
      const payload = {
        ...form,
        yearsRegistered: form.yearsRegistered !== "" ? Number(form.yearsRegistered) : undefined,
        certifications: form.certifications
          ? form.certifications.split(",").map((s) => s.trim()).filter(Boolean)
          : [],
      };

      const res = await fetch(`${API}/api/company-profile`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Save failed");
      setStatus("saved");
      setTimeout(() => setStatus(null), 3000);
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors uppercase tracking-wider cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Documents
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Company Profile</h1>
            <p className="text-xs text-slate-400">
              This data is used by the AI to fact-check RFP eligibility requirements against your company.
            </p>
          </div>
        </div>

        {loadError && (
          <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {loadError}
          </div>
        )}

        {/* Text Fields */}
        <div className="space-y-4">
          {FIELD_CONFIG.map(({ key, label, type, placeholder }) => (
            <div key={key} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                {label}
              </label>
              {type === "textarea" ? (
                <textarea
                  id={`field-${key}`}
                  rows={3}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 resize-none"
                />
              ) : (
                <input
                  id={`field-${key}`}
                  type={type}
                  value={form[key]}
                  onChange={(e) => handleChange(key, e.target.value)}
                  placeholder={placeholder}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
                />
              )}
            </div>
          ))}

          {/* Certifications */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Certifications <span className="text-slate-600 font-normal normal-case">(comma-separated)</span>
            </label>
            <input
              id="field-certifications"
              type="text"
              value={form.certifications}
              onChange={(e) => handleChange("certifications", e.target.value)}
              placeholder="e.g. ISO 9001, CMMI Level 3, PEC Registered"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
            />
          </div>
        </div>

        {/* Boolean Toggles */}
        <div className="border border-slate-800 rounded-xl bg-slate-900 p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Compliance Capabilities
          </div>
          {BOOL_FIELDS.map(({ key, label }) => (
            <label
              key={key}
              htmlFor={`toggle-${key}`}
              className="flex items-center justify-between cursor-pointer group"
            >
              <span className="text-sm text-slate-300 group-hover:text-white transition-colors">
                {label}
              </span>
              <div className="relative">
                <input
                  id={`toggle-${key}`}
                  type="checkbox"
                  className="sr-only"
                  checked={form[key]}
                  onChange={(e) => handleChange(key, e.target.checked)}
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors ${
                    form[key] ? "bg-indigo-500" : "bg-slate-700"
                  }`}
                />
                <div
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                    form[key] ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </label>
          ))}
        </div>

        {/* Save Button */}
        <button
          id="save-company-profile"
          onClick={handleSave}
          disabled={status === "saving"}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-colors font-semibold text-sm"
        >
          {status === "saving" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : status === "saved" ? (
            <><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Profile Saved</>
          ) : status === "error" ? (
            <><AlertCircle className="w-4 h-4 text-rose-300" /> Save Failed — Retry</>
          ) : (
            <><Save className="w-4 h-4" /> Save Company Profile</>
          )}
        </button>
      </div>
    </div>
  );
}
