// components/characters/CharacterCard.tsx
"use client";

import { Character } from "@/types/models";
import { useStatus } from "@/hooks/useStatus";
import StatusCard from "./StatusCard";

export default function CharacterCard({ character }: { character: Character }) {
  const { statusList, loading } = useStatus(character.id);

  const hp = statusList.find(s => s.name.toLowerCase() === "hp");
  const mp = statusList.find(s => s.name.toLowerCase() === "mp");
  const tp = statusList.find(s => s.name.toLowerCase() === "tp");

  if (loading) return <p>Carregando status...</p>;

  return (
    <li className="p-1">
      <span>{character.name}</span>
      <StatusCard
        hpCurrent={hp?.valueActual ?? 0}
        hpMax={(hp?.valueMax ?? 0) + (hp?.valueBonus ?? 0)}
        mpCurrent={mp?.valueActual ?? 0}
        mpMax={(mp?.valueMax ?? 0) + (mp?.valueBonus ?? 0)}
        tpCurrent={tp?.valueActual ?? 0}
        tpMax={(tp?.valueMax ?? 0) + (tp?.valueBonus ?? 0)}
        avatarUrl={character.imageUrl || "/assets/placeholder.png"}
      />
    </li>
  );
}
