import {
  PrismaClient,
  SourceType,
  StackingPolicy,
  DamageType
} from "@prisma/client";
import {
  CreateAppliedEffectDTO,
  UpdateAppliedEffectDTO,
  AppliedEffectDTO
} from "./appliedEffect.types";

const prisma = new PrismaClient();

export const createAppliedEffect = async (
  data: CreateAppliedEffectDTO
): Promise<AppliedEffectDTO> => {
  return prisma.appliedEffect.create({ data });
};

export const getAppliedEffectById = async (
  id: string
): Promise<AppliedEffectDTO | null> => {
  return prisma.appliedEffect.findUnique({ where: { id } });
};

export const getAppliedEffects = async (): Promise<AppliedEffectDTO[]> => {
  return prisma.appliedEffect.findMany();
};

export const updateAppliedEffect = async (
  id: string,
  data: UpdateAppliedEffectDTO
): Promise<AppliedEffectDTO> => {
  return prisma.appliedEffect.update({ where: { id }, data });
};

export const deleteAppliedEffect = async (
  id: string
): Promise<AppliedEffectDTO> => {
  return prisma.appliedEffect.update({
    where: { id },
    data: { deletedAt: new Date() }
  });
};

type ApplyParams = {
  characterId: string;
  effectId: string;
  sourceType: SourceType;
  currentTurn: number;
  duration: number; // em turnos
  stacksDelta?: number; // default 1
  valuePerStack?: number; // default 0 (para NONE/buffs)
};

export async function applyEffectTurn(p: ApplyParams) {
  const {
    characterId,
    effectId,
    sourceType,
    currentTurn,
    duration,
    stacksDelta = 1,
    valuePerStack = 0
  } = p;

  return prisma.$transaction(async (tx) => {
    const effect = await tx.effect.findUnique({
      where: { id: effectId },
      include: { targets: true } // EffectModifier[]
    });
    if (!effect) throw new Error("Effect not found");

    // ----------- EFEITO INSTANTÂNEO ----------- //
    if (duration <= 0) {
      // Aplicação imediata em STATUS, se houver targets
      for (const t of effect.targets) {
        if (t.componentType !== "STATUS") continue;
        const targetName = t.componentName.toUpperCase();
        const status = await tx.status.findUnique({
          where: { characterId_name: { characterId, name: targetName } }
        });
        if (!status) continue;

        const delta = valuePerStack * stacksDelta;
        const op = t.operationType;

        let newValue = status.valueActual;
        if (op === "ADD") newValue += delta;
        else if (op === "MULT") newValue *= delta;
        else if (op === "SET") newValue = delta;

        const max = status.valueMax + status.valueBonus;
        newValue = Math.min(Math.max(0, newValue), max);

        await tx.status.update({
          where: { id: status.id },
          data: { valueActual: newValue }
        });
      }

      return {
        applied: null,
        immediate: {
          effectId,
          damageType: effect.damageType,
          targets: effect.targets,
          sourceType
        }
      };
    }

    // ----------- DANO IMEDIATO (True/Physical/Magic) ----------- //
    if (effect.damageType !== DamageType.NONE) {
      return {
        applied: null,
        immediate: {
          effectId,
          damageType: effect.damageType,
          targets: effect.targets,
          sourceType
        }
      };
    }

    // ----------- BUFF/DEBUFF (damageType = NONE) ----------- //
    const existing = await tx.appliedEffect.findFirst({
      where: {
        characterId,
        effectId,
        sourceType,
        deletedAt: null,
        expiresAt: { gte: currentTurn }
      }
    });

    let applied = existing;

    if (!existing) {
      const stacks = Math.max(1, stacksDelta);
      applied = await tx.appliedEffect.create({
        data: {
          characterId,
          effectId,
          sourceType,
          duration,
          startedAt: currentTurn,
          expiresAt: currentTurn + duration,
          stacks,
          value: stacks * valuePerStack
        }
      });
    } else {
      switch (effect.stackingPolicy) {
        case StackingPolicy.REFRESH:
          applied = await tx.appliedEffect.update({
            where: { id: existing.id },
            data: {
              duration,
              expiresAt: currentTurn + duration,
              value: existing.stacks * valuePerStack
            }
          });
          break;
        case StackingPolicy.STACK:
          const stacks = existing.stacks + stacksDelta;
          applied = await tx.appliedEffect.update({
            where: { id: existing.id },
            data: {
              stacks,
              duration,
              expiresAt: Math.max(existing.expiresAt, currentTurn + duration),
              value: stacks * valuePerStack
            }
          });
          break;
        case StackingPolicy.REPLACE:
        default:
          applied = await tx.appliedEffect.update({
            where: { id: existing.id },
            data: {
              stacks: Math.max(1, stacksDelta),
              duration,
              startedAt: currentTurn,
              expiresAt: currentTurn + duration,
              value: stacksDelta * valuePerStack
            }
          });
          break;
      }
    }

    // Aplicar efeitos acumulativos em STATUS, se aplicável
    for (const t of effect.targets) {
      if (t.componentType !== "STATUS") continue;
      const targetName = t.componentName.toUpperCase();
      const status = await tx.status.findUnique({
        where: { characterId_name: { characterId, name: targetName } }
      });
      if (!status) continue;

      const delta = valuePerStack * applied.stacks;
      let newValue = status.valueActual;

      if (t.operationType === "ADD") newValue += delta;
      else if (t.operationType === "MULT") newValue *= delta;
      else if (t.operationType === "SET") newValue = delta;

      const max = status.valueMax + status.valueBonus;
      newValue = Math.min(Math.max(0, newValue), max);

      await tx.status.update({
        where: { id: status.id },
        data: { valueActual: newValue }
      });
    }

    return { applied, immediate: null };
  });
}

export const getAppliedEffectsByCharacterId = async (
  characterId: string
): Promise<AppliedEffectDTO[]> => {
  return prisma.appliedEffect.findMany({
    where: { characterId, deletedAt: null }
  });
};
