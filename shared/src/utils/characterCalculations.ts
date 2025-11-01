import type { ArchetypeDTO } from "../types/archetype";

export type StatusCalculationAttributes = {
  strength?: number;
  dexterity?: number;
  intelligence?: number;
  wisdom?: number;
  constitution?: number;
  charisma?: number;
  destiny?: number;
};

export type StatusCalculationArchetype = Pick<ArchetypeDTO, "hp" | "mp" | "tp"> | {
  hp?: number | null;
  mp?: number | null;
  tp?: number | null;
};

export type StatusCalculationResult = {
  hp: number;
  mp: number;
  tp: number;
  mov: number;
  rm: number;
  rf: number;
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const calculateStatus = (
  attributes: StatusCalculationAttributes,
  archetype: StatusCalculationArchetype
): StatusCalculationResult => {
  const strength = toNumber(attributes.strength);
  const dexterity = toNumber(attributes.dexterity);
  const intelligence = toNumber(attributes.intelligence);
  const wisdom = toNumber(attributes.wisdom);
  const constitution = toNumber(attributes.constitution);
  const destiny = toNumber(attributes.destiny);

  const hpMod = toNumber(archetype.hp, 1);
  const mpMod = toNumber(archetype.mp, 1);
  const tpMod = toNumber(archetype.tp, 1);

  const rm = Math.floor((intelligence + constitution) / 2);
  const rf = Math.floor((strength + constitution) / 2);
  const det = Math.floor((constitution + destiny) / 2);

  return {
    hp: Math.max(
      0,
      10 +
        Math.ceil(
          (constitution +
            0.25 * (strength + dexterity) +
            0.25 * (intelligence + wisdom)) *
            hpMod
        )
    ),
    mp: Math.max(0, 10 + Math.ceil((intelligence + wisdom) / 2) * mpMod),
    tp: Math.max(0, 10 + Math.ceil((dexterity + strength) / 2) * tpMod),
    mov: Math.max(
      0,
      Math.ceil((dexterity + constitution + rf + rm + det) / 2)
    ),
    rm,
    rf
  };
};
