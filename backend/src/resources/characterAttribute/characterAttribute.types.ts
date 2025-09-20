import { CharacterAttribute } from '@prisma/client';

export type CreateCharacterAttributeDTO = Pick<CharacterAttribute, "attributeId" | "characterId" | "valueBase" | "valueExtra" | "valueInv" >;
export type UpdateCharacterAttributeDTO = Partial<CreateCharacterAttributeDTO>;
export type CharacterAttributeDTO = CharacterAttribute;
export type DeleteCharacterAttributeDTO = Pick<CharacterAttribute, 'id'>;
