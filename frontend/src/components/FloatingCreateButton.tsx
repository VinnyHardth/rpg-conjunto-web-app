"use client";

import React, { useEffect, useRef, useState } from "react";

import CharacterCreationModal from "./CharacterCreationModal";
import CampaignCreateModal from "./CampaignCreateModal";

type Props = {
  userId: string;
};

export default function FloatingCreateButton({ userId }: Props) {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isCharacterModalOpen, setCharacterModalOpen] = useState(false);
  const [isCampaignModalOpen, setCampaignModalOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current?.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleOpenCharacterModal = () => {
    setMenuOpen(false);
    setCharacterModalOpen(true);
  };

  const handleOpenCampaignModal = () => {
    setMenuOpen(false);
    setCampaignModalOpen(true);
  };

  return (
    <>
      <div
        ref={containerRef}
        className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3"
      >
        {isMenuOpen && (
          <div className="w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg">
            <button
              type="button"
              onClick={handleOpenCharacterModal}
              className="w-full px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Criar personagem
            </button>
            <button
              type="button"
              onClick={handleOpenCampaignModal}
              className="w-full border-t border-gray-100 px-4 py-3 text-left text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
            >
              Criar campanha
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="rounded-full bg-blue-500 p-4 text-white shadow-lg transition-colors hover:bg-blue-600"
          aria-expanded={isMenuOpen}
          aria-label="Abrir opções de criação"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="h-8 w-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
      </div>

      <CharacterCreationModal
        isOpen={isCharacterModalOpen}
        onClose={() => setCharacterModalOpen(false)}
        userId={userId}
      />

      <CampaignCreateModal
        isOpen={isCampaignModalOpen}
        onClose={() => setCampaignModalOpen(false)}
        userId={userId}
      />
    </>
  );
}
