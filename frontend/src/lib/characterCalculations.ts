import { AttributeKey, Archetype } from "@/types/models";

export const calculateExpertises = (attributes: Record<AttributeKey, number>): Record<string, number> => {
  const str = attributes.Strength || 0;
  const dex = attributes.Dexterity || 0;
  const int = attributes.Intelligence || 0;
  const wis = attributes.Wisdom || 0;
  const con = attributes.Constitution || 0;
  const car = attributes.Charisma || 0;
  const des = attributes.Destiny || 0;

  return {
    magicRes: Math.floor((int + con) / 2),
    fisicalRes: Math.floor((str + con) / 2),
    perception: Math.floor((dex + wis) / 2),
    intimidation: Math.floor((str + car) / 2),
    faith: Math.floor((wis + des) / 2),
    inspiration: Math.floor((des + car) / 2),
    determination: Math.floor((con + des) / 2),
    bluff: Math.floor((car + int) / 2),
    reflexes: Math.floor((dex + con) / 2),
  };
}

export const calculateStatus = (attributes: Record<AttributeKey, number>, archetype: Archetype): Record<string, number> => {
  const str = attributes.Strength || 0;
  const dex = attributes.Dexterity || 0;
  const int = attributes.Intelligence || 0;
  const wis = attributes.Wisdom || 0;
  const con = attributes.Constitution || 0;
  const des = attributes.Destiny || 0;

  const rm = Math.floor((int + con) / 2);
  const rf = Math.floor((str + con) / 2);
  const det = Math.floor((con + des) / 2);

  return {
    hp: 10 + Math.ceil((con + 0.25 * (str + dex) + 0.25 * (int + wis)) * archetype.hp),
    mp: 10 + (Math.ceil(((int + wis) / 2)) * archetype.mp),
    tp: 10 + Math.ceil((dex + str) / 2) * archetype.tp,
    mov: Math.ceil((dex + con + rf + rm + det) / 2),
  };
}
