export type StatusAction =
  | "PHYSICAL_DAMAGE"
  | "MAGIC_DAMAGE"
  | "HEALING"
  | "MANA_REGENERATION"
  | "MANA_REDUCTION"
  | "TECHNIQUE_REGENERATION"
  | "TECHNIQUE_REDUCTION";

export type StatusActionOption = {
  value: StatusAction;
  label: string;
  effectName: string;
  targetStatus: "HP" | "MP" | "TP";
  isIncrease: boolean;
};

export const STATUS_ACTION_OPTIONS: StatusActionOption[] = [
  {
    value: "PHYSICAL_DAMAGE",
    label: "Dano Físico",
    effectName: "Dano Físico",
    targetStatus: "HP",
    isIncrease: false,
  },
  {
    value: "MAGIC_DAMAGE",
    label: "Dano Mágico",
    effectName: "Dano Mágico",
    targetStatus: "HP",
    isIncrease: false,
  },
  {
    value: "HEALING",
    label: "Cura",
    effectName: "Cura",
    targetStatus: "HP",
    isIncrease: true,
  },
  {
    value: "MANA_REGENERATION",
    label: "Restaurar Mana",
    effectName: "Restaura Mana",
    targetStatus: "MP",
    isIncrease: true,
  },
  {
    value: "MANA_REDUCTION",
    label: "Redução de Mana",
    effectName: "Reduz Mana",
    targetStatus: "MP",
    isIncrease: false,
  },
  {
    value: "TECHNIQUE_REGENERATION",
    label: "Restaurar Técnica",
    effectName: "Restaura Técnica",
    targetStatus: "TP",
    isIncrease: true,
  },
  {
    value: "TECHNIQUE_REDUCTION",
    label: "Redução de Técnica",
    effectName: "Reduz Técnica",
    targetStatus: "TP",
    isIncrease: false,
  },
];
