import { Character } from "@prisma/client";

type CreateCharacterDTO = Pick<
    Character, "name" | "race" | "age" | "height" | "money" | "imageUrl" | "userId" | "archetypeId" | "generation" | "type" | "annotations"
>;
type UpdateCharacterDTO = Partial<CreateCharacterDTO>;
type DeleteCharacterDTO = Pick<Character, "id">;
type CharacterDTO = Character;

export {
    CreateCharacterDTO,
    UpdateCharacterDTO,
    DeleteCharacterDTO,
    CharacterDTO,
};