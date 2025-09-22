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

type CharacterStats = {
  strength: number;
  dexterity: number;
  intelligence: number;
  constitution: number;
  wisdom: number;
  charisma: number;
  destiny: number;
};

const expertiseFormulas: Record<keyof Expertises, (s: CharacterStats) => number> = {
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
  const stats: CharacterStats = {
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



// export const calculateMaxHP = (stats: StatsDTO, bonuses?: Partial<Record<keyof StatsDTO, number>>, archetype: string = "None") => {
//     const growthTable: Record<string, number> = {
//         "Melee": 4,
//         "Ranged": 2,
//         "Magic": 2,
//         "Healer": 3,
//         "Tank": 8,
//         "Tank-Healer": 7,
//         "Melee-Magic": 3,
//         "Ranged-Magic": 2,
//         "Magic-Healer": 1,
//         "Tank-Melee": 6,
//         "Tank-Ranged": 6,
//         "Tank-Magic": 6,
//         "None": 5
//     };

//     // Combina stats base com bônus de itens/extras
//     const s = { ...stats, ...bonuses };

//     const con = s.constitution || 0;
//     const str = s.strength || 0;
//     const int = s.intelligence || 0;

//     const multiplier = growthTable[archetype] || 5;

//     // Fórmula baseada na planilha:
//     // 10 + ((CON + 0,25*FOR + 0,25*INT) * multiplier)
//     const hp = 10 + ((con) + 0.25 * str + 0.25 * int) * multiplier;

//     return Math.ceil(hp); // ARREDONDAR.PARA.CIMA
// }


// export const calculateMaxMP = (stats: StatsDTO, bonuses?: Partial<Record<keyof StatsDTO, number>>, archetype: string = "None") => {
//     const growthTable: Record<string, number> = {
//         "Melee": 4,
//         "Ranged": 4,
//         "Magic": 11,
//         "Healer": 9,
//         "Tank": 2,
//         "Tank-Healer": 5,
//         "Melee-Magic": 6,
//         "Ranged-Magic": 5,
//         "Magic-Healer": 12,
//         "Tank-Melee": 3,
//         "Tank-Ranged": 2,
//         "Tank-Magic": 7,
//         "None": 5
//     };
//     // Combina stats base com bônus de itens/extras
//     const s = { ...stats, ...bonuses }; 
//     const int = s.intelligence || 0;
//     const wis = s.wisdom || 0;

//     console.log("Calculating MP with stats:", s, "and archetype:", archetype);

//     const multiplier = growthTable[archetype] || 5;

//     // Fórmula baseada na planilha:
//     // 10 + ((INT + SAB) * multiplier)
//     const mp = 10 + Math.ceil(((int + wis) / 2)) * multiplier;
//     return mp; // ARREDONDAR.PARA.CIMA
// }

// export const calculateMaxTP = (stats: StatsDTO, bonuses?: Partial<Record<keyof StatsDTO, number>>, archetype: string = "None") => {
//     const growthTable: Record<string, number> = {
//         "Melee": 7,
//         "Ranged": 9,
//         "Magic": 2,
//         "Healer": 3,
//         "Tank": 5,
//         "Tank-Healer": 3,
//         "Melee-Magic": 6,
//         "Ranged-Magic": 8,
//         "Magic-Healer": 2,
//         "Tank-Melee": 6,
//         "Tank-Ranged": 7,
//         "Tank-Magic": 2,
//         "None": 5
//     };
//     // Combina stats base com bônus de itens/extras
//     const s = { ...stats, ...bonuses }; 
//     const dex = s.dexterity || 0;
//     const str = s.strength || 0;

//     const multiplier = growthTable[archetype] || 5;

//     // Fórmula baseada na planilha:
//     // 10 + ((INT + SAB) * multiplier)
//     const tp = 10 + Math.ceil(((dex + str) / 2)) * multiplier;
//     return tp; // ARREDONDAR.PARA.CIMA
// }