"use client";

import { useMemo } from "react";
import useSWR from "swr";

import { fetchAttributesCatalog, fetchStatusCatalog } from "@/lib/api";
import type { Status } from "@/types/models";
import type { AttributesDTO } from "@rpg/shared";

export type FormulaTokenCategory = "attribute" | "status" | "misc";

export type FormulaToken = {
  token: string;
  label: string;
  category: FormulaTokenCategory;
  description?: string;
  meta?: {
    displayName?: string;
    kind?: string;
  };
};

const FALLBACK_ATTRIBUTE_TOKENS: FormulaToken[] = [
  {
    token: "attr.strength",
    label: "Força (attr.strength)",
    category: "attribute",
    meta: { displayName: "Força", kind: "ATTRIBUTE" },
  },
  {
    token: "attr.dexterity",
    label: "Destreza (attr.dexterity)",
    category: "attribute",
    meta: { displayName: "Destreza", kind: "ATTRIBUTE" },
  },
  {
    token: "attr.intelligence",
    label: "Inteligência (attr.intelligence)",
    category: "attribute",
    meta: { displayName: "Inteligência", kind: "ATTRIBUTE" },
  },
  {
    token: "attr.constitution",
    label: "Constituição (attr.constitution)",
    category: "attribute",
    meta: { displayName: "Constituição", kind: "ATTRIBUTE" },
  },
  {
    token: "attr.wisdom",
    label: "Sabedoria (attr.wisdom)",
    category: "attribute",
    meta: { displayName: "Sabedoria", kind: "ATTRIBUTE" },
  },
  {
    token: "attr.charisma",
    label: "Carisma (attr.charisma)",
    category: "attribute",
    meta: { displayName: "Carisma", kind: "ATTRIBUTE" },
  },
  {
    token: "attr.destiny",
    label: "Destino (attr.destiny)",
    category: "attribute",
    meta: { displayName: "Destino", kind: "ATTRIBUTE" },
  },
];

const FALLBACK_STATUS_TOKENS: FormulaToken[] = [
  {
    token: "status.hp.current",
    label: "HP atual (status.hp.current)",
    category: "status",
    description: "Valor de HP em tempo real.",
    meta: { displayName: "HP", kind: "STATUS" },
  },
  {
    token: "status.hp.max",
    label: "HP máximo (status.hp.max)",
    category: "status",
    meta: { displayName: "HP", kind: "STATUS" },
  },
  {
    token: "status.hp.bonus",
    label: "HP bônus (status.hp.bonus)",
    category: "status",
    meta: { displayName: "HP", kind: "STATUS" },
  },
  {
    token: "status.mp.current",
    label: "MP atual (status.mp.current)",
    category: "status",
    meta: { displayName: "MP", kind: "STATUS" },
  },
  {
    token: "status.mp.max",
    label: "MP máximo (status.mp.max)",
    category: "status",
    meta: { displayName: "MP", kind: "STATUS" },
  },
  {
    token: "status.tp.current",
    label: "TP atual (status.tp.current)",
    category: "status",
    meta: { displayName: "TP", kind: "STATUS" },
  },
  {
    token: "status.tp.max",
    label: "TP máximo (status.tp.max)",
    category: "status",
    meta: { displayName: "TP", kind: "STATUS" },
  },
];

const normalizeName = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toAttributeToken = (attribute: AttributesDTO): FormulaToken => {
  const slug = normalizeName(attribute.name);
  const baseLabel = attribute.name;
  return {
    token: `attr.${slug}`,
    label: `${baseLabel} (attr.${slug})`,
    category: "attribute",
    description:
      attribute.kind === "EXPERTISE"
        ? "Perícia derivada de atributos."
        : "Atributo base do personagem.",
    meta: {
      displayName: attribute.name,
      kind: attribute.kind,
    },
  };
};

const statusNameToTokens = (name: string): FormulaToken[] => {
  const slug = normalizeName(name || "status");
  const displayName = name || slug.toUpperCase();
  return [
    {
      token: `status.${slug}.current`,
      label: `${displayName} atual (status.${slug}.current)`,
      category: "status",
      description: "Valor atual considerando bônus.",
      meta: {
        displayName,
        kind: "STATUS",
      },
    },
    {
      token: `status.${slug}.max`,
      label: `${displayName} máximo (status.${slug}.max)`,
      category: "status",
      meta: {
        displayName,
        kind: "STATUS",
      },
    },
    {
      token: `status.${slug}.bonus`,
      label: `${displayName} bônus (status.${slug}.bonus)`,
      category: "status",
      description: "Bônus aplicado pelo equipamento ou efeitos.",
      meta: {
        displayName,
        kind: "STATUS",
      },
    },
  ];
};

const deduplicateTokens = (tokens: FormulaToken[]): FormulaToken[] => {
  const map = new Map<string, FormulaToken>();
  tokens.forEach((token) => {
    if (!map.has(token.token)) {
      map.set(token.token, token);
    }
  });
  return Array.from(map.values());
};

export function useFormulaCatalog() {
  const {
    data: attributes,
    error: attributesError,
    isLoading: loadingAttributes,
  } = useSWR("formula-attributes", fetchAttributesCatalog, {
    revalidateOnFocus: false,
  });

  const {
    data: statuses,
    error: statusesError,
    isLoading: loadingStatuses,
  } = useSWR("formula-status", fetchStatusCatalog, {
    revalidateOnFocus: false,
  });

  const attributeTokens = useMemo(() => {
    if (!attributes || attributes.length === 0) {
      return FALLBACK_ATTRIBUTE_TOKENS;
    }

    const filtered = attributes.filter(
      (attribute) => attribute.kind === "ATTRIBUTE",
    );
    if (filtered.length === 0) {
      return FALLBACK_ATTRIBUTE_TOKENS;
    }

    const tokens = filtered.map(toAttributeToken);
    return deduplicateTokens(tokens).sort((a, b) =>
      a.label.localeCompare(b.label, "pt-BR"),
    );
  }, [attributes]);

  const statusTokens = useMemo(() => {
    if (!statuses || statuses.length === 0) {
      return FALLBACK_STATUS_TOKENS;
    }

    const names = new Set<string>();
    (statuses as Status[]).forEach((status) => {
      if (status.name) {
        names.add(status.name);
      }
    });

    if (names.size === 0) {
      return FALLBACK_STATUS_TOKENS;
    }

    const tokens = Array.from(names)
      .sort((a, b) => a.localeCompare(b, "pt-BR"))
      .flatMap(statusNameToTokens);

    return deduplicateTokens(tokens);
  }, [statuses]);

  const tokens = useMemo(
    () => deduplicateTokens([...attributeTokens, ...statusTokens]),
    [attributeTokens, statusTokens],
  );

  const loading = loadingAttributes || loadingStatuses;

  const errorMessage = useMemo(() => {
    if (!attributesError && !statusesError) return null;
    const parts: string[] = [];
    if (attributesError) parts.push("atributos");
    if (statusesError) parts.push("status");
    return `Não foi possível carregar ${parts.join(" e ")}. Utilizando a lista padrão.`;
  }, [attributesError, statusesError]);

  return {
    tokens,
    attributeTokens,
    statusTokens,
    loading,
    error: errorMessage,
  } as const;
}
