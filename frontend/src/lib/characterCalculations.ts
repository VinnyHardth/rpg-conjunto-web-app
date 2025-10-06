import { AttributeKey, DerivedStats } from "@/types/character";

export const calculateDerivedStats = (
  attributes: Record<AttributeKey, number>,
  hp_mod: number,
  mp_mod: number,
  tp_mod: number,
): DerivedStats => {
  const str = attributes.Strength || 0;
  const dex = attributes.Dexterity || 0;
  const int = attributes.Intelligence || 0;
  const wis = attributes.Wisdom || 0;
  const con = attributes.Constitution || 0;
  const car = attributes.Charisma || 0;
  const des = attributes.Destiny || 0;

  console.log(str, dex, int, wis, con, car, des);

  const hp = 10 + Math.ceil((con + 0.25 * (str + dex) + 0.25 * (int + wis)) * hp_mod);
  const mp = 10 + Math.ceil(((int + wis) / 2)) * mp_mod;
  const tp = 10 + Math.ceil((dex + str) / 2) * tp_mod;

  const pericias = {
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

  const movimento = Math.ceil((dex + con + pericias.magicRes + pericias.fisicalRes + pericias.determination) / 2);

  return { hp, mp, tp, movimento, pericias };
};