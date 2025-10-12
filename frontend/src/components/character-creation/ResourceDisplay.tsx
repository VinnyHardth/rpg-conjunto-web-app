interface ResourceDisplayProps {
  derivedStats: {
    hp: number;
    mp: number;
    tp: number;
    movimento: number;
  };
}

export default function ResourceDisplay({
  derivedStats,
}: ResourceDisplayProps) {
  const resources = [
    { label: "HP", value: derivedStats.hp, color: "red", icon: "❤️" },
    { label: "MP", value: derivedStats.mp, color: "blue", icon: "✨" },
    { label: "TP", value: derivedStats.tp, color: "orange", icon: "⚡" },
    {
      label: "Movimento",
      value: derivedStats.movimento,
      unit: "m",
      color: "green",
      icon: "👟",
    },
  ];

  return (
    <div className="p-4 border border-teal-200 rounded-lg bg-teal-50">
      <h3 className="font-bold text-xl mb-3 text-teal-700 flex items-center">
        <span className="mr-2">❤️‍🔥</span> Recursos Base
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {resources.map(({ label, value, unit = "", color, icon }) => (
          <div
            key={label}
            className={`bg-white border-l-4 border-${color}-500 p-2 rounded shadow-sm`}
          >
            <div className="text-sm font-semibold text-gray-500 flex items-center">
              {icon} {label}
            </div>
            <div className={`text-2xl font-extrabold text-${color}-800`}>
              {value}
              <span className="text-sm font-normal ml-1 text-gray-500">
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
