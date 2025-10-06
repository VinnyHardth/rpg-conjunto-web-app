import { UserDTO } from "@/../../backend/src/resources/user/user.types";
import { CharacterDTO } from "@/../../backend/src/resources/character/character.types";
import { CharacterAttributeDTO } from "@/../../backend/src/resources/characterAttribute/characterAttribute.types";
import { StatusDTO } from "@/../../backend/src/resources/status/status.types";
import { ArchetypeDTO } from "@/../../backend/src/resources/archetype/archetype.types";


export type User = UserDTO;
export type Character = CharacterDTO;
export type CharacterAttribute = CharacterAttributeDTO;
export type Status = StatusDTO;
export type Archetype = ArchetypeDTO;