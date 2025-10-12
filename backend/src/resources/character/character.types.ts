import { Character } from "@prisma/client";
import { CharacterAttribute } from "@prisma/client";
import { Skill } from "@prisma/client";
import { Status } from "@prisma/client";
import { Archetype } from "@prisma/client";
import { CharacterHasItem } from "@prisma/client";

import { UpdateCharacterAttributeDTO, CreateCharacterAttributeDTO } from "../characterAttribute/characterAttribute.types";
import { CreateCharacterHasItemDTO, UpdateCharacterHasItemDTO } from "../characterHasItem/characterHasItem.types";
import { CreateSkillDTO, UpdateSkillDTO } from "../skill/skill.types";
import { CreateStatusDTO, UpdateStatusDTO } from "../status/status.types";

type CreateCharacterDTO = Pick<
  Character,
  | "name"
  | "race"
  | "age"
  | "height"
  | "money"
  | "imageUrl"
  | "userId"
  | "archetypeId"
  | "generation"
  | "type"
  | "annotations"
  | "gender"
>;
type UpdateCharacterDTO = Partial<CreateCharacterDTO>;
type DeleteCharacterDTO = Pick<Character, "id">;
type CharacterDTO = Character;

type FullCharacterData = {
  info: CharacterDTO;
  archetype: Archetype | null;
  attributes: CharacterAttribute[];
  status: Status[];
  inventory: CharacterHasItem[];
  skills: Skill[];
};


type UpdateFullCharacterDTO = {
  character: UpdateCharacterDTO;
  attributes: UpdateCharacterAttributeDTO[];
  status: UpdateStatusDTO[];
  inventory: UpdateCharacterHasItemDTO[];
  skills: UpdateSkillDTO[];
}

export {
  FullCharacterData,
  UpdateFullCharacterDTO,
  CreateCharacterDTO,
  UpdateCharacterDTO,
  DeleteCharacterDTO,
  CharacterDTO,
};
