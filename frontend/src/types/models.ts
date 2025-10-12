import {
  UserDTO,
  LoginUserDTO,
  CharacterDTO,
  CreateCharacterDTO,
  CharacterAttributeDTO,
  CreateCharacterAttributeDTO,
  StatusDTO,
  CreateStatusDTO,
  ArchetypeDTO,
  AttributesDTO,
} from "@rpg/shared";

export {
  CostType,
  SkillUseType,
  SourceType,
  DamageType,
  StackingPolicy,
  EquipSlot,
  AttributeKind,
  ItemType,
  CharacterType,
  ComponentType,
  OperationType,
} from "@rpg/shared";

export interface CreateFullCharacter {
  info: CreateCharacterDTO;
  attributes: CreateCharacterAttributeDTO[];
  expertises: CreateCharacterAttributeDTO[];
  status: CreateStatusDTO[];
  archetype: Archetype;
}

// Aliases for cleaner usage
export type User = UserDTO;
export type LoginUser = LoginUserDTO;
export type Character = CharacterDTO;
export type CreateCharacter = CreateCharacterDTO & {
  initialHp?: number;
  initialMp?: number;
  initialTp?: number;
};

export type CharacterAttribute = CharacterAttributeDTO;
export type CreateCharacterAttribute = CreateCharacterAttributeDTO;
export type Status = StatusDTO;
export type Attributes = AttributesDTO;
export type Archetype = ArchetypeDTO;

export type AttributeKey =
  | "Strength"
  | "Dexterity"
  | "Intelligence"
  | "Wisdom"
  | "Constitution"
  | "Charisma"
  | "Destiny";

export const GENEROS_MOCK = ["Masculino", "Feminino", "Não Binário", "Outro"];
export const STEPS_NAMES = [
  "Informações Básicas",
  "Atributos & Estatísticas",
  "Resumo Final",
];
