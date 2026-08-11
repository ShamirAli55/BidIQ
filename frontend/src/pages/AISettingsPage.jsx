import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Cpu,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  KeyRound,
  Layers,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AISettingsPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    llmProvider: "openrouter",
    openrouterModel: "",
    ollamaModel: "",
    hfModel: "",
    openrouterApiKey: "",
    hfApiKey: "",
  });

  const [hasOpenrouterKey, setHasOpenrouterKey] = useState(false);
  const [hasHfKey, setHasHfKey] = useState(false);

  const [status, setStatus] = useState(null); // "saving" | "saved" | "error"
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetch(`${API}/api/settings`, { credentials: "include" })
      .then((r) => r.json())
      .then((data) => {
        setForm({
          llmProvider: data.llmProvider || "openrouter",
          openrouterModel: data.openrouterModel || "",
          ollamaModel: data.ollamaModel || "",
          hfModel: data.hfModel || "",
          openrouterApiKey: "",
          hfApiKey: "",
        });
        setHasOpenrouterKey(data.hasOpenrouterKey || false);
        setHasHfKey(data.hasHfKey || false);
      })
      .catch(() => setLoadError("Could not load AI configurations."));
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setStatus(null);
  };

  const handleSave = async () => {
    setStatus("saving");
    try {
      const res = await fetch(`${API}/api/settings`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Save failed");
      setStatus("saved");

      // Reload state to refresh key existence checks
      const dataResponse = await fetch(`${API}/api/settings`, { credentials: "include" });
      const data = await dataResponse.json();
      setForm((prev) => ({ ...prev, openrouterApiKey: "", hfApiKey: "" }));
      setHasOpenrouterKey(data.hasOpenrouterKey || false);
      setHasHfKey(data.hasHfKey || false);

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
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Engine Settings</h1>
            <p className="text-xs text-slate-400">
              Configure and switch the AI models powering compliance checks, matching, and scoring at runtime.
            </p>
          </div>
        </div>

        {loadError && (
          <div className="flex items-center gap-2 text-amber-400 text-xs bg-amber-500/10 border border-amber-500/20 rounded-lg px-4 py-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {loadError}
          </div>
        )}

        {/* Model Selection Tabs */}
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active LLM Provider
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: "OpenRouter", id: "openrouter", desc: "Cloud APIs" },
                { name: "Local Ollama", id: "ollama", desc: "Local Models" },
                { name: "Hugging Face", id: "huggingface", desc: "Serverless APIs" },
              ].map((prov) => (
                <button
                  key={prov.id}
                  id={`provider-tab-${prov.id}`}
                  onClick={() => handleChange("llmProvider", prov.id)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    form.llmProvider === prov.id
                      ? "bg-indigo-600/10 border-indigo-500 text-white"
                      : "bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700/60"
                  }`}
                >
                  <p className="text-sm font-semibold">{prov.name}</p>
                  <p className="text-xs text-indigo-400 mt-1">{prov.desc}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Conditional provider configure forms */}
          {form.llmProvider === "openrouter" && (
            <div className="space-y-4 border border-slate-800 rounded-xl bg-slate-900/40 p-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  OpenRouter Model
                </label>
                <input
                  id="field-openrouter-model"
                  type="text"
                  value={form.openrouterModel}
                  onChange={(e) => handleChange("openrouterModel", e.target.value)}
                  placeholder="e.g. inclusionai/ling-3.0-flash:free"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    OpenRouter API Key
                  </label>
                  {hasOpenrouterKey && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                      Configured
                    </span>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3 w-4 h-4 text-slate-500" />
                  <input
                    id="field-openrouter-key"
                    type="password"
                    value={form.openrouterApiKey}
                    onChange={(e) => handleChange("openrouterApiKey", e.target.value)}
                    placeholder={hasOpenrouterKey ? "••••••••••••••••••••••••" : "Paste your OpenRouter API Key"}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>
            </div>
          )}

          {form.llmProvider === "ollama" && (
            <div className="space-y-4 border border-slate-800 rounded-xl bg-slate-900/40 p-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Ollama Model Name
                </label>
                <input
                  id="field-ollama-model"
                  type="text"
                  value={form.ollamaModel}
                  onChange={(e) => handleChange("ollamaModel", e.target.value)}
                  placeholder="e.g. phi4-mini:latest"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
                />
                <p className="text-[11px] text-slate-500">
                  Ensure Ollama is running locally (`ollama run {form.ollamaModel || "model_name"}`) and accessible by the backend server.
                </p>
              </div>
            </div>
          )}

          {form.llmProvider === "huggingface" && (
            <div className="space-y-4 border border-slate-800 rounded-xl bg-slate-900/40 p-5">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Hugging Face Model Repo
                </label>
                <input
                  id="field-hf-model"
                  type="text"
                  value={form.hfModel}
                  onChange={(e) => handleChange("hfModel", e.target.value)}
                  placeholder="e.g. Qwen/Qwen2.5-7B-Instruct"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    HF API Token
                  </label>
                  {hasHfKey && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold uppercase">
                      Configured
                    </span>
                  )}
                </div>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-3 w-4 h-4 text-slate-500" />
                  <input
                    id="field-hf-key"
                    type="password"
                    value={form.hfApiKey}
                    onChange={(e) => handleChange("hfApiKey", e.target.value)}
                    placeholder={hasHfKey ? "••••••••••••••••••••••••" : "Paste your HF API/inference Token"}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Button */}
        <button
          id="save-ai-settings"
          onClick={handleSave}
          disabled={status === "saving"}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 transition-colors font-semibold text-sm cursor-pointer"
        >
          {status === "saving" ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving Configuration...</>
          ) : status === "saved" ? (
            <><CheckCircle2 className="w-4 h-4 text-emerald-300" /> Settings Saved & Active</>
          ) : status === "error" ? (
            <><AlertCircle className="w-4 h-4 text-rose-300" /> Save Failed — Retry</>
          ) : (
            <><Save className="w-4 h-4" /> Save AI Engine Settings</>
          )}
        </button>
      </div>
    </div>
  );
}
