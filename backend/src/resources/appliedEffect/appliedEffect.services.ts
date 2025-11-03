import { SourceType, StackingPolicy, Prisma } from "@prisma/client";
import {
  CreateAppliedEffectDTO,
  UpdateAppliedEffectDTO,
  AppliedEffectDTO
} from "./appliedEffect.types";

import prisma from "../../prisma";

const toNumeric = (value: unknown): number => {
  if (value == null) return 0;
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (
    typeof value === "object" &&
    value !== null &&
    "toNumber" in value &&
    typeof (value as { toNumber?: () => number }).toNumber === "function"
  ) {
    const result = (value as { toNumber: () => number }).toNumber();
    return Number.isFinite(result) ? result : 0;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const normalizeStatusName = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();

const RESISTANCE_STATUS_KEYS = {
  PHISICAL: ["RESISTENCIAFISICA", "RESFISICA", "RF"],
  MAGIC: ["RESISTENCIAMAGICA", "RESMAGICA", "RM"]
} as const;

const DYNAMIC_COMPONENT_PLACEHOLDER = "TO_DEFINE";

type StatusFieldKey = "valueActual" | "valueMax" | "valueBonus";

type DynamicStatusOverride = {
  token: string;
  normalizedKey: string;
  field: StatusFieldKey;
};

const STATUS_FIELD_LABEL: Record<StatusFieldKey, string> = {
  valueActual: "atual",
  valueMax: "máximo",
  valueBonus: "bônus"
};

const isDynamicPlaceholder = (value?: string | null): boolean =>
  (value ?? "").trim().toUpperCase() === DYNAMIC_COMPONENT_PLACEHOLDER;

const extractTargetFromFormula = (formula?: string | null): string => {
  if (!formula) return "";

  const trimmed = formula.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed);
    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed) &&
      typeof parsed.target === "string"
    ) {
      return parsed.target.trim();
    }
  } catch {
    // not JSON – continue with fallback parsing
  }

  const targetMatch = trimmed.match(/target\s*=\s*([^;]+)/i);
  if (targetMatch?.[1]) {
    return targetMatch[1].trim();
  }

  return "";
};

const parseStatusTargetToken = (
  token: string
): DynamicStatusOverride | null => {
  const trimmed = token.trim();
  if (!trimmed.toLowerCase().startsWith("status.")) return null;

  const [, slugPart, fieldPart] = trimmed.split(".");
  if (!slugPart) return null;

  const normalizedKey = slugPart.replace(/[^a-z0-9]/gi, "").toUpperCase();

  let field: StatusFieldKey = "valueActual";
  switch ((fieldPart ?? "").toLowerCase()) {
    case "max":
      field = "valueMax";
      break;
    case "bonus":
      field = "valueBonus";
      break;
    case "actual":
    case "current":
    default:
      field = "valueActual";
      break;
  }

  return {
    token: trimmed,
    normalizedKey,
    field
  };
};

const resolveDynamicStatusOverride = async (
  tx: Prisma.TransactionClient,
  effectId: string,
  sourceType: SourceType,
  sourceId?: string
): Promise<DynamicStatusOverride | null> => {
  if (!sourceId) return null;

  let formula: string | null | undefined = null;

  if (sourceType === SourceType.SKILL) {
    const abilityEffect = await tx.abilityEffect.findFirst({
      where: {
        abilityId: sourceId,
        effectId,
        deletedAt: null
      }
    });
    formula = abilityEffect?.formula ?? null;
  } else if (sourceType === SourceType.ITEM) {
    const itemEffect = await tx.itemHasEffect.findFirst({
      where: {
        itemId: sourceId,
        effectsId: effectId,
        deletedAt: null
      }
    });
    formula = itemEffect?.formula ?? null;
  }

  if (!formula) return null;

  const targetToken = extractTargetFromFormula(formula);
  if (!targetToken) return null;

  return parseStatusTargetToken(targetToken);
};

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
  sourceId?: string;
};

export async function applyEffectTurn(p: ApplyParams) {
  const {
    characterId,
    effectId,
    sourceType,
    currentTurn,
    duration,
    stacksDelta = 1,
    valuePerStack = 0,
    sourceId
  } = p;

  return prisma.$transaction(async (tx) => {
    const effect = await tx.effect.findUnique({
      where: { id: effectId },
      include: { targets: true } // EffectModifier[]
    });
    if (!effect) throw new Error("Effect not found");

    const hasDynamicStatusTarget = effect.targets.some(
      (target) =>
        target.componentType === "STATUS" &&
        isDynamicPlaceholder(target.componentName)
    );

    const dynamicStatusOverride = hasDynamicStatusTarget
      ? await resolveDynamicStatusOverride(tx, effectId, sourceType, sourceId)
      : null;

    if (hasDynamicStatusTarget && !dynamicStatusOverride) {
      throw new Error(
        `Effect ${effectId} requires a status target definition for source ${sourceType}.`
      );
    }

    const baseDuration =
      typeof effect.baseDuration === "number" ? effect.baseDuration : 0;
    const effectiveDuration = duration > 0 ? duration : baseDuration;

    const statusList = await tx.status.findMany({
      where: { characterId }
    });
    const statusByNormalizedName = new Map(
      statusList.map((status) => [normalizeStatusName(status.name), status])
    );
    const statusByUppercaseName = new Map(
      statusList.map((status) => [status.name.toUpperCase(), status])
    );

    const refreshStatusMaps = (status: (typeof statusList)[number]): void => {
      statusByUppercaseName.set(status.name.toUpperCase(), status);
      statusByNormalizedName.set(normalizeStatusName(status.name), status);
    };

    type EffectTarget = (typeof effect.targets)[number];

    const resolveStatusTarget = (
      modifier: EffectTarget
    ): {
      status: (typeof statusList)[number];
      field: StatusFieldKey;
    } | null => {
      if (modifier.componentType !== "STATUS") return null;

      if (isDynamicPlaceholder(modifier.componentName)) {
        if (!dynamicStatusOverride) return null;
        const status =
          statusByNormalizedName.get(dynamicStatusOverride.normalizedKey) ??
          null;
        if (!status) return null;
        return {
          status,
          field: dynamicStatusOverride.field
        };
      }

      const componentName = modifier.componentName ?? "";
      const upperName = componentName.toUpperCase();
      const normalizedName = componentName
        ? normalizeStatusName(componentName)
        : "";

      const status =
        statusByUppercaseName.get(upperName) ??
        (normalizedName
          ? (statusByNormalizedName.get(normalizedName) ?? null)
          : null);

      if (!status) return null;

      return { status, field: "valueActual" };
    };

    const resolveResistance = async (damageType: string): Promise<number> => {
      if (damageType !== "PHISICAL" && damageType !== "MAGIC") return 0;
      const keys =
        damageType === "PHISICAL"
          ? RESISTANCE_STATUS_KEYS.PHISICAL
          : RESISTANCE_STATUS_KEYS.MAGIC;
      for (const key of keys) {
        const status = statusByNormalizedName.get(key);
        if (status) {
          const actual = toNumeric(status.valueActual);
          const maxVal = toNumeric(status.valueMax);
          const bonus = toNumeric(status.valueBonus);
          const baseValue = Math.max(actual, maxVal);
          return baseValue + bonus;
        }
      }
      const resistanceAttrName =
        damageType === "PHISICAL" ? "Res. Física" : "Res. Mágica";
      const resistanceAttr = await tx.characterAttribute.findFirst({
        where: {
          characterId,
          attribute: { name: resistanceAttrName }
        },
        include: { attribute: true }
      });
      if (resistanceAttr) {
        return (
          toNumeric(resistanceAttr.valueBase) +
          toNumeric(resistanceAttr.valueInv) +
          toNumeric(resistanceAttr.valueExtra)
        );
      }
      return 0;
    };

    // ----------- EFEITO INSTANTÂNEO ----------- //
    if (effectiveDuration <= 0) {
      const immediateResults: any[] = [];

      // Aplicação imediata em STATUS, se houver targets
      for (const t of effect.targets) {
        if (t.componentType !== "STATUS") continue;

        const resolution = resolveStatusTarget(t);
        if (!resolution) {
          if (isDynamicPlaceholder(t.componentName)) {
            throw new Error(
              `Effect ${effectId} requires a dynamic status target but none was provided.`
            );
          }
          continue;
        }

        const { status, field } = resolution;
        const statusNormalized = normalizeStatusName(status.name);
        const operation = t.operationType;

        let delta = valuePerStack * stacksDelta;

        if (
          operation === "ADD" &&
          field === "valueActual" &&
          delta < 0 &&
          (effect.damageType === "PHISICAL" || effect.damageType === "MAGIC") &&
          statusNormalized === "HP"
        ) {
          const resistanceValue = await resolveResistance(effect.damageType);
          if (resistanceValue !== 0) {
            delta = Math.min(0, delta + resistanceValue);
          }
        }

        const initialValue = toNumeric((status as any)[field]);
        let newValue = initialValue;

        if (operation === "ADD") {
          newValue += delta;
        } else if (operation === "MULT") {
          newValue *= delta;
          delta = newValue - initialValue;
        } else if (operation === "SET") {
          newValue = delta;
          delta = newValue - initialValue;
        }

        if (field === "valueActual") {
          const max = toNumeric(status.valueMax) + toNumeric(status.valueBonus);
          if (statusNormalized === "HP") {
            newValue = Math.min(newValue, max);
          } else {
            newValue = Math.min(Math.max(0, newValue), max);
          }
        } else {
          newValue = Math.max(newValue, 0);
        }

        const updateData: Record<string, number> = { [field]: newValue };
        await tx.status.update({
          where: { id: status.id },
          data: updateData
        });

        (status as any)[field] = newValue;
        refreshStatusMaps(status);

        const fieldLabel =
          field === "valueActual" ? null : STATUS_FIELD_LABEL[field];
        const targetLabel = fieldLabel
          ? `${status.name} (${fieldLabel})`
          : status.name;

        immediateResults.push({
          target: targetLabel,
          delta,
          initialValue,
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
          duration: effectiveDuration,
          startedAt: currentTurn,
          expiresAt: currentTurn + effectiveDuration,
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
              duration: effectiveDuration,
              expiresAt: currentTurn + effectiveDuration,
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
              duration: effectiveDuration,
              expiresAt: Math.max(
                existing.expiresAt,
                currentTurn + effectiveDuration
              ),
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
              duration: effectiveDuration,
              startedAt: currentTurn,
              expiresAt: currentTurn + effectiveDuration,
              value: stacksDelta * valuePerStack
            }
          });
          break;
      }
    }

    // Aplicar efeitos acumulativos em STATUS, se aplicável
    for (const t of effect.targets) {
      if (t.componentType !== "STATUS") continue;

      const resolution = resolveStatusTarget(t);
      if (!resolution) {
        if (isDynamicPlaceholder(t.componentName)) {
          throw new Error(
            `Effect ${effectId} requires a dynamic status target but none was provided.`
          );
        }
        continue;
      }

      if (valuePerStack === 0) continue;

      const { status, field } = resolution;
      const operation = t.operationType;

      const delta = valuePerStack * applied.stacks;
      const initialValue = toNumeric((status as any)[field]);
      let newValue = initialValue;

      if (operation === "ADD") {
        newValue += delta;
      } else if (operation === "MULT") {
        newValue *= delta;
      } else if (operation === "SET") {
        newValue = delta;
      }

      if (field === "valueActual") {
        const max = toNumeric(status.valueMax) + toNumeric(status.valueBonus);
        const statusNormalized = normalizeStatusName(status.name);
        if (statusNormalized === "HP") {
          newValue = Math.min(newValue, max);
        } else {
          newValue = Math.min(Math.max(0, newValue), max);
        }
      } else {
        newValue = Math.max(newValue, 0);
      }

      const updateData: Record<string, number> = { [field]: newValue };
      await tx.status.update({
        where: { id: status.id },
        data: updateData
      });

      (status as any)[field] = newValue;
      refreshStatusMaps(status);
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
