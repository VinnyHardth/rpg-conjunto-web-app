"use client";

import { useId, useMemo, useRef, useState } from "react";

import type { FormulaToken } from "@/hooks/useFormulaCatalog";

type FormulaInputProps = {
  value: string;
  onChange: (value: string) => void;
  tokens: FormulaToken[];
  disabled?: boolean;
  placeholder?: string;
  inputClassName?: string;
  containerClassName?: string;
  loading?: boolean;
  error?: string | null;
  helperLabel?: string;
  helperTitle?: string;
  helperDescription?: string;
};

const CATEGORY_TITLES: Record<string, string> = {
  attribute: "Atributos",
  status: "Status",
  misc: "Outros",
};

export function FormulaInput({
  value,
  onChange,
  tokens,
  disabled,
  placeholder,
  inputClassName,
  containerClassName,
  loading,
  error,
  helperLabel = "Variáveis",
  helperTitle = "Variáveis disponíveis",
  helperDescription,
}: FormulaInputProps) {
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const groupedTokens = useMemo(() => {
    return tokens.reduce<Record<string, FormulaToken[]>>((acc, token) => {
      const key = token.category ?? "misc";
      if (!acc[key]) acc[key] = [];
      acc[key].push(token);
      return acc;
    }, {});
  }, [tokens]);

  const handleInsert = (token: string) => {
    if (disabled) return;
    const input = inputRef.current;
    const current = value ?? "";
    if (!input) {
      onChange(`${current}${token}`);
      return;
    }

    const { selectionStart, selectionEnd } = input;
    const start = selectionStart ?? current.length;
    const end = selectionEnd ?? current.length;

    const nextValue = `${current.slice(0, start)}${token}${current.slice(end)}`;
    onChange(nextValue);

    window.requestAnimationFrame(() => {
      const caret = start + token.length;
      input.focus();
      input.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className={containerClassName ?? "space-y-1"}>
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          list={`${inputId}-datalist`}
          className={
            inputClassName ??
            "w-full rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-indigo-500 focus:outline-none"
          }
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
        />
        <button
          type="button"
          className="rounded-md border border-gray-300 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          onClick={() => setOpen((prev) => !prev)}
          disabled={disabled || (!loading && tokens.length === 0)}
        >
          {helperLabel}
        </button>
      </div>

      <datalist id={`${inputId}-datalist`}>
        {tokens.map((token) => (
          <option key={token.token} value={token.token} />
        ))}
      </datalist>

      {open && (
        <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-3 text-xs text-gray-700">
          <div className="mb-2 flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-800">{helperTitle}</p>
              <p className="text-[11px] text-gray-600">
                {loading
                  ? "Carregando variáveis cadastradas..."
                  : (helperDescription ??
                    "Clique em uma variável para inserir no campo ou use o autocomplete do input.")}
              </p>
              <p className="mt-1 text-[11px] text-gray-500">
                Exemplo: <code>0.2 * status.hp.max</code>
              </p>
              {error && (
                <p className="mt-1 text-[11px] text-red-600">{error}</p>
              )}
            </div>
            <button
              type="button"
              className="rounded-md border border-gray-300 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-gray-700 transition hover:bg-gray-100"
              onClick={() => setOpen(false)}
            >
              Fechar
            </button>
          </div>

          {!loading && tokens.length === 0 && !error ? (
            <p className="text-[11px] text-gray-500">
              Nenhuma variável cadastrada até o momento.
            </p>
          ) : (
            Object.keys(groupedTokens)
              .sort((a, b) => a.localeCompare(b))
              .map((category) => {
                const items = groupedTokens[category];
                if (!items || items.length === 0) return null;
                return (
                  <div key={category} className="mb-3 last:mb-0">
                    <p className="mb-1 font-semibold uppercase tracking-wide text-[11px] text-gray-500">
                      {CATEGORY_TITLES[category] ?? category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {items.map((token) => (
                        <button
                          type="button"
                          key={token.token}
                          className="rounded-md border border-indigo-200 bg-white px-2 py-1 text-[11px] font-medium text-indigo-700 transition hover:bg-indigo-50"
                          onClick={() => handleInsert(token.token)}
                        >
                          {token.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}
