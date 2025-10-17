import { SourceType, StackingPolicy } from "@prisma/client";
import {
  CreateAppliedEffectDTO,
  UpdateAppliedEffectDTO,
  AppliedEffectDTO
} from "./appliedEffect.types";

import prisma from "../../prisma";

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
      const immediateResults: any[] = [];

      // Aplicação imediata em STATUS, se houver targets
      for (const t of effect.targets) {
        if (t.componentType !== "STATUS") continue;
        const targetName = t.componentName.toUpperCase();
        const status = await tx.status.findUnique({
          where: { characterId_name: { characterId, name: targetName } }
        });
        if (!status) continue;

        let delta = valuePerStack * stacksDelta;
        const op = t.operationType;

        // --- LÓGICA DE RESISTÊNCIA ---
        // Se o efeito for de dano (ADD com valor negativo) e o alvo for HP
        if (
          targetName === "HP" &&
          delta < 0 &&
          (effect.damageType === "PHISICAL" || effect.damageType === "MAGIC")
        ) {
          const resistanceAttrName =
            effect.damageType === "PHISICAL" ? "Res. Física" : "Res. Mágica";

          // Busca o valor da perícia de resistência, que já está calculado e salvo no DB.
          const resistanceAttr = await tx.characterAttribute.findFirst({
            where: {
              characterId,
              attribute: { name: resistanceAttrName }
            },
            include: { attribute: true }
          });

          if (resistanceAttr) {
            const resistanceValue =
              resistanceAttr.valueBase +
              resistanceAttr.valueInv +
              resistanceAttr.valueExtra;
            delta = Math.min(0, delta + resistanceValue);
          }
        }

        let newValue = status.valueActual;
        if (op === "ADD") newValue += delta;
        else if (op === "MULT") newValue *= delta;
        else if (op === "SET") newValue = delta;

        const max = status.valueMax + status.valueBonus;
        if (targetName === "HP") {
          newValue = Math.min(newValue, max); // HP pode ser negativo
        } else {
          newValue = Math.min(Math.max(0, newValue), max); // Outros status não
        }

        await tx.status.update({
          where: { id: status.id },
          data: { valueActual: newValue }
        });

        immediateResults.push({
          target: targetName,
          delta,
          initialValue: status.valueActual,
          finalValue: newValue
        });
      }

      return {
        applied: null,
        immediate: {
          ...p,
          results: immediateResults
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
      if (targetName === "HP") {
        newValue = Math.min(newValue, max); // HP pode ser negativo
      } else {
        newValue = Math.min(Math.max(0, newValue), max); // Outros status não
      }

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

/**
 * Avança um turno para um efeito específico, decrementando sua duração.
 * Se a duração chegar a 0, o efeito é marcado como deletado.
 * @param id O ID do AppliedEffect.
 */
export const advanceEffectTurn = async (
  id: string
): Promise<AppliedEffectDTO> => {
  return prisma.$transaction(async (tx) => {
    const effect = await tx.appliedEffect.findUnique({
      where: { id, deletedAt: null }
    });

    if (!effect) {
      throw new Error(
        `AppliedEffect with ID ${id} not found or already expired.`
      );
    }

    const newDuration = effect.duration - 1;

    return tx.appliedEffect.update({
      where: { id },
      data: {
        duration: newDuration,
        deletedAt: newDuration <= 0 ? new Date() : null
      }
    });
  });
};

/**
 * Avança um turno para TODOS os efeitos ativos, decrementando suas durações.
 * Efeitos cuja duração chega a 0 são marcados como deletados.
 * @returns Uma contagem dos efeitos atualizados e expirados.
 */
export const advanceAllEffectsTurn = async (): Promise<{
  updatedCount: number;
  expiredCount: number;
}> => {
  return prisma.$transaction(async (tx) => {
    // 1. Decrementa a duração de todos os efeitos ativos que possuem duração.
    const updateResult = await tx.appliedEffect.updateMany({
      where: {
        deletedAt: null,
        duration: { gt: 0 }
      },
      data: {
        duration: { decrement: 1 }
      }
    });

    // 2. Marca como deletados os efeitos que acabaram de expirar.
    const expireResult = await tx.appliedEffect.updateMany({
      where: { deletedAt: null, duration: { lte: 0 } },
      data: { deletedAt: new Date() }
    });

    return {
      updatedCount: updateResult.count,
      expiredCount: expireResult.count
    };
  });
};

/**
 * Avança um turno para TODOS os efeitos ativos de um personagem específico.
 * @param characterId O ID do personagem.
 * @returns Uma contagem dos efeitos atualizados e expirados.
 */
export const advanceCharacterEffectsTurn = async (
  characterId: string
): Promise<{
  updatedCount: number;
  expiredCount: number;
}> => {
  return prisma.$transaction(async (tx) => {
    // 1. Decrementa a duração de todos os efeitos ativos do personagem.
    const updateResult = await tx.appliedEffect.updateMany({
      where: {
        characterId,
        deletedAt: null,
        duration: { gt: 0 }
      },
      data: {
        duration: { decrement: 1 }
      }
    });

    // 2. Marca como deletados os efeitos que acabaram de expirar para esse personagem.
    const expireResult = await tx.appliedEffect.updateMany({
      where: { characterId, deletedAt: null, duration: { lte: 0 } },
      data: { deletedAt: new Date() }
    });

    return {
      updatedCount: updateResult.count,
      expiredCount: expireResult.count
    };
  });
};
