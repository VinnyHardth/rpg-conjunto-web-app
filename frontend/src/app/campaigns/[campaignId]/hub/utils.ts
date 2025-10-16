const normalizeAbbreviationKey = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const ATTRIBUTE_ABBREVIATIONS: Record<string, string> = {
  forca: "FOR",
  destreza: "DES",
  destino: "DEST",
  inteligencia: "INT",
  sabedoria: "SAB",
  constituicao: "CON",
  carisma: "CAR",
  "resistencia fisica": "RF",
  "resistencia magica": "RM",
  inspiracao: "INS",
  labia: "LAB",
  percepcao: "PER",
  reflexos: "REF",
  fe: "FE",
  determinacao: "DET",
  intimidar: "INTM",
};

export const resolveAbbreviation = (label: string): string => {
  const key = normalizeAbbreviationKey(label);
  if (ATTRIBUTE_ABBREVIATIONS[key]) {
    return ATTRIBUTE_ABBREVIATIONS[key];
  }
  const compact = key.replace(/[^a-z0-9]/g, "");
  const fallback = compact.slice(0, 4) || "ROL";
  return fallback.toUpperCase();
};
