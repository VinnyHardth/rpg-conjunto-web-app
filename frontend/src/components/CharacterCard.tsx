// components/characters/CharacterCard.tsx
"use client";

import { Character } from "@/types/models";
import { useStatus } from "@/hooks/useStatus";
import StatusCard from "./StatusCard";

type CharacterCardProps = {
  character: Character;
  onClick: () => void;
  className?: string;
  disableHoverEffect?: boolean;
  nameSuffix?: string;
  rollSummary?: {
    label: string;
    total: number;
    isSuccess?: boolean;
    detail?: string;
    criticalLabel?: string | null;
    criticalType?: "success" | "failure" | null;
  } | null;
};

export default function CharacterCard({
  character,
  onClick,
  className,
  disableHoverEffect = false,
  nameSuffix,
  rollSummary = null,
}: CharacterCardProps) {
  const { statusList, loading } = useStatus(character.id);

  const hp = statusList.find((s) => s.name.toLowerCase() === "hp");
  const mp = statusList.find((s) => s.name.toLowerCase() === "mp");
  const tp = statusList.find((s) => s.name.toLowerCase() === "tp");

  if (loading) return <p className="p-4 text-gray-500">Carregando status...</p>;

  const baseClasses = [
    "w-[240px]",
    "px-[0.2rem]",
    "pb-[0.55rem]",
    "pt-[0.8rem]",
    "cursor-pointer",
    "transition-transform",
    "duration-200",
    "rounded-lg",
    "bg-white",
  ];

  if (!disableHoverEffect) {
    baseClasses.push("hover:scale-[1.03]", "hover:shadow-xl");
  }

  if (className) {
    baseClasses.push(className);
  }

  return (
    <div key={character.id} onClick={onClick} className={baseClasses.join(" ")}>
      <span className="block text-center text-[15.75px] font-semibold text-gray-800 mb-2">
        {character.name}
        {nameSuffix ? ` ${nameSuffix}` : ""}
      </span>

      <div className="mt-[7px]">
        <StatusCard
          hpCurrent={hp?.valueActual ?? 0}
          hpMax={(hp?.valueMax ?? 0) + (hp?.valueBonus ?? 0)}
          mpCurrent={mp?.valueActual ?? 0}
          mpMax={(mp?.valueMax ?? 0) + (mp?.valueBonus ?? 0)}
          tpCurrent={tp?.valueActual ?? 0}
          tpMax={(tp?.valueMax ?? 0) + (tp?.valueBonus ?? 0)}
          avatarUrl={character.imageUrl || "/assets/placeholder.png"}
          rollSummary={rollSummary ?? undefined}
        />
      </div>
    </div>
  );
}
