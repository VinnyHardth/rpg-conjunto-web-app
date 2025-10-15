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

    // ----------- EFEITO INSTANTÂNEO -----------
    // duração <= 0 → não persiste, apenas retorna payload imediato
    if (duration <= 0) {
      const payload = {
        effectId,
        damageType: effect.damageType,
        targets: effect.targets,
        sourceType
      };
      return { applied: null, immediate: payload };
    }

    // ----------- DANO IMEDIATO -----------
    // TRUE/PHYSICAL/MAGIC → resolver na engine de combate
    if (effect.damageType !== ("NONE" as DamageType)) {
      const payload = {
        effectId,
        damageType: effect.damageType,
        targets: effect.targets,
        sourceType
      };
      return { applied: null, immediate: payload };
    }

    // ----------- BUFF / DEBUFF (damageType = NONE) -----------
    // cria ou atualiza instância com duração
    const existing = await tx.appliedEffect.findFirst({
      where: {
        characterId,
        effectId,
        sourceType,
        deletedAt: null,
        expiresAt: { gte: currentTurn }
      }
    });

    if (!existing) {
      const stacks = Math.max(1, stacksDelta);
      const applied = await tx.appliedEffect.create({
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

      return { applied, immediate: null };
    }

    // ----------- POLÍTICAS DE REAPLICAÇÃO -----------
    let applied = existing;

    switch (effect.stackingPolicy as StackingPolicy) {
      case "NONE":
        applied = existing;
        break;

      case "REFRESH":
        applied = await tx.appliedEffect.update({
          where: { id: existing.id },
          data: {
            duration,
            expiresAt: currentTurn + duration,
            value: existing.stacks * valuePerStack
          }
        });
        break;

      case "STACK": {
        const stacks = existing.stacks + stacksDelta;
        const expiresAt = Math.max(existing.expiresAt, currentTurn + duration);
        applied = await tx.appliedEffect.update({
          where: { id: existing.id },
          data: { stacks, duration, expiresAt, value: stacks * valuePerStack }
        });
        break;
      }

      case "REPLACE":
      default: {
        const stacks = Math.max(1, stacksDelta);
        applied = await tx.appliedEffect.update({
          where: { id: existing.id },
          data: {
            stacks,
            duration,
            startedAt: currentTurn,
            expiresAt: currentTurn + duration,
            value: stacks * valuePerStack
          }
        });
        break;
      }
    }

    return { applied, immediate: null };
  });
}

export async function advanceTurn(characterId: string, nextTurn: number) {
  // nada a decrementar no schema; apenas deixe expirar por filtro de turno
  // opcional: soft-delete os expirados para limpeza
  await prisma.appliedEffect.updateMany({
    where: { characterId, deletedAt: null, expiresAt: { lt: nextTurn } },
    data: { deletedAt: new Date() }
  });
}

type Mods = Record<string, number>;

function applyOp(base: number, op: string, delta: number) {
  if (op === "ADD") return base + delta;
  if (op === "MULTIPLY") return Math.floor(base * delta);
  if (op === "SET") return delta;
  return base;
}

export async function getCharacterComputed(
  characterId: string,
  currentTurn: number
) {
  const [ch, apps] = await Promise.all([
    prisma.character.findUnique({ where: { id: characterId } }),
    prisma.appliedEffect.findMany({
      where: { characterId, deletedAt: null, expiresAt: { gte: currentTurn } },
      include: { effect: { include: { targets: true } } } // EffectModifier[]
    })
  ]);
  if (!ch) throw new Error("Character not found");

  // agregue modificadores
  const modBucket: Mods = {}; // por componentName
  for (const a of apps) {
    if (a.effect.damageType !== "NONE") continue; // buffs/debuffs apenas
    const stacks = a.stacks;
    for (const t of a.effect.targets) {
      const key = t.componentName; // ex: "strength"
      const perStack = a.value || 0; // ou derive de EffectModifier se houver campo
      const delta = perStack * stacks; // regra simples; ajuste se EffectModifier carrega valor próprio
      modBucket[key] = applyOp(modBucket[key] ?? 0, t.operationType, delta);
    }
  }

  // exemplo: aplicar no objeto retornado (não persiste)
  const computed = {
    ...ch,
    // aplique apenas para chaves que existem no Character
    strength:
      (ch as any).strength != null
        ? (ch as any).strength + (modBucket["strength"] ?? 0)
        : undefined,
    defense:
      (ch as any).defense != null
        ? (ch as any).defense + (modBucket["defense"] ?? 0)
        : undefined,
    // adicione outras chaves conforme seu Character
    _mods: modBucket
  };

  return computed;
}
