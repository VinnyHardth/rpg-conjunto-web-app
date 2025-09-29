import { getArchetypeById } from "../resources/archetype/archetype.services";
import { getAttributesByKind } from "../resources/attributes/attributes.services";
import { getCharacterAttributesByCharacterId } from "../resources/characterAttribute/characterAttribute.services";

type Expertises = {
  magicRes: number;
  fisicalRes: number;
  perception: number;
  intimidation: number;
  faith: number;
  inspiration: number;
  determination: number;
  bluff: number;
  reflexes: number;
};

type CharacterAttributes = {
  strength: number;
  dexterity: number;
  intelligence: number;
  constitution: number;
  wisdom: number;
  charisma: number;
  destiny: number;
};

type CharacterStatus = {
  hp: number;
  mp: number;
  tp: number;
}

type ArchetypeMod = {
  hp_mod: number;
  mp_mod: number;
  tp_mod: number;
}

const expertiseFormulas: Record<keyof Expertises, (s: CharacterAttributes) => number> = {
  magicRes: (s) => Math.floor((s.intelligence + s.constitution) / 2),
  fisicalRes: (s) => Math.floor((s.strength + s.constitution) / 2),
  perception: (s) => Math.floor((s.dexterity + s.wisdom) / 2),
  intimidation: (s) => Math.floor((s.strength + s.charisma) / 2),
  faith: (s) => Math.floor((s.wisdom + s.destiny) / 2),
  inspiration: (s) => Math.floor((s.destiny + s.charisma) / 2),
  determination: (s) => Math.floor((s.constitution + s.destiny) / 2),
  bluff: (s) => Math.floor((s.charisma + s.intelligence) / 2),
  reflexes: (s) => Math.floor((s.dexterity + s.constitution) / 2),
};


export const computeExpertises = async (characterId: string): Promise<Expertises> => {
  // busca atributos do personagem
  const characterAttributes = await getCharacterAttributesByCharacterId(characterId);
  const attributes = await getAttributesByKind("ATTRIBUTE");

  // combina stats base com bônus de itens/extras
  const stats: CharacterAttributes = {
    strength: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Strength")?.id)?.valueBase || 0,
    dexterity: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Dexterity")?.id)?.valueBase || 0,
    intelligence: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Intelligence")?.id)?.valueBase || 0,
    constitution: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Constitution")?.id)?.valueBase || 0,
    wisdom: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Wisdom")?.id)?.valueBase || 0,
    charisma: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Charisma")?.id)?.valueBase || 0,
    destiny: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Destiny")?.id)?.valueBase || 0,
  };
  
  
  // aplica todas as fórmulas
  const result = Object.fromEntries(
    Object.entries(expertiseFormulas).map(([key, formula]) => [key, formula(stats)])
  ) as Expertises;

  console.log(result);

  return result;
};


const statusFormulas: Record<keyof CharacterStatus, (s: CharacterAttributes, a: ArchetypeMod) => number> = {
  // hp = Math.ceil(10 + ((con) + 0.25 * str + 0.25 * int) * multiplier);
  hp: (s, a) => Math.ceil(10 + ((s.constitution + 0.25 * s.strength + 0.25 * s.intelligence) * a.hp_mod)),
  // mp = 10 + Math.ceil(((int + wis) / 2)) * multiplier;
  mp: (s, a) => 10 + Math.ceil(((s.intelligence + s.wisdom) / 2)) * a.mp_mod,
  // tp = 10 + Math.ceil(((dex + str) / 2)) * multiplier; 
  tp: (s, a) => 10 + Math.ceil(((s.dexterity + s.strength) / 2)) * a.tp_mod
}

export const computeStatus = async (characterId: string, archetypeId: string): Promise<CharacterStatus> => {
  // busca atributos do personagem
  const characterAttributes = await getCharacterAttributesByCharacterId(characterId);
  const attributes = await getAttributesByKind("ATTRIBUTE");

  // combina stats base com bônus de itens/extras
  const stats: CharacterAttributes = {
    strength: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Strength")?.id)?.valueBase || 0,
    dexterity: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Dexterity")?.id)?.valueBase || 0,
    intelligence: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Intelligence")?.id)?.valueBase || 0,
    constitution: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Constitution")?.id)?.valueBase || 0,
    wisdom: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Wisdom")?.id)?.valueBase || 0,
    charisma: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Charisma")?.id)?.valueBase || 0,
    destiny: characterAttributes.find((ca) => ca.attributeId === attributes.find((a) => a.name === "Destiny")?.id)?.valueBase || 0,
  };

  const archetype = await getArchetypeById(archetypeId);

  const archetypeMod: ArchetypeMod = archetype
    ? {
        hp_mod: archetype.hp ?? 0,
        mp_mod: archetype.mp ?? 0,
        tp_mod: archetype.tp ?? 0,
      }
    : { hp_mod: 0, mp_mod: 0, tp_mod: 0 };

  // aplica todas as fórmulas
  const result = Object.fromEntries(
    Object.entries(statusFormulas).map(([key, formula]) => [key, formula(stats, archetypeMod)])
  ) as CharacterStatus;

  return result;
};

