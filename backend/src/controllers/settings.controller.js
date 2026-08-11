import Settings from "../models/Settings.js";

export const getSettings = async (req, res) => {
  try {
    const settings = await Settings.findOne();
    // Never expose API keys to the client — just indicate if they're set
    const safe = settings
      ? {
          llmProvider: settings.llmProvider,
          openrouterModel: settings.openrouterModel,
          ollamaModel: settings.ollamaModel,
          hfModel: settings.hfModel,
          hasOpenrouterKey: !!settings.openrouterApiKey,
          hasHfKey: !!settings.hfApiKey,
          updatedAt: settings.updatedAt,
        }
      : {
          llmProvider: process.env.LLM_PROVIDER || "openrouter",
          openrouterModel: process.env.OPENROUTER_MODEL || "inclusionai/ling-3.0-flash:free",
          ollamaModel: process.env.OLLAMA_MODEL || "phi4-mini:latest",
          hfModel: process.env.HF_MODEL_DEFAULT || "Qwen/Qwen2.5-7B-Instruct",
          hasOpenrouterKey: !!process.env.OPENROUTER_API_KEY,
          hasHfKey: !!(process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY),
        };
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
};

export const upsertSettings = async (req, res) => {
  try {
    const { llmProvider, openrouterModel, ollamaModel, hfModel, openrouterApiKey, hfApiKey } = req.body;

    const update = {
      llmProvider,
      openrouterModel,
      ollamaModel,
      hfModel,
      updatedAt: new Date(),
    };
    // Only overwrite keys if non-empty strings are provided
    if (openrouterApiKey) update.openrouterApiKey = openrouterApiKey;
    if (hfApiKey) update.hfApiKey = hfApiKey;

    const settings = await Settings.findOneAndUpdate(
      {},
      { $set: update },
      { new: true, upsert: true }
    );
    res.json({ success: true, llmProvider: settings.llmProvider });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save settings" });
  }
};
