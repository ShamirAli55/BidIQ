import mongoose from "mongoose";

// Single-document settings store for runtime configuration
const settingsSchema = new mongoose.Schema({
  llmProvider: { type: String, default: "openrouter" }, // "openrouter" | "ollama" | "huggingface"
  openrouterModel: { type: String, default: "inclusionai/ling-3.0-flash:free" },
  ollamaModel: { type: String, default: "phi4-mini:latest" },
  hfModel: { type: String, default: "Qwen/Qwen2.5-7B-Instruct" },
  openrouterApiKey: { type: String, default: "" },
  hfApiKey: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

const Settings = mongoose.model("Settings", settingsSchema);
export default Settings;
