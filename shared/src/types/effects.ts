import type { DateTime } from "./common";
import type {
  DamageType,
  StackingPolicy,
  ComponentType,
  OperationType,
  SourceType,
} from "../enums";

export interface EffectDTO {
  id: string;
  name: string;
  imgUrl: string | null;
  description: string | null;
  removableBy: string | null;
  damageType: DamageType;
  stackingPolicy: StackingPolicy;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateEffectDTO {
  name: string;
  imgUrl?: string | null;
  description?: string | null;
  damageType: DamageType;
  stackingPolicy: StackingPolicy;
  removableBy?: string | null;
}

export type UpdateEffectDTO = Partial<CreateEffectDTO>;

export interface DeleteEffectDTO {
  id: string;
}

export interface EffectModifierDTO {
  id: string;
  effectId: string;
  componentName: string;
  componentType: ComponentType;
  operationType: OperationType;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateEffectModifierDTO {
  effectId: string;
  componentName: string;
  componentType: ComponentType;
  operationType: OperationType;
}

export type UpdateEffectModifierDTO = Partial<CreateEffectModifierDTO>;

export interface DeleteEffectModifierDTO {
  id: string;
}

export interface AppliedEffectDTO {
  id: string;
  characterId: string;
  effectId: string;
  sourceType: SourceType;
  duration: number;
  startedAt: number;
  expiresAt: number;
  stacks: number;
  value: number;
  createdAt: DateTime;
  updatedAt: DateTime;
  deletedAt: DateTime | null;
}

export interface CreateAppliedEffectDTO {
  characterId: string;
  effectId: string;
  sourceType: SourceType;
  duration?: number;
  startedAt?: number;
  expiresAt?: number;
  stacks?: number;
  value?: number;
}

export type UpdateAppliedEffectDTO = Partial<CreateAppliedEffectDTO>;

export interface DeleteAppliedEffectDTO {
  id: string;
}
