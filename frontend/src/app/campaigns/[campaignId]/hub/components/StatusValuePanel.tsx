import { type RefObject } from "react";
import type { Character } from "@/types/models";
import type { RollCustomResponse } from "@/lib/api";
import type { StatusAction, StatusActionOption } from "../statusActions";

export interface StatusValuePanelProps {
  isOpen: boolean;
  onClose: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
  isMaster: boolean;
  characters: Character[];
  selectedTargetId: string | null;
  onSelectTarget: (id: string | null) => void;
  selectedAction: StatusAction;
  onSelectAction: (action: StatusAction) => void;
  actionOptions: StatusActionOption[];
  damageFormula: string;
  onChangeFormula: (value: string) => void;
  onRoll: () => void;
  onReset: () => void;
  onApply: () => void;
  onShortRest: () => void;
  onLongRest: () => void;
  isResting: boolean;
  isRolling: boolean;
  isApplying: boolean;
  damageRoll: RollCustomResponse | null;
  damageError: string | null;
  damageMessage: string | null;
  effectsLoading: boolean;
  effectsError: string | null;
  effectAvailable: boolean;
  activeRollsContent: React.ReactNode;
}

const StatusValuePanel = ({
  isOpen,
  onClose,
  panelRef,
  isMaster,
  characters,
  selectedTargetId,
  onSelectTarget,
  selectedAction,
  onSelectAction,
  actionOptions,
  damageFormula,
  onChangeFormula,
  onRoll,
  onReset,
  onApply,
  onShortRest,
  onLongRest,
  isResting,
  isRolling,
  isApplying,
  damageRoll,
  damageError,
  damageMessage,
  effectsLoading,
  effectsError,
  effectAvailable,
  activeRollsContent,
}: StatusValuePanelProps) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onClose}
        role="presentation"
      ></div>
      <aside
        ref={panelRef}
        className="fixed right-0 top-0 z-50 flex h-full w-[360px] flex-col bg-slate-900/95 text-slate-100 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Valor de Status
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800 px-2 py-1 text-xs font-medium text-slate-200 transition hover:bg-slate-700"
          >
            Fechar
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4 text-sm text-slate-200">
          <div className="flex h-full flex-col gap-4">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-white/70">
                    Alvo
                  </label>
                  <select
                    value={selectedTargetId ?? ""}
                    onChange={(event) => {
                      const value = event.target.value || null;
                      onSelectTarget(value);
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    {characters.length === 0 && (
                      <option value="">Nenhum personagem disponível</option>
                    )}
                    {characters.length > 0 && (
                      <>
                        <option value="">Selecione um personagem</option>
                        {characters.map((character) => (
                          <option key={character.id} value={character.id}>
                            {character.name}
                          </option>
                        ))}
                      </>
                    )}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold uppercase tracking-widest text-white/70">
                    Tipo de alteração
                  </label>
                  <select
                    value={selectedAction}
                    onChange={(event) =>
                      onSelectAction(event.target.value as StatusAction)
                    }
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    {actionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold uppercase tracking-widest text-white/70">
                  Fórmula da alteração
                </label>
                <input
                  type="text"
                  value={damageFormula}
                  onChange={(event) => onChangeFormula(event.target.value)}
                  placeholder="Ex: 2d6+3"
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onRoll}
                  disabled={isRolling}
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-rose-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white shadow transition hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/10 disabled:text-slate-400"
                >
                  {isRolling ? "Rolando..." : "Rolar fórmula"}
                </button>
                <button
                  type="button"
                  onClick={onReset}
                  disabled={
                    !damageRoll &&
                    !damageMessage &&
                    !damageError &&
                    damageFormula.length === 0
                  }
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-slate-800 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white shadow transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/10 disabled:text-slate-400"
                >
                  Limpar campos
                </button>
              </div>

              {effectsLoading && (
                <p className="text-xs text-slate-400">
                  Carregando efeitos de status...
                </p>
              )}

              {effectsError && (
                <p className="text-xs text-red-300">
                  Não foi possível carregar as configurações de status.
                </p>
              )}

              {!effectsLoading && !effectsError && !effectAvailable && (
                <p className="text-xs text-amber-300">
                  Nenhum efeito cadastrado para esse tipo de alteração.
                  Atualize os dados do servidor antes de aplicar.
                </p>
              )}

              {damageRoll && (
                <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">
                  <p className="font-semibold text-white">
                    Resultado bruto: {damageRoll.total}
                  </p>
                  <p>
                    Valor aplicado: {Math.abs(Math.round(damageRoll.total))}
                  </p>
                  <p className="text-white/70">
                    Expressão: {damageRoll.renderedExpression}
                  </p>
                  <p>
                    Rolagens:{" "}
                    {damageRoll.rolls.length > 0
                      ? damageRoll.rolls.join(", ")
                      : "—"}
                  </p>
                </div>
              )}

              {damageError && (
                <p className="text-xs text-red-300">{damageError}</p>
              )}

              {damageMessage && (
                <p className="text-xs text-emerald-300">{damageMessage}</p>
              )}
            </div>

            <div className="mt-auto space-y-3">
              <button
                type="button"
                onClick={onApply}
                disabled={
                  isApplying ||
                  !damageRoll ||
                  !selectedTargetId ||
                  !effectAvailable
                }
                className="inline-flex w-full items-center justify-center rounded-lg border border-white/10 bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/10 disabled:text-slate-400"
              >
                {isApplying ? "Aplicando..." : "Aplicar alteração"}
              </button>
        
               {isMaster && (
                <div className="border-t border-white/10 pt-4">
                  <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/70">
                    Ações da Campanha
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={onShortRest}
                      disabled={isResting || isApplying}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-sky-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/10 disabled:text-slate-400"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 3.5a1.5 1.5 0 011.5 1.5v2.125a1.5 1.5 0 001.06 1.415l.375.125a1.5 1.5 0 011.065 1.415V12.5a1.5 1.5 0 01-1.5 1.5h-1.375a1.5 1.5 0 00-1.415 1.06l-.125.375a1.5 1.5 0 01-1.415 1.065h-2.125a1.5 1.5 0 01-1.415-1.065l-.125-.375a1.5 1.5 0 00-1.415-1.06H3.5a1.5 1.5 0 01-1.5-1.5v-2.125a1.5 1.5 0 011.065-1.415l.375-.125a1.5 1.5 0 001.06-1.415V5A1.5 1.5 0 0110 3.5z" />
                      </svg>
                      <span>Curto</span>
                    </button>
                    <button
                      type="button"
                      onClick={onLongRest}
                      disabled={isResting || isApplying}
                      className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/10 disabled:text-slate-400"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 2a.75.75 0 01.75.75v.518a2.5 2.5 0 014.232 1.25l.013.121a.75.75 0 01-1.48.19-1 1 0 00-1.723-.5L10.9 5.54a.75.75 0 01-1.06 1.06l-1.72-1.72a.75.75 0 010-1.061l1.72-1.72a.75.75 0 011.06 0l.568.568A1 1 0 0012.5 2.309V2.75A.75.75 0 0110 2zM3.636 4.879a.75.75 0 011.06 0l1.72 1.72a.75.75 0 11-1.06 1.06L3.636 5.94a.75.75 0 010-1.06zm11.662 1.06a.75.75 0 010 1.06l-1.72 1.72a.75.75 0 11-1.06-1.06l1.72-1.72a.75.75 0 011.06 0zM10 17a.75.75 0 01-.75-.75v-5.5a.75.75 0 011.5 0v5.5A.75.75 0 0110 17zM6.02 6.47a.75.75 0 011.06 0l.22.22a.75.75 0 01-1.06 1.06l-.22-.22a.75.75 0 010-1.06zm8.18 1.282a.75.75 0 010-1.06l-.22-.22a.75.75 0 01-1.06 1.06l.22.22a.75.75 0 011.06 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>Longo</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="border-t border-white/10 pt-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
                  Rolagens ativas
                </h3>
                {activeRollsContent}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default StatusValuePanel;
