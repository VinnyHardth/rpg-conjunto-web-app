/* eslint-disable @next/next/no-img-element */

import React from "react";

interface StatusProps {
  hpCurrent: number;
  hpMax: number;
  mpCurrent: number;
  mpMax: number;
  tpCurrent: number;
  tpMax: number;
  avatarUrl: string;
  rollSummary?: {
    label: string;
    total: number;
    isSuccess?: boolean;
    detail?: string;
    criticalLabel?: string | null;
    criticalType?: "success" | "failure" | null;
  };
  physicalResistance?: number;
  magicalResistance?: number;
}

const StatusCard: React.FC<StatusProps> = ({
  hpCurrent,
  hpMax,
  mpCurrent,
  mpMax,
  tpCurrent,
  tpMax,
  avatarUrl,
  rollSummary,
  physicalResistance,
  magicalResistance,
}) => {
  const computePercent = (current: number, max: number): number => {
    if (max <= 0) return 0;
    const raw = (current / max) * 100;
    if (!Number.isFinite(raw)) return 0;
    return Math.min(100, Math.max(0, raw));
  };

  const hpPercent = computePercent(hpCurrent, hpMax);
  const mpPercent = computePercent(mpCurrent, mpMax);
  const tpPercent = computePercent(tpCurrent, tpMax);

  const hpDisplay = Math.round(hpCurrent);
  const mpDisplay = Math.round(mpCurrent);
  const tpDisplay = Math.round(tpCurrent);
  const physicalResistanceDisplay =
    physicalResistance === undefined || physicalResistance === null
      ? null
      : Math.round(physicalResistance);
  const magicalResistanceDisplay =
    magicalResistance === undefined || magicalResistance === null
      ? null
      : Math.round(magicalResistance);

  return (
    <div className="player-status-card">
      {/* Avatar Circular */}
      <div className="avatar-container">
        <img
          src={avatarUrl}
          alt="Avatar do Jogador"
          className="player-avatar"
        />
        {rollSummary && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/70 text-center text-white">
            <span
              className={`text-3xl font-black leading-6 ${
                rollSummary.isSuccess === undefined
                  ? "text-sky-300"
                  : rollSummary.isSuccess
                    ? "text-emerald-300"
                    : "text-rose-300"
              }`}
            >
              {rollSummary.total}
            </span>
            <span className="mt-0.5 rounded bg-white/10 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-widest">
              {rollSummary.label}
            </span>
            {rollSummary.detail && (
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/80">
                {rollSummary.detail}
              </span>
            )}
            {rollSummary.isSuccess !== undefined && (
              <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/80">
                {rollSummary.isSuccess ? "Sucesso" : "Falha"}
              </span>
            )}
            {rollSummary.criticalLabel && (
              <span
                className={`mt-0.5 text-[10px] font-bold uppercase tracking-widest ${
                  rollSummary.criticalType === "failure"
                    ? "text-rose-200"
                    : "text-emerald-200"
                }`}
              >
                {rollSummary.criticalLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Barras de Status */}
      <div className="status-bars-group">
        {/* HP com diamante */}
        <div className="hp-bar-row">
          <span className="label">HP</span>
          <div className="hp-bar-background large">
            <div className="hp-fill" style={{ width: `${hpPercent}%` }}></div>
          </div>

          {/* Diamante com número */}
          <div className="diamond">
            <span className="diamond-value">{hpDisplay}</span>
          </div>
        </div>
        <div className="secondary-bars">
          {/* MP */}
          <div className="bar-row">
            <div className="bar-background">
              <div
                className="bar-fill mp"
                style={{ width: `${mpPercent}%` }}
              ></div>
            </div>
            <span className="bar-label mp">MP: {mpDisplay}</span>
          </div>

          {/* TP */}
          <div className="tp-bar-row">
            <div className="bar-background">
              <div
                className="bar-fill tp"
                style={{ width: `${tpPercent}%` }}
              ></div>
            </div>
            <span className="bar-label tp">TP: {tpDisplay}</span>
          </div>
        </div>
      </div>

      {physicalResistanceDisplay !== null && (
        <ResistanceBadge position="left" value={physicalResistanceDisplay}>
          <ShieldIcon className="h-3.5 w-3.5" />
        </ResistanceBadge>
      )}
      {magicalResistanceDisplay !== null && (
        <ResistanceBadge position="right" value={magicalResistanceDisplay}>
          <MagicIcon className="h-3.5 w-3.5" />
        </ResistanceBadge>
      )}
    </div>
  );
};

const ShieldIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    {...props}
  >
    <path
      d="M12 3 5 5v6.5c0 4.2 2.9 8.1 7 9.5 4.1-1.4 7-5.3 7-9.5V5l-7-2Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M12 7v8" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const MagicIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.6}
    {...props}
  >
    <path
      d="M12 3v4m6.36-.36-2.83 2.83M21 12h-4m.36 6.36-2.83-2.83M12 21v-4m-6.36.36 2.83-2.83M3 12h4m-.36-6.36 2.83 2.83"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 14.5 12 9l2.5 5.5L20 16l-5 2 2 5-5-3-5 3 2-5-5-2 5.5-1.5Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

type ResistanceBadgeProps = {
  value: number;
  position: "left" | "right";
  children: React.ReactNode;
};

const ResistanceBadge = ({
  value,
  position,
  children,
}: ResistanceBadgeProps) => (
  <div
    className={`resistance-badge ${position === "left" ? "resistance-left" : "resistance-right"}`}
    aria-label={`Resistência ${position === "left" ? "física" : "mágica"}`}
  >
    <span className="resistance-icon">{children}</span>
    <span className="resistance-value">{value}</span>
  </div>
);

export default StatusCard;
