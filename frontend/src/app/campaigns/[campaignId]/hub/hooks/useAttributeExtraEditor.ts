import { useCallback, useMemo, useState } from "react";
import { useSWRConfig } from "swr";

import {
  updateCharacterAttribute,
  type UpdateCharacterAttributePayload,
} from "@/lib/api";

type EditorOptions = {
  sidebarCharacterId?: string | null;
  swrKey?: string | null;
};

type EditingState = {
  id: string;
  name: string;
};

const DEFAULT_ERROR_MESSAGE = "Não foi possível atualizar o valor extra.";

export function useAttributeExtraEditor(options: EditorOptions = {}) {
  const { mutate } = useSWRConfig();
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [draftValue, setDraftValue] = useState<number>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolvedSwrKey = useMemo(() => {
    if (typeof options.swrKey === "string") return options.swrKey;
    if (options.sidebarCharacterId) {
      return `character-${options.sidebarCharacterId}-attributes`;
    }
    return null;
  }, [options.sidebarCharacterId, options.swrKey]);

  const startEditing = useCallback(
    (payload: { id?: string | null; name: string; currentValue: number }) => {
      if (!payload.id) {
        setError("Este atributo não pode ser editado no momento.");
        return;
      }
      setEditing({ id: payload.id, name: payload.name });
      setDraftValue(payload.currentValue);
      setError(null);
    },
    [],
  );

  const cancelEditing = useCallback(() => {
    setEditing(null);
    setDraftValue(0);
    setError(null);
  }, []);

  const submit = useCallback(
    async (nextValue?: number) => {
      if (!editing) return;

      const valueToSave =
        typeof nextValue === "number" && Number.isFinite(nextValue)
          ? nextValue
          : draftValue;

      const payload: UpdateCharacterAttributePayload = {
        valueExtra: Math.round(valueToSave),
      };

      setIsSaving(true);
      setError(null);

      try {
        await updateCharacterAttribute(editing.id, payload);
        if (resolvedSwrKey) {
          await mutate(resolvedSwrKey);
        }
        cancelEditing();
      } catch (err) {
        console.error("Falha ao atualizar atributo extra:", err);
        setError(DEFAULT_ERROR_MESSAGE);
      } finally {
        setIsSaving(false);
      }
    },
    [editing, draftValue, resolvedSwrKey, mutate, cancelEditing],
  );

  return {
    editing,
    draftValue,
    setDraftValue,
    isSaving,
    error,
    startEditing,
    cancelEditing,
    submit,
  };
}

export type UseAttributeExtraEditorReturn = ReturnType<
  typeof useAttributeExtraEditor
>;
