import CampaignHubHeader from "./CampaignHubHeader";
import AttributesPanel from "./AttributesPanel";
import StatusValuePanel from "./StatusValuePanel";
import CharacterSelection from "./CharacterSelection";
import CharacterBoard from "./CharacterBoard";
import type { CampaignHubLayoutProps } from "../hooks/useCampaignHubPage";

export default function CampaignHubLayout({
  campaign,
  isMaster,
  showPlayerSelectButton,
  disableSelection,
  openSelection,
  hasError,
  error,
  isSelecting,
  isAttributesOpen,
  isDamageOpen,
  handleToggleAttributes,
  handleToggleDamage,
  onAttributesPanelClose,
  onDamagePanelClose,
  activeRollsContent,
  availableCharacters,
  user,
  isSaving,
  handleCharacterSelect,
  closeSelection,
  characterManagementError,
  actionError,
  attributesButtonRef,
  damageButtonRef,
  difficultyTarget,
  difficultyInputValue,
  onDifficultyInputChange,
  onDifficultyClear,
}: CampaignHubLayoutProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <button
            ref={attributesButtonRef}
            type="button"
            onClick={handleToggleAttributes}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-300"
            aria-haspopup="dialog"
            aria-expanded={isAttributesOpen}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="4"
                width="18"
                height="16"
                rx="3"
                stroke="currentColor"
                strokeWidth="2"
              />
              <line
                x1="11"
                y1="5"
                x2="11"
                y2="19"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Atributos
          </button>

          <button
            ref={damageButtonRef}
            type="button"
            onClick={handleToggleDamage}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-800/90 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-rose-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
            aria-haspopup="dialog"
            aria-expanded={isDamageOpen}
          >
            <svg
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 19 12 5l7 14M6 16h12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Valor de Status
          </button>

          {isMaster ? (
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-sm text-white shadow-sm">
              <label
                htmlFor="hub-difficulty-input"
                className="text-xs font-semibold uppercase tracking-widest text-white/60"
              >
                Dificuldade
              </label>
              <input
                id="hub-difficulty-input"
                type="number"
                inputMode="numeric"
                value={difficultyInputValue}
                onChange={onDifficultyInputChange}
                className="w-20 rounded bg-slate-800 px-2 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-rose-300"
                placeholder="--"
              />
              {difficultyTarget !== null && (
                <button
                  type="button"
                  onClick={onDifficultyClear}
                  className="rounded bg-transparent p-1 text-white/70 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-300"
                  aria-label="Limpar dificuldade"
                >
                  ×
                </button>
              )}
            </div>
          ) : difficultyTarget !== null ? (
            <div className="rounded-lg border border-white/10 bg-slate-900/60 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white/80">
              Dificuldade {difficultyTarget}
            </div>
          ) : null}
        </div>

        <CampaignHubHeader
          campaign={campaign}
          isMaster={isMaster}
          isSelecting={isSelecting}
          showPlayerSelectButton={showPlayerSelectButton}
          disableSelection={disableSelection}
          openSelection={openSelection}
        />

        {hasError && (
          <div className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <AttributesPanel onClose={onAttributesPanelClose} />

        <StatusValuePanel
          onClose={onDamagePanelClose}
          activeRollsContent={activeRollsContent}
        />

        {isSelecting ? (
          <CharacterSelection
            availableCharacters={availableCharacters}
            user={user}
            isSaving={isSaving}
            handleAttachCharacter={handleCharacterSelect}
            closeSelection={closeSelection}
            actionError={characterManagementError}
            isAttributesOpen={isAttributesOpen}
          />
        ) : (
          <CharacterBoard />
        )}

        {actionError && !isSelecting && (
          <p className="text-sm text-red-200">{actionError}</p>
        )}
      </div>
    </main>
  );
}
