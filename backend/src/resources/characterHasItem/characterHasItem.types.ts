import { CharacterHasItem } from '@prisma/client';

export type CreateCharacterHasItemDTO = Pick<CharacterHasItem, "characterId" | "itemId" | "quantity"  | "value" | "is_equipped" | "equipped_slot">;
export type UpdateCharacterHasItemDTO = Partial<CreateCharacterHasItemDTO>;
export type CharacterHasItemDTO = CharacterHasItem;
export type DeleteCharacterHasItemDTO = Pick<CharacterHasItem, 'id'>;
