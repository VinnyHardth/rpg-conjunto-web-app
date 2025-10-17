import AttributeTable from "./AttributeTable";
import { useAttributesPanel } from "../hooks/useAttributesPanel";
import { useCampaignHub } from "../contexts/CampaignHubContext";

type AttributesPanelProps = {
  onClose: () => void;
};

export default function AttributesPanel({ onClose }: AttributesPanelProps) {
  const {
    isMaster,
    user,
    sidebarCharacter,
    sidebarCharacterId,
    sidebarRoll,
    attributeDefinitions,
    expertiseDefinitions,
    useCampaignData: { campaign },
    useHubInterface: { isAttributesOpen, attributesPanelRef: panelRef },
    useDiceRolls: { socketHandlers },
  } = useCampaignHub();

  const {
    isLoading: attributePanelLoading,
    error: sidebarAttributesError,
    attributeTables,
    selectedAttributeRow,
    setSelectedAttributeRow,
    selectedExpertiseRow,
    setSelectedExpertiseRow,
    selectedRollRow,
    isRolling,
    rollError,
    handleRoll,
    selectedDifficulty,
    setSelectedDifficulty,
    DIFFICULTY_OPTIONS,
  } = useAttributesPanel({
    isOpen: isAttributesOpen,
    sidebarCharacterId,
    campaignId: campaign?.id ?? null,
    attributeDefinitions,
    expertiseDefinitions,
    onRoll: socketHandlers.onDiceRolled,
  });

  if (!isAttributesOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose}></div>
      <aside
        ref={panelRef}
        className="fixed left-0 top-0 z-50 flex h-full w-[360px] flex-col bg-slate-900/95 text-slate-100 shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <span className="text-sm font-semibold uppercase tracking-wide text-slate-200">
            Atributos
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
          {!sidebarCharacterId ? (
            <p className="text-sm text-slate-300">
              {isMaster
                ? "Selecione um personagem no quadro para visualizar os atributos."
                : "Nenhum personagem associado foi encontrado para esta campanha."}
            </p>
          ) : attributePanelLoading ? (
            <div className="flex items-center justify-center py-10 text-sm text-slate-300">
              Carregando atributos...
            </div>
          ) : sidebarAttributesError ? (
            <p className="text-sm text-red-300">
              Não foi possível carregar os atributos.
            </p>
          ) : attributeTables ? (
            <>
              <h3 className="mb-4 text-lg font-semibold text-white">
                {sidebarCharacter?.name}
                {sidebarCharacter?.userId === user?.id ? " •" : ""}
              </h3>

              <AttributeTable
                title="Atributos"
                firstColumnLabel="Atributo"
                rows={attributeTables.attributes}
                headerClass="bg-red-600"
                selectedRowName={selectedAttributeRow}
                onSelectRow={(rowName) => {
                  setSelectedExpertiseRow(null);
                  setSelectedAttributeRow((prev) =>
                    prev === rowName ? null : rowName,
                  );
                }}
              />

              <AttributeTable
                title="Perícias"
                firstColumnLabel="Perícia"
                rows={attributeTables.expertises}
                headerClass="bg-sky-600"
                selectedRowName={selectedExpertiseRow}
                onSelectRow={(rowName) => {
                  setSelectedAttributeRow(null);
                  setSelectedExpertiseRow((prev) =>
                    prev === rowName ? null : rowName,
                  );
                }}
              />

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  disabled={!selectedRollRow || isRolling}
                  onClick={handleRoll}
                  className="inline-flex w-full items-center justify-center rounded-lg border border-white/10 bg-blue-600/80 px-3 py-1.5 text-sm font-semibold text-white shadow transition hover:bg-blue-500/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300 disabled:cursor-not-allowed disabled:border-white/5 disabled:bg-white/10 disabled:text-slate-400 sm:w-auto sm:px-4"
                >
                  {isRolling
                    ? "Rolando..."
                    : selectedRollRow
                      ? `Rolar ${selectedRollRow.name}`
                      : "Rolar Atributo"}
                </button>

                <div className="relative w-full sm:w-40">
                  <select
                    value={selectedDifficulty}
                    onChange={(event) =>
                      setSelectedDifficulty(
                        event.target
                          .value as (typeof DIFFICULTY_OPTIONS)[number],
                      )
                    }
                    className="block w-full appearance-none rounded-lg border border-white/10 bg-slate-900/60 px-4 py-2 text-sm font-medium text-white shadow focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    {DIFFICULTY_OPTIONS.map((label) => (
                      <option key={label} value={label}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-white/70">
                    <svg
                      className="h-4 w-4"
                      viewBox="0 0 20 20"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M6 8l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>

              {rollError && (
                <p className="mt-2 text-sm text-red-300">{rollError}</p>
              )}

              {sidebarRoll && (
                <div className="mt-3 space-y-1 rounded-lg border border-white/10 bg-slate-900/60 p-3 text-xs text-slate-200">
                  <p className="font-semibold text-white">
                    {sidebarRoll.attributeAbbreviation} • Sucessos{" "}
                    {sidebarRoll.successes}/{sidebarRoll.diceCount}
                  </p>
                  <p className="uppercase tracking-wide text-white/70">
                    {sidebarRoll.attributeName}
                  </p>
                  <p>
                    Rolagens:{" "}
                    {sidebarRoll.rolls.length > 0
                      ? sidebarRoll.rolls.join(", ")
                      : "—"}
                  </p>
                  <p>
                    Dificuldade {sidebarRoll.difficulty} • Limiar ≥{" "}
                    {sidebarRoll.threshold}
                  </p>
                </div>
              )}
            </>
          ) : (
            <p className="text-sm text-slate-300">
              Nenhum dado de atributos disponível.
            </p>
          )}
        </div>
      </aside>
    </>
  );
}
