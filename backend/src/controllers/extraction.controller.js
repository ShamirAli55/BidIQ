// import { askOllama } from "../utils/ollama.js";
import { askOpenRouter as askOllama } from "../utils/openrouter.js";
import Extraction from "../models/Extraction.js";
import Document from "../models/Document.js";

function chunkText(text, chunkSize = 3000, overlap = 200) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + chunkSize));
    start += chunkSize - overlap;
  }
  return chunks;
}

function buildPrompt(chunkText) {
  return `
Extract the following from this RFP text and return ONLY valid JSON, no other text:
{
  "mandatoryRequirements": ["..."],
  "submissionDeadline": "...",
  "evaluationCriteria": ["..."]
}

If a field is not present in this text, return an empty array or empty string for it — do not guess.

RFP text:
${chunkText}
`;
}

export const extractRequirements = async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) return res.status(404).json({ error: "Document not found" });

    const chunks = chunkText(document.extractedText);

    let allRequirements = [];
    let deadline = "";
    let allCriteria = [];
    const rawResponses = [];

    for (let i = 0; i < chunks.length; i++) {
      const prompt = buildPrompt(chunks[i]);
      const rawResponse = await askOllama(prompt);
      rawResponses.push(rawResponse);

      try {
        const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
        const parsed = JSON.parse(jsonMatch[0]);

        if (Array.isArray(parsed.mandatoryRequirements)) {
          allRequirements.push(...parsed.mandatoryRequirements);
        }
        if (parsed.submissionDeadline && parsed.submissionDeadline.trim()) {
          deadline = parsed.submissionDeadline; // last non-empty one wins
        }
        if (Array.isArray(parsed.evaluationCriteria)) {
          allCriteria.push(...parsed.evaluationCriteria);
        }
      } catch (e) {
        console.warn(`Chunk ${i} failed to parse, skipping:`, e.message);
      }
    }

    // dedupe (simple exact-match dedupe for now — good enough at this stage)
    const uniqueRequirements = [...new Set(allRequirements)];
    const uniqueCriteria = [...new Set(allCriteria)];

    const extraction = await Extraction.create({
      document: document._id,
      mandatoryRequirements: uniqueRequirements,
      submissionDeadline: deadline,
      evaluationCriteria: uniqueCriteria,
      rawLLMResponse: rawResponses.join("\n---\n"),
    });

    res.json(extraction);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Extraction failed" });
  }
};
