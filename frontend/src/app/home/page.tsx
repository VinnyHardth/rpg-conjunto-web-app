"use client";

import { useUser } from "@/hooks/useUser";
import { useCharacters } from "@/hooks/useCharacters";
import CharacterCard from "@/components/CharacterCard";

import FloatingCreateButton from "@/components/FloatingCreateButton";

export default function HomePage() {
  const { user, loading } = useUser();
  const { characters } = useCharacters(user?.id);

  if (loading) return <p>Carregando usuário...</p>;
  if (!user) return null;

  return (
    <div className="flex flex-col space-y-4">
      <h2 className="text-lg font-semibold">Seus personagens</h2>
      <div className="flex justify-center items-center flex-col">
        {characters.length === 0 ? (
          <p>Nenhum personagem encontrado.</p>
        ) : (
          <ul className="space-y-3 flex flex-row  ">
            {characters.map((c) => (
              <CharacterCard key={c.id} character={c} />
            ))}
          </ul>
        )}
      </div>

          <FloatingCreateButton />

    </div>
  );
}
