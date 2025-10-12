"use client";

import { useUser } from "@/hooks/useUser";
import { useState } from "react";
import { useCharacters } from "@/hooks/useCharacters";
import CharacterCard from "@/components/CharacterCard"; // Mantido o CharacterCard
import FloatingCreateButton from "@/components/FloatingCreateButton";
import CharacterViewModal from "@/components/CharacterViewModal";
import { Character } from "@/types/models";

// Componente Placeholder para o estado de Loading (Melhoria UI)
const LoadingCharactersPlaceholder = () => (
  <div className="flex flex-col items-center justify-center p-12 bg-gray-50 border border-gray-200 rounded-xl shadow-md">
    <div className="w-10 h-10 border-4 border-t-4 border-t-blue-500 border-gray-200 rounded-full animate-spin mb-4"></div>
    <p className="text-lg font-medium text-gray-700">Carregando heróis...</p>
    <p className="text-sm text-gray-500">
      Buscando dados no servidor de aventura.
    </p>
  </div>
);

// Componente Placeholder para o estado Vazio (Melhoria UX/UI)
const NoCharactersPlaceholder = () => (
  <div className="flex flex-col items-center justify-center p-12 bg-white border-2 border-dashed border-blue-300 rounded-xl shadow-lg w-full max-w-lg mx-auto">
    <span className="text-6xl mb-4" role="img" aria-label="Lupa e Pergaminho">
      📜🔍
    </span>
    <h3 className="text-2xl font-bold text-gray-800 mb-2">
      Nenhum Personagem Encontrado
    </h3>
    <p className="text-center text-gray-600 mb-6">
      Parece que sua jornada ainda não começou! Crie seu primeiro herói para
      iniciar a aventura.
    </p>
    <FloatingCreateButton userId={""} />
  </div>
);

export default function HomePage() {
  const { user, loading: userLoading } = useUser();
  const { characters, loading: charactersLoading } = useCharacters(user?.id);
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(
    null,
  );

  /*******  c9889d5b-7888-4e4b-866e-dc2bf811c8bc  *******/
  const handleViewCharacter = (character: Character) => {
    setSelectedCharacter(character);
  };

  const handleCloseCharacter = () => {
    setSelectedCharacter(null);
  };

  // --- 1. MELHORIA UX: Tratamento de Loading ---
  if (userLoading) {
    return (
      <div className="p-8 min-h-screen bg-gray-50 flex justify-center items-center">
        <LoadingCharactersPlaceholder />
      </div>
    );
  }

  if (!user) {
    // Caso o usuário não esteja logado, redirecione ou mostre uma mensagem de erro
    return <p className="text-red-500 p-8">Erro: Usuário não autenticado.</p>;
  }

  const isDataLoading = charactersLoading || characters === null;

  return (
    // --- 2. MELHORIA UI: Layout e Container ---
    <div className="p-6 md:p-10 min-h-screen bg-gray-50">
      {/* 3. MELHORIA UX: Título Personalizado */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
        Bem-vindo, {user.nickname || "Aventureiro"}!
      </h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-8 border-b pb-2">
        Sua Guilda: {characters?.length || 0} Personagens Ativos
      </h2>

      {/* Container de Personagens */}
      <div className="min-h-[300px] flex justify-center items-start">
        {isDataLoading ? (
          <LoadingCharactersPlaceholder />
        ) : characters.length === 0 ? (
          <NoCharactersPlaceholder />
        ) : (
          // --- 4. MELHORIA UI: Layout de Grid para Cards ---
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full">
            {characters.map((c) => (
              // Garantimos que o CharacterCard tenha largura total da coluna
              <CharacterCard
                key={c.id}
                character={c}
                onClick={() => handleViewCharacter(c)}
              />
            ))}
          </div>
        )}
      </div>

      <CharacterViewModal
        isOpen={!!selectedCharacter} // Abre se houver um personagem selecionado
        onClose={handleCloseCharacter}
        character={selectedCharacter}
      />
      {/* Botão flutuante mantido para criação rápida (MELHORIA UX) */}
      <FloatingCreateButton userId={user.id} />
    </div>
  );
}
