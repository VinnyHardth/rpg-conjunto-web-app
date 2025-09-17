import { CharacterState } from "@prisma/client";

type CreateCharacterStateDTO = Pick<
    CharacterState, "characterId"
>;
type UpdateCharacterStateDTO = Partial<Omit<CharacterStateDTO, "characterId">>;
type DeleteCharacterStateDTO = Pick<CharacterState, "id">;
type CharacterStateDTO = CharacterState;

export {
    CreateCharacterStateDTO,
    UpdateCharacterStateDTO,
    DeleteCharacterStateDTO,
    CharacterStateDTO,
};