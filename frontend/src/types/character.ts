export type AttributeKey = 
  | "Strength" | "Dexterity" | "Intelligence" | "Wisdom" 
  | "Constitution" | "Charisma" | "Destiny";

export const ATTRIBUTE_KEYS: AttributeKey[] = [
  "Strength", "Dexterity", "Intelligence", "Wisdom", 
  "Constitution", "Charisma", "Destiny",
];

export const SKILL_KEYS = [
  "magicRes", "fisicalRes", "perception", "intimidation", 
  "faith", "inspiration", "determination", "bluff", "reflexes",
];

export const GENEROS_MOCK = ["Masculino", "Feminino", "Não-Binário", "Outro"];
export const STEP_NAMES = ["Informações Básicas", "Atributos & Estatísticas", "Resumo Final"];

export type Archetype = {
  name: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  tp: number;
  hp: number;
  mp: number;
};

export type CharacterData = {
  nome: string;
  raca: string;
  idade: number | string;
  altura: number | string;
  genero: string;
  atributos: Record<AttributeKey, number | string>;
  archetype: Archetype;
};

export type DerivedStats = {
  hp: number;
  mp: number;
  tp: number;
  mov: number;
  pericias: Record<string, number>;
};