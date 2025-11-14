interface ResourceDisplayProps {
  stats: {
    hp: number;
    mp: number;
    tp: number;
    movimento: number;
    rf: number;
    rm: number;
  };
  isEditable?: boolean;
  onManualStatChange?: (stat: string, value: number) => void;
}

export default function ResourceDisplay({
  stats,
  isEditable = false,
  onManualStatChange,
}: ResourceDisplayProps) {
  const resources = [
    { key: "hp", label: "HP", value: stats.hp, color: "red", icon: "❤️" },
    { key: "mp", label: "MP", value: stats.mp, color: "blue", icon: "✨" },
    { key: "tp", label: "TP", value: stats.tp, color: "orange", icon: "⚡" },
    {
      key: "movimento",
      label: "Movimento",
      value: stats.movimento,
      unit: "m",
      color: "green",
      icon: "👟",
    },
    { key: "rf", label: "RF", value: stats.rf, color: "purple", icon: "🛡️" },
    { key: "rm", label: "RM", value: stats.rm, color: "pink", icon: "🔮" },
  ];

  return (
    <div className="p-4 border border-teal-200 rounded-lg bg-teal-50">
      <h3 className="font-bold text-xl mb-3 text-teal-700 flex items-center">
        <span className="mr-2">❤️‍🔥</span>{" "}
        {isEditable ? "Definir Status Manuais" : "Status"}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {resources.map(({ key, label, value, unit = "", color, icon }) => (
          <div
            key={label}
            className={`bg-white border-l-4 border-${color}-500 p-2 rounded shadow-sm`}
          >
            <div className="text-sm font-semibold text-gray-500 flex items-center">
              {icon} {label}
            </div>
            {isEditable ? (
              <input
                type="number"
                value={value}
                onChange={(e) =>
                  onManualStatChange?.(key, parseInt(e.target.value) || 0)
                }
                className={`w-full text-2xl font-extrabold text-${color}-800 bg-transparent focus:outline-none p-0`}
                placeholder="0"
              />
            ) : (
              <div className={`text-2xl font-extrabold text-${color}-800`}>
                {value}
                <span className="text-sm font-normal ml-1 text-gray-500">
                  {unit}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
      {isEditable && (
        <p className="text-xs text-gray-500 mt-3">
          Como NPC, você pode definir os status base diretamente, ignorando os
          cálculos de atributos e arquétipo.
        </p>
      )}
    </div>
  );
}
