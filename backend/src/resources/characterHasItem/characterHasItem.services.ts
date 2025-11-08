import { PrismaClient, EquipSlot, Prisma } from "@prisma/client";
import { calculateStatus as sharedCalculateStatus } from "@rpg/shared";
import {
  CreateCharacterHasItemDTO,
  UpdateCharacterHasItemDTO,
  CharacterHasItemDTO
} from "./characterHasItem.types";

const prisma = new PrismaClient();

const DYNAMIC_COMPONENT_PLACEHOLDER = "TO_DEFINE";

type StatusFieldKey = "valueActual" | "valueMax" | "valueBonus";

type StatusRecord = Prisma.StatusGetPayload<{
  select: {
    id: true;
    name: true;
    valueActual: true;
    valueMax: true;
    valueBonus: true;
  };
}>;

type AttributeInfo = {
  id: string;
  name: string;
  slug: string;
};

type AttributeState = {
  bySlug: Map<string, AttributeInfo>;
  byName: Map<string, AttributeInfo>;
};

type StatusState = {
  byNormalized: Map<string, StatusRecord>;
};

const STATUS_FIELD_LABELS: Record<string, StatusFieldKey> = {
  current: "valueActual",
  actual: "valueActual",
  max: "valueMax",
  bonus: "valueBonus"
};

const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const normalizeStatusName = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]/gi, "")
    .toUpperCase();

const toNumeric = (value: unknown): number => {
  if (value == null) return 0;
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "bigint") return Number(value);
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

const isDynamicPlaceholder = (value?: string | null): boolean =>
  (value ?? "").trim().toUpperCase() === DYNAMIC_COMPONENT_PLACEHOLDER;

const parseEffectLinkFormula = (
  formula: string | null | undefined
): { expr: string; target: string } => {
  if (!formula) return { expr: "", target: "" };

  const trimmed = formula.trim();
  if (!trimmed) return { expr: "", target: "" };

  try {
    const parsed = JSON.parse(trimmed);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const exprValue = typeof parsed.expr === "string" ? parsed.expr : "";
      const targetValue =
        typeof parsed.target === "string" ? parsed.target : "";
      return { expr: exprValue, target: targetValue };
    }
  } catch {
    // ignore – not a JSON payload
  }

  const targetMatch = trimmed.match(/target\s*=\s*([^;]+)/i);
  const exprMatch = trimmed.match(/expr\s*=\s*([^;]+)/i);
  if (targetMatch || exprMatch) {
    return {
      expr: exprMatch ? exprMatch[1].trim() : "",
      target: targetMatch ? targetMatch[1].trim() : ""
    };
  }

  return { expr: trimmed, target: "" };
};

const evaluateNumericExpression = (expr: string): number => {
  const normalized = expr.trim();
  if (!normalized) return 0;

  const direct = Number(normalized.replace(",", "."));
  if (Number.isFinite(direct)) return direct;

  const fallbackMatch = normalized.replace(",", ".").match(/-?\d+(\.\d+)?/);
  if (!fallbackMatch) return 0;

  const fallback = Number(fallbackMatch[0]);
  return Number.isFinite(fallback) ? fallback : 0;
};

const parseStatusTargetToken = (
  token: string
): { normalizedKey: string; field: StatusFieldKey } | null => {
  const match = token.trim().match(/^status\.([a-z0-9_-]+)(?:\.([a-z]+))?$/i);
  if (!match) return null;

  const slug = match[1];
  const fieldAlias = (match[2]?.toLowerCase() ??
    "current") as keyof typeof STATUS_FIELD_LABELS;
  const field = STATUS_FIELD_LABELS[fieldAlias];
  if (!field) return null;

  return {
    normalizedKey: slug.replace(/[^a-z0-9]/gi, "").toUpperCase(),
    field
  };
};

const parseAttributeTargetToken = (token: string): string | null => {
  const match = token.trim().match(/^attr\.([a-z0-9_-]+)$/i);
  if (!match) return null;
  return match[1].toLowerCase();
};

const buildAttributeState = (attributes: AttributeInfo[]): AttributeState => {
  const bySlug = new Map<string, AttributeInfo>();
  const byName = new Map<string, AttributeInfo>();
  attributes.forEach((item) => {
    bySlug.set(item.slug, item);
    byName.set(item.name.trim().toLowerCase(), item);
  });
  return { bySlug, byName };
};

const buildStatusState = (statuses: StatusRecord[]): StatusState => ({
  byNormalized: new Map(
    statuses.map((status) => [normalizeStatusName(status.name), status])
  )
});

const applyStatusDelta = async (
  tx: Prisma.TransactionClient,
  statusState: StatusState,
  status: StatusRecord,
  field: StatusFieldKey,
  delta: number
): Promise<void> => {
  if (delta === 0) return;

  const current = toNumeric((status as any)[field]);
  let nextValue = current + delta;

  if (field === "valueActual") {
    const totalMax = toNumeric(status.valueMax) + toNumeric(status.valueBonus);
    nextValue = Math.min(Math.max(0, nextValue), totalMax);
  }

  const updateData: Record<string, number> = { [field]: nextValue };

  if (field === "valueMax" || field === "valueBonus") {
    const maxBase =
      field === "valueMax" ? nextValue : toNumeric(status.valueMax);
    const bonusBase =
      field === "valueBonus" ? nextValue : toNumeric(status.valueBonus);
    const totalMax = maxBase + bonusBase;
    const actual = toNumeric(status.valueActual);
    const clampedActual = Math.min(Math.max(0, actual), totalMax);
    if (clampedActual !== actual) {
      updateData.valueActual = clampedActual;
      (status as any).valueActual = clampedActual;
    }
  }

  await tx.status.update({
    where: { id: status.id },
    data: updateData
  });

  (status as any)[field] = nextValue;
  statusState.byNormalized.set(normalizeStatusName(status.name), status);
};

const applyAttributeDelta = async (
  tx: Prisma.TransactionClient,
  characterId: string,
  attribute: AttributeInfo,
  delta: number
): Promise<boolean> => {
  const rounded = Math.round(delta);
  if (rounded === 0) return false;

  await tx.characterAttribute.upsert({
    where: {
      characterId_attributeId: {
        characterId,
        attributeId: attribute.id
      }
    },
    update: {
      valueInv: { increment: rounded }
    },
    create: {
      characterId,
      attributeId: attribute.id,
      valueInv: rounded
    }
  });

  return true;
};

const recomputeDerivedStatuses = async (
  tx: Prisma.TransactionClient,
  characterId: string
): Promise<void> => {
  const character = await tx.character.findUnique({
    where: { id: characterId },
    include: { archetype: true }
  });
  if (!character) return;

  const attributes = await tx.characterAttribute.findMany({
    where: { characterId, deletedAt: null },
    include: {
      attribute: {
        select: { name: true }
      }
    }
  });

  const totals = new Map<string, number>();
  attributes.forEach((entry) => {
    const name = entry.attribute?.name;
    if (!name) return;
    const total = entry.valueBase + entry.valueInv + entry.valueExtra;
    totals.set(name, total);
  });

  const getAttr = (name: string) => totals.get(name) ?? 0;

  const normalizedAttributes = {
    strength: getAttr("Força"),
    dexterity: getAttr("Destreza"),
    intelligence: getAttr("Inteligência"),
    wisdom: getAttr("Sabedoria"),
    constitution: getAttr("Constituição"),
    destiny: getAttr("Destino")
  };

  const archetype = character.archetype;
  const statusResult = sharedCalculateStatus(normalizedAttributes, {
    hp: archetype ? toNumeric(archetype.hp) : 1,
    mp: archetype ? toNumeric(archetype.mp) : 1,
    tp: archetype ? toNumeric(archetype.tp) : 1
  });

  const statuses = await tx.status.findMany({
    where: { characterId, deletedAt: null }
  });
  const statusState = buildStatusState(statuses);

  const applyMaxUpdate = async (statusName: string, newMax: number) => {
    const status = statusState.byNormalized.get(
      normalizeStatusName(statusName)
    );
    if (!status) return;

    const prevMax = toNumeric(status.valueMax);
    const bonus = toNumeric(status.valueBonus);
    const prevActual = toNumeric(status.valueActual);
    const maxTotal = newMax + bonus;
    const wasCapped = prevActual >= prevMax;
    const nextActual = Math.max(
      0,
      wasCapped ? maxTotal : Math.min(prevActual, maxTotal)
    );

    const updateData: Record<string, number> = {};
    if (prevMax !== newMax) {
      updateData.valueMax = newMax;
      (status as any).valueMax = newMax;
    }
    if (nextActual !== prevActual) {
      updateData.valueActual = nextActual;
      (status as any).valueActual = nextActual;
    }

    if (Object.keys(updateData).length > 0) {
      await tx.status.update({
        where: { id: status.id },
        data: updateData
      });
    }
  };

  await Promise.all([
    applyMaxUpdate("HP", statusResult.hp),
    applyMaxUpdate("MP", statusResult.mp),
    applyMaxUpdate("TP", statusResult.tp),
    applyMaxUpdate("Movimento", statusResult.mov),
    applyMaxUpdate("Resistência Física", statusResult.rf),
    applyMaxUpdate("Resistência Mágica", statusResult.rm)
  ]);
};

const resolveModifierTarget = (
  modifier: Prisma.EffectModifierGetPayload<{
    select: {
      componentName: true;
      componentType: true;
      operationType: true;
    };
  }>,
  formulaTarget: string,
  statusState: StatusState,
  attributeState: AttributeState
):
  | { kind: "STATUS"; record: StatusRecord; field: StatusFieldKey }
  | { kind: "ATTRIBUTE"; attribute: AttributeInfo }
  | null => {
  if (modifier.operationType !== "ADD") {
    return null;
  }

  if (modifier.componentType === "STATUS") {
    if (isDynamicPlaceholder(modifier.componentName)) {
      const parsed = parseStatusTargetToken(formulaTarget);
      if (!parsed) return null;
      const status = statusState.byNormalized.get(parsed.normalizedKey) ?? null;
      if (!status) return null;
      return { kind: "STATUS", record: status, field: parsed.field };
    }

    const componentName = (modifier.componentName ?? "").trim();
    if (!componentName) return null;
    const status =
      statusState.byNormalized.get(normalizeStatusName(componentName)) ?? null;
    if (!status) return null;
    return { kind: "STATUS", record: status, field: "valueActual" };
  }

  if (modifier.componentType === "ATTRIBUTE") {
    if (isDynamicPlaceholder(modifier.componentName)) {
      const attrSlug = parseAttributeTargetToken(formulaTarget);
      if (!attrSlug) return null;
      const attribute = attributeState.bySlug.get(attrSlug) ?? null;
      if (!attribute) return null;
      return { kind: "ATTRIBUTE", attribute };
    }

    const componentName = (modifier.componentName ?? "").trim().toLowerCase();
    if (!componentName) return null;
    const attribute = attributeState.byName.get(componentName) ?? null;
    if (!attribute) return null;
    return { kind: "ATTRIBUTE", attribute };
  }

  return null;
};

const applyEquipmentEffects = async (
  tx: Prisma.TransactionClient,
  params: { characterId: string; itemId: string; direction: 1 | -1 }
): Promise<void> => {
  const { characterId, itemId, direction } = params;

  const links = await tx.itemHasEffect.findMany({
    where: {
      itemId,
      deletedAt: null,
      effect: { is: { deletedAt: null } }
    },
    include: {
      effect: {
        include: {
          targets: {
            where: { deletedAt: null },
            select: {
              componentName: true,
              componentType: true,
              operationType: true
            }
          }
        }
      }
    }
  });

  if (links.length === 0) return;

  const statuses = await tx.status.findMany({
    where: { characterId, deletedAt: null },
    select: {
      id: true,
      name: true,
      valueActual: true,
      valueMax: true,
      valueBonus: true
    }
  });
  const statusState = buildStatusState(statuses);

  const attributesCatalog = await tx.attributes.findMany({
    select: { id: true, name: true }
  });
  const attributeState = buildAttributeState(
    attributesCatalog.map((item) => ({
      id: item.id,
      name: item.name,
      slug: slugify(item.name)
    }))
  );

  let attributeChanged = false;

  for (const link of links) {
    if (!link.effect) continue;

    const { expr, target } = parseEffectLinkFormula(link.formula);
    const baseValue = evaluateNumericExpression(expr);
    if (baseValue === 0) continue;

    for (const modifier of link.effect.targets) {
      const resolution = resolveModifierTarget(
        modifier,
        target,
        statusState,
        attributeState
      );
      if (!resolution) continue;

      const delta = baseValue * direction;

      if (resolution.kind === "STATUS") {
        await applyStatusDelta(
          tx,
          statusState,
          resolution.record,
          resolution.field,
          delta
        );
      } else {
        const changed = await applyAttributeDelta(
          tx,
          characterId,
          resolution.attribute,
          delta
        );
        attributeChanged = attributeChanged || changed;
      }
    }
  }

  if (attributeChanged) {
    await recomputeDerivedStatuses(tx, characterId);
  }
};

export const createCharacterHasItem = async (
  data: CreateCharacterHasItemDTO
): Promise<CharacterHasItemDTO> => {
  const equippedSlot = data.equipped_slot ?? EquipSlot.NONE;
  const quantityDelta = data.quantity ?? 1;

  return prisma.$transaction(async (tx) => {
    const existing = await tx.characterHasItem.findUnique({
      where: {
        characterId_itemId_equipped_slot: {
          characterId: data.characterId,
          itemId: data.itemId,
          equipped_slot: equippedSlot
        }
      }
    });
    const revivingDeleted = Boolean(existing?.deletedAt);

    const result = await tx.characterHasItem.upsert({
      where: {
        characterId_itemId_equipped_slot: {
          characterId: data.characterId,
          itemId: data.itemId,
          equipped_slot: equippedSlot
        }
      },
      update: {
        ...(revivingDeleted
          ? { quantity: quantityDelta }
          : { quantity: { increment: quantityDelta } }),
        deletedAt: null,
        ...(data.value !== undefined ? { value: data.value } : {}),
        ...(data.is_equipped !== undefined
          ? { is_equipped: data.is_equipped }
          : {})
      },
      create: {
        characterId: data.characterId,
        itemId: data.itemId,
        quantity: quantityDelta,
        value: data.value ?? null,
        is_equipped: data.is_equipped ?? false,
        equipped_slot: equippedSlot
      }
    });

    if ((!existing || revivingDeleted) && result.is_equipped) {
      await applyEquipmentEffects(tx, {
        characterId: result.characterId,
        itemId: result.itemId,
        direction: 1
      });
    } else if (existing && existing.is_equipped !== result.is_equipped) {
      await applyEquipmentEffects(tx, {
        characterId: result.characterId,
        itemId: result.itemId,
        direction: result.is_equipped ? 1 : -1
      });
    }

    return result;
  });
};

export const getCharacterHasItemsByCharacterId = async (
  characterId: string
): Promise<CharacterHasItemDTO[]> => {
  return prisma.characterHasItem.findMany({
    where: { characterId, deletedAt: null }
  });
};

export const getCharacterHasItemById = async (
  id: string
): Promise<CharacterHasItemDTO | null> => {
  return prisma.characterHasItem.findFirst({
    where: { id, deletedAt: null }
  });
};

export const getCharacterHasItems = async (): Promise<
  CharacterHasItemDTO[]
> => {
  return prisma.characterHasItem.findMany({
    where: { deletedAt: null }
  });
};

export const updateCharacterHasItem = async (
  id: string,
  data: UpdateCharacterHasItemDTO
): Promise<CharacterHasItemDTO> => {
  const current = await prisma.characterHasItem.findUnique({ where: { id } });
  if (!current) {
    throw new Error("Character inventory entry not found.");
  }

  const nextSlot = data.equipped_slot ?? current.equipped_slot;
  const nextEquipped = data.is_equipped ?? current.is_equipped;
  const equipping = !current.is_equipped && nextEquipped;
  const unequipping = current.is_equipped && !nextEquipped;

  return prisma.$transaction(async (tx) => {
    const duplicate = await tx.characterHasItem.findUnique({
      where: {
        characterId_itemId_equipped_slot: {
          characterId: current.characterId,
          itemId: current.itemId,
          equipped_slot: nextSlot
        }
      }
    });

    if (duplicate && duplicate.id !== id) {
      if (!nextEquipped || nextSlot === EquipSlot.NONE) {
        const merged = await tx.characterHasItem.update({
          where: { id: duplicate.id },
          data: {
            quantity: duplicate.quantity + current.quantity,
            is_equipped: false,
            equipped_slot: EquipSlot.NONE,
            ...(data.value !== undefined ? { value: data.value } : {})
          }
        });

        if (unequipping) {
          await applyEquipmentEffects(tx, {
            characterId: current.characterId,
            itemId: current.itemId,
            direction: -1
          });
        }

        await tx.characterHasItem.delete({ where: { id } });
        return merged;
      }

      throw new Error("Slot já ocupado para este item.");
    }

    const updated = await tx.characterHasItem.update({
      where: { id },
      data: {
        ...data,
        is_equipped: nextEquipped,
        equipped_slot: nextSlot
      }
    });

    if (equipping) {
      await applyEquipmentEffects(tx, {
        characterId: updated.characterId,
        itemId: updated.itemId,
        direction: 1
      });
    } else if (unequipping) {
      await applyEquipmentEffects(tx, {
        characterId: updated.characterId,
        itemId: updated.itemId,
        direction: -1
      });
    }

    return updated;
  });
};

export const deleteCharacterHasItem = async (
  id: string
): Promise<CharacterHasItemDTO> => {
  return prisma.$transaction(async (tx) => {
    const current = await tx.characterHasItem.findUnique({ where: { id } });
    if (!current) {
      throw new Error("Character inventory entry not found.");
    }

    if (current.is_equipped) {
      await applyEquipmentEffects(tx, {
        characterId: current.characterId,
        itemId: current.itemId,
        direction: -1
      });
    }

    return tx.characterHasItem.update({
      where: { id },
      data: { deletedAt: new Date() }
    });
  });
};
