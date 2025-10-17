import { Campaign } from "@/types/models";

type CampaignHubHeaderProps = {
  campaign: Campaign | null;
  isMaster: boolean;
  isSelecting: boolean;
  showPlayerSelectButton: boolean;
  disableSelection: boolean;
  openSelection: () => void;
};

export default function CampaignHubHeader({
  campaign,
  isMaster,
  isSelecting,
  showPlayerSelectButton,
  disableSelection,
  openSelection,
}: CampaignHubHeaderProps) {
  return (
    <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
          Hub da campanha
        </p>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold">
            {campaign?.name ?? "Carregando"}
          </h1>
          {isMaster && (
            <span className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-300">
              Master view
            </span>
          )}
        </div>
      </div>

      {!isSelecting && showPlayerSelectButton && (
        <button
          type="button"
          disabled={disableSelection}
          onClick={openSelection}
          className="rounded-full border border-slate-700 px-4 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isMaster ? "Adicionar personagem" : "Vincular personagem"}
        </button>
      )}
    </header>
  );
}
