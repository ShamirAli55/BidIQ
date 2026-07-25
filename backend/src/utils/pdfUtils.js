export const normalizeParagraphs = (text) => {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const paragraphs = [];
  let current = "";

  const isHeading = (line) =>
    /^SECTION\s+\d+/i.test(line) ||
    /^ANNEXURE/i.test(line) ||
    /^RFP/i.test(line) ||
    /^[A-Z][A-Z\s&()\-]{5,}$/.test(line);

  const startsBullet = (line) =>
    /^[-•*]/.test(line) ||
    /^\d+\./.test(line) ||
    /^[a-z]\)/i.test(line) ||
    /^[ivxlcdm]+\./i.test(line);

  for (const line of lines) {
    if (isHeading(line)) {
      if (current) paragraphs.push(current.trim());
      paragraphs.push(line);
      current = "";
      continue;
    }

    if (startsBullet(line)) {
      if (current) {
        paragraphs.push(current.trim());
        current = "";
      }
      paragraphs.push(line);
      continue;
    }

    if (!current) {
      current = line;
      continue;
    }

    if (/[.!?:]$/.test(current) || /^[A-Z][a-z]/.test(line)) {
      paragraphs.push(current.trim());
      current = line;
    } else {
      current += " " + line;
    }
  }

  if (current) paragraphs.push(current.trim());

  return paragraphs.join("\n\n");
};

export const cleanPdfText = (text) => {
  return (
    text
      // Normalize line endings
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")

      // Remove zero-width and non-breaking spaces
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/\u00A0/g, " ")

      // Remove page numbers (line contains only digits)
      .replace(/^\s*\d+\s*$/gm, "")

      // Remove repeated separators
      .replace(/^[\s\-_=]{3,}$/gm, "")

      // Fix hyphenated words split across lines
      .replace(/(\w)-\n(\w)/g, "$1$2")

      // Merge lines that are obviously part of one sentence
      .replace(/([a-z0-9,;:])\n([a-z])/g, "$1 $2")
      .replace(/([a-z])\n([A-Z][a-z])/g, "$1 $2")

      // Remove spaces before punctuation
      .replace(/\s+([,.;:!?])/g, "$1")

      // Collapse multiple spaces
      .replace(/[ \t]{2,}/g, " ")

      // Collapse multiple blank lines
      .replace(/\n{3,}/g, "\n\n")

      .replace(/[ \t]+\n/g, "\n") // remove trailing spaces
      .replace(/\n[ \t]+/g, "\n") // remove leading spaces
      .replace(/\n{4,}/g, "\n\n") // collapse huge gaps
      .replace(/ +/g, " ") // multiple spaces

      // Trim every line
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n")

      .trim()
  );
};
