import { Abilities } from '@prisma/client';

type CreateAbilitiesDTO = Pick<Abilities, "name" | "description" | "imageURL" | "cost_type" | "mp_cost" | "tp_cost" | "hp_cost" | "cooldown_value">;
type UpdateAbilitiesDTO = Partial<CreateAbilitiesDTO>;
type AbilitiesDTO = Abilities;
type DeleteAbilitiesDTO = Pick<Abilities, 'id'>;

export { CreateAbilitiesDTO, UpdateAbilitiesDTO, AbilitiesDTO, DeleteAbilitiesDTO };
