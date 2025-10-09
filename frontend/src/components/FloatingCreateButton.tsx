"use client";

import React, { useState } from "react";
import CharacterCreationModal from "./CharacterCreationModal";

type Props = {
  userId: string ;
};

export default function CreateIcon({userId}: Props) {
  const [isModalOpen, setModalOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 p-4 bg-blue-500 rounded-full shadow-lg hover:bg-blue-600 z-50"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-8 h-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      <CharacterCreationModal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        userId={userId}
      />
    </>
  );
}
