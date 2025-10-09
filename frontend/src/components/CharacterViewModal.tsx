// components/CharacterViewModal.tsx

import React from "react";
// Assumindo que você tem o tipo Character definido
import { Character } from "@/types/models"; 

type CharacterViewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  character: Character | null; // Recebe o objeto completo
};

export default function CharacterViewModal({
  isOpen,
  onClose,
  character,
}: CharacterViewModalProps) {
  if (!isOpen || !character) return null;

  // --- UI/UX: Estrutura do Modal de Visualização/Edição ---
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-8 rounded-xl w-full max-w-4xl relative shadow-2xl overflow-y-auto max-h-[90vh]">
        
        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors text-2xl"
          aria-label="Fechar"
        >
          ✖
        </button>

        <h2 className="text-3xl font-extrabold text-gray-800 mb-2 border-b pb-2">
          Detalhes de {character.name}
        </h2>
        <p className="text-gray-500 mb-6">
          Informações completas e opções de gerenciamento.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Coluna 1: Avatar e Detalhes Principais */}
          <div className="lg:col-span-1 flex flex-col items-center p-4 bg-gray-50 rounded-lg">
            <div className="w-40 h-40 bg-gray-300 rounded-full mb-4 border-4 border-blue-500 flex items-center justify-center text-lg">
              {/* Aqui ficaria a imagem do personagem */}
              {character.name.substring(0, 1)}
            </div>
            <h3 className="text-2xl font-bold mb-1">{character.name}</h3>
            <p className="text-md text-gray-600 mb-4">{character.race || "Raça Desconhecida"}</p>
            
            {/* Opções de Ação Rápida */}
            <div className="flex space-x-3 mt-2">
                <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition text-sm">
                    ✏️ Editar
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition text-sm">
                    🗑️ Remover
                </button>
            </div>
          </div>

          {/* Colunas 2 e 3: Estatísticas e Detalhes */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Estatísticas de Combate (Exemplo) */}
            <div className="border p-4 rounded-lg shadow-sm">
              <h4 className="font-bold text-lg mb-3 text-red-700">Recursos Atuais</h4>
              <div className="grid grid-cols-3 gap-4">
                {/* <div className="bg-red-100 p-2 rounded">HP: <span className="font-bold">{character.hp}</span></div>
                <div className="bg-blue-100 p-2 rounded">MP: <span className="font-bold">{character.mp}</span></div>
                <div className="bg-orange-100 p-2 rounded">TP: <span className="font-bold">{character.tp}</span></div> */}
              </div>
            </div>

            {/* Atributos (Lista de Detalhes) */}
            <div className="border p-4 rounded-lg shadow-sm">
              <h4 className="font-bold text-lg mb-3 text-indigo-700">Atributos Base</h4>
              <div className="grid grid-cols-3 gap-x-6 gap-y-2 text-sm">
                {/* <p>Força: <span className="font-bold">{character.forca}</span></p>
                <p>Destreza: <span className="font-bold">{character.destreza}</span></p> */}
                {/* ... Exibir todos os atributos/perícias aqui ... */}
              </div>
            </div>

            {/* Metadados */}
            <div className="border p-4 rounded-lg shadow-sm text-sm text-gray-600">
                <h4 className="font-bold text-lg mb-2 text-gray-700">Metadados</h4>
                <p>Criado em: {new Date(character.createdAt).toLocaleDateString()}</p>
                <p>Última atualização: {new Date(character.updatedAt).toLocaleDateString()}</p>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
}