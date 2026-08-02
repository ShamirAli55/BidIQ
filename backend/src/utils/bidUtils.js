/**
 * Computes compliance percentage and gap statistics based on requirement matches.
 */
export function computeBidStats(matches, docPages) {
  const total = matches.length;
  const gaps = matches.filter(
    (m) =>
      m.status === "gap" ||
      m.status === "fail" ||
      m.status === "insufficient_data",
  ).length;
  const passedOrMatched = matches.filter(
    (m) => m.status === "matched" || m.status === "pass",
  ).length;

  const compliancePercent =
    total > 0 ? Math.round((passedOrMatched / total) * 100) : 0;

  return {
    gaps_found: gaps,
    compliance_percent: compliancePercent,
    doc_pages: docPages,
  };
}

/**
 * Parses budget string into numeric value.
 */
export function parseBudget(budgetStr) {
  if (!budgetStr) return 0;
  const match = budgetStr.match(/[\d,.]+/);
  if (!match) return 0;
  let num = parseFloat(match[0].replace(/,/g, ""));
  if (/b/i.test(budgetStr)) num *= 1000; // billions -> millions
  return num * 1000000; // "M" unit, in raw currency, matching training data scale
}
