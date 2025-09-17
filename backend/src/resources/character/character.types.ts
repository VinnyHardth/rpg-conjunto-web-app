import { Character } from "@prisma/client";

type CreateCharacterDTO = Pick<
    Character, "name" | "nickname" | "description" | "imageUrl" | "archetype" | "userId"
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