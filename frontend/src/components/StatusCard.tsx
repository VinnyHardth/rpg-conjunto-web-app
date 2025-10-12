import React from "react";

interface StatusProps {
  hpCurrent: number;
  hpMax: number;
  mpCurrent: number;
  mpMax: number;
  tpCurrent: number;
  tpMax: number;
  avatarUrl: string;
}

const StatusCard: React.FC<StatusProps> = ({
  hpCurrent,
  hpMax,
  mpCurrent,
  mpMax,
  tpCurrent,
  tpMax,
  avatarUrl,
}) => {
  const hpPercent = Math.min(100, (hpCurrent / hpMax) * 100);
  const mpPercent = Math.min(100, (mpCurrent / mpMax) * 100);
  const tpPercent = Math.min(100, (tpCurrent / tpMax) * 100);

  const hpDisplay = Math.round(hpCurrent);
  const mpDisplay = Math.round(mpCurrent);
  const tpDisplay = Math.round(tpCurrent);

  return (
    <div className="player-status-card">
      {/* Avatar Circular */}
      <div className="avatar-container">
        <img
          src={avatarUrl}
          alt="Avatar do Jogador"
          className="player-avatar"
        />
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
    </div>
  );
};

export default StatusCard;
