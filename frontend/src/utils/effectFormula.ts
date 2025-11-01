export type ParsedEffectFormula = {
  expr: string;
  target: string;
};

export function parseEffectLinkFormula(
  formula: string | null | undefined,
): ParsedEffectFormula {
  if (!formula) {
    return { expr: "", target: "" };
  }

  const trimmed = formula.trim();
  if (!trimmed) {
    return { expr: "", target: "" };
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (typeof parsed === "object" && parsed && !Array.isArray(parsed)) {
      const exprValue = typeof parsed.expr === "string" ? parsed.expr : "";
      const targetValue =
        typeof parsed.target === "string" ? parsed.target : "";
      return { expr: exprValue, target: targetValue };
    }
  } catch (error) {
    // not JSON, continue with other formats
  }

  const targetMatch = trimmed.match(/target\s*=\s*([^;]+)/i);
  const exprMatch = trimmed.match(/expr\s*=\s*([^;]+)/i);

  if (targetMatch || exprMatch) {
    return {
      expr: exprMatch ? exprMatch[1].trim() : "",
      target: targetMatch ? targetMatch[1].trim() : "",
    };
  }

  return { expr: trimmed, target: "" };
}

export function buildEffectLinkFormula(expr: string, target: string): string {
  const cleanedExpr = expr.trim();
  const cleanedTarget = target.trim();

  if (!cleanedTarget) {
    return cleanedExpr;
  }

  const payload: Record<string, string> = {};
  if (cleanedTarget) {
    payload.target = cleanedTarget;
  }
  if (cleanedExpr) {
    payload.expr = cleanedExpr;
  }

  return JSON.stringify(payload);
}
