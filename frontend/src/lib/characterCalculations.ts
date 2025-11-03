import type { AttributeKey, Archetype } from "@/types/models";
import {
  calculateStatus as sharedCalculateStatus,
  type StatusCalculationResult,
} from "@rpg/shared";

export const calculateExpertises = (
  attributes: Record<AttributeKey, number>,
): Record<string, number> => {
  const str = attributes.Força || 0;
  const dex = attributes.Destreza || 0;
  const int = attributes.Inteligência || 0;
  const wis = attributes.Sabedoria || 0;
  const con = attributes.Constituição || 0;
  const car = attributes.Carisma || 0;
  const des = attributes.Destino || 0;

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
};

export const calculateStatus = (
  attributes: Record<AttributeKey, number>,
  archetype: Archetype,
): StatusCalculationResult => {
  const normalized = {
    strength: attributes["Força"] ?? 0,
    dexterity: attributes["Destreza"] ?? 0,
    intelligence: attributes["Inteligência"] ?? 0,
    wisdom: attributes["Sabedoria"] ?? 0,
    constitution: attributes["Constituição"] ?? 0,
    destiny: attributes["Destino"] ?? 0,
  };

  return sharedCalculateStatus(normalized, {
    hp: archetype?.hp,
    mp: archetype?.mp,
    tp: archetype?.tp,
  });
};
