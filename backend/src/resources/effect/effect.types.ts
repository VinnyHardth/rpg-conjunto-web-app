import { Effect } from '@prisma/client';

type CreateEffectDTO = Pick<Effect, "name" | "imgUrl">;
type UpdateEffectDTO = Partial<CreateEffectDTO>;
type EffectDTO = Effect;
type DeleteEffectDTO = Pick<Effect, 'id'>;

export { CreateEffectDTO, UpdateEffectDTO, EffectDTO, DeleteEffectDTO };