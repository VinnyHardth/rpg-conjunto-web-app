import { useCampaignHub } from "../contexts/CampaignHubContext";
import { STATUS_ACTION_OPTIONS, type StatusAction } from "../statusActions";
import { RestType } from "../hooks/useRestActions";

export interface StatusValuePanelProps {
  onClose: () => void;
  activeRollsContent: React.ReactNode;
}

const StatusValuePanel = ({
  onClose,
  activeRollsContent,
}: StatusValuePanelProps) => {
  const {
    isMaster,
    effectsLoading,
    effectsError,
    useCharacterManagement: { orderedCharacters: characters },
    useDamagePanel: {
      selectedTargetId,
      setSelectedTargetId,
      selectedAction,
      setSelectedAction,
      formula,
      setFormula,
      roll,
      isRolling,
      isApplying,
      error,
      message,
      effectAvailable,
      handleRoll,
      handleReset,
      handleApply,
      clearState: clearRollState,
    },
    useRestActions: { isResting, restError, restMessage, handleRest },
    useHubInterface: { isDamageOpen, damagePanelRef: panelRef },
  } = useCampaignHub();

  if (!isDamageOpen) return null;

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
                    onChange={(e) => {
                      setSelectedTargetId(e.target.value || null);
                      clearRollState();
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    {characters.length === 0 && (
                      <option value="">Nenhum personagem disponível</option>
                    )}
                    {characters.length > 0 && (
                      <>
                        <option value="ALL_CHARACTERS">Todos</option>
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
                    onChange={(e) => {
                      setSelectedAction(e.target.value as StatusAction);
                      clearRollState();
                    }}
                    className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                  >
                    {STATUS_ACTION_OPTIONS.map((option) => (
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
                  value={formula}
                  onChange={(e) => {
                    setFormula(e.target.value);
                  }}
                  placeholder="Ex: 2d6+3"
                  className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-400"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleRoll}
                  disabled={isRolling}
                  className="inline-flex items-center justify-center rounded-lg border border-white/10 bg-rose-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-white shadow transition hover:bg-rose-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/10 disabled:text-slate-400"
                >
                  {isRolling ? "Rolando..." : "Rolar fórmula"}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!roll && !message && !error && formula.length === 0}
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
                  Nenhum efeito cadastrado para esse tipo de alteração. Atualize
                  os dados do servidor antes de aplicar.
                </p>
              )}

              {roll && (
                <div className="rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">
                  <p className="font-semibold text-white">
                    Resultado bruto: {roll.total}
                  </p>
                  <p>Valor aplicado: {Math.abs(Math.round(roll.total))}</p>
                  <p className="text-white/70">
                    Expressão: {roll.renderedExpression}
                  </p>
                  <p>
                    Rolagens:{" "}
                    {roll.rolls.length > 0 ? roll.rolls.join(", ") : "—"}
                  </p>
                </div>
              )}

              {error && <p className="text-xs text-red-300">{error}</p>}

              {message && <p className="text-xs text-emerald-300">{message}</p>}
            </div>

            <div className="mt-auto space-y-3">
              <button
                type="button"
                onClick={handleApply}
                disabled={
                  isApplying || !roll || !selectedTargetId || !effectAvailable
                }
                className="inline-flex w-full items-center justify-center rounded-lg border border-white/10 bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow transition hover:bg-emerald-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/10 disabled:text-slate-400"
              >
                {isApplying ? "Aplicando..." : "Aplicar alteração"}
              </button>

              <div className="border-t border-white/10 pt-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
                  Rolagens ativas
                </h3>
                {activeRollsContent}
              </div>
            </div>

            {isMaster && (
              <div className="mt-auto space-y-3 border-t border-white/10 pt-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-white/70">
                  Ações do Mestre
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleRest(RestType.SHORT)}
                    disabled={isResting}
                    className="inline-flex items-center justify-center rounded-lg border border-sky-300/20 bg-sky-800/50 px-3 py-2 text-xs font-semibold text-sky-200 shadow transition hover:bg-sky-700/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-400 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/10 disabled:text-slate-400"
                  >
                    {isResting ? "Aguarde..." : "Descanso Curto"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRest(RestType.LONG)}
                    disabled={isResting}
                    className="inline-flex items-center justify-center rounded-lg border border-emerald-300/20 bg-emerald-800/50 px-3 py-2 text-xs font-semibold text-emerald-200 shadow transition hover:bg-emerald-700/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/10 disabled:text-slate-400"
                  >
                    {isResting ? "Aguarde..." : "Descanso Longo"}
                  </button>
                </div>
                {restError && (
                  <p className="text-center text-xs text-red-300">
                    {restError}
                  </p>
                )}
                {restMessage && (
                  <p className="text-center text-xs text-emerald-300">
                    {restMessage}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default StatusValuePanel;
