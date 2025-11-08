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
  CampaignDTO,
  CreateCampaignDTO,
  CampaignMemberDTO,
  CreateCampaignMemberDTO,
  UpdateCampaignMemberDTO,
  CampaignMemberWithUserDTO,
  CharacterPerCampaignWithCharacterDTO,
  CreateCharacterPerCampaignDTO,
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
  CampaignMemberRole,
  CampaignCharacterRole,
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
export type Campaign = CampaignDTO;
export type CreateCampaign = CreateCampaignDTO;
export type CampaignMember = CampaignMemberDTO;
export type CreateCampaignMember = CreateCampaignMemberDTO;
export type UpdateCampaignMember = UpdateCampaignMemberDTO;
export type CampaignMemberWithUser = CampaignMemberWithUserDTO;
export type CharacterPerCampaignWithCharacter =
  CharacterPerCampaignWithCharacterDTO;
export type CreateCharacterPerCampaign = CreateCharacterPerCampaignDTO;

export type AttributeKey = // Chave de Atributo

    | "Força" // Strength
    | "Destreza" // Dexterity
    | "Inteligência" // Intelligence
    | "Sabedoria" // Wisdom
    | "Constituição" // Constitution
    | "Carisma" // Charisma
    | "Destino"; // Destiny

export const GENEROS_MOCK = ["Masculino", "Feminino", "Não Binário", "Outro"];
export const STEPS_NAMES = [
  "Informações Básicas",
  "Atributos",
  "Pericias",
  "Resumo Final",
];

export const SKILL_NAME_MAPPING: Record<string, string> = {
  magicRes: "Res. Mágica",
  fisicalRes: "Res. Física",
  perception: "Percepção",
  intimidation: "Intimidar",
  faith: "Fé",
  inspiration: "Inspiração",
  determination: "Determinação",
  bluff: "Lábia",
  reflexes: "Reflexos",
};

export const STATUS_NAMES: Record<string, string> = {
  hp: "HP",
  mp: "MP",
  tp: "TP",
  mov: "Movimento",
  rf: "Resistência Física",
  rm: "Resistência Mágica",
};
