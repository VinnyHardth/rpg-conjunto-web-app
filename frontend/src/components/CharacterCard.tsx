// components/characters/CharacterCard.tsx
"use client";

import { Character } from "@/types/models";
import { useStatus } from "@/hooks/useStatus";
import StatusCard from "./StatusCard";

// Adicionar a propriedade 'onClick'
type CharacterCardProps = {
  character: Character;
  onClick: () => void; // A função que abre o modal
};

export default function CharacterCard({
  character,
  onClick,
}: CharacterCardProps) {
  const { statusList, loading } = useStatus(character.id);

  // A busca por status é mantida
  const hp = statusList.find((s) => s.name.toLowerCase() === "hp");
  const mp = statusList.find((s) => s.name.toLowerCase() === "mp");
  const tp = statusList.find((s) => s.name.toLowerCase() === "tp");

  if (loading) return <p className="p-4 text-gray-500">Carregando status...</p>;

  // A lista <li> é substituída por um <div> mais flexível e clicável
  return (
    <div
      key={character.id}
      // 1. Aplicamos o onClick recebido
      onClick={onClick}
      // 2. Adicionamos estilos que melhoram a UX e a UI
      className="p-1 cursor-pointer transition-transform duration-200 hover:scale-[1.03] hover:shadow-xl bg-white rounded-lg"
    >
      {/* O nome agora está dentro do container clicável */}
      <span className="block text-center text-lg font-semibold text-gray-800 mb-1">
        {character.name}
      </span>

      {/* StatusCard (seu componente visual) */}
      <StatusCard
        hpCurrent={hp?.valueActual ?? 0}
        hpMax={(hp?.valueMax ?? 0) + (hp?.valueBonus ?? 0)}
        mpCurrent={mp?.valueActual ?? 0}
        mpMax={(mp?.valueMax ?? 0) + (mp?.valueBonus ?? 0)}
        tpCurrent={tp?.valueActual ?? 0}
        tpMax={(tp?.valueMax ?? 0) + (tp?.valueBonus ?? 0)}
        avatarUrl={character.imageUrl || "/assets/placeholder.png"}
      />
    </div>
  );
}
