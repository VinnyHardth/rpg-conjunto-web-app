"use client";
import React, { useState, useMemo } from "react";
import { calculateDerivedStats } from "@/lib/characterCalculations";
import { 
  CharacterData, 
  AttributeKey, 
  ATTRIBUTE_KEYS, 
  STEP_NAMES,
  DerivedStats,
  Archetype
} from "@/types/character";
import StepIndicator from "./character-creation/StepIndicator";
import NavigationButtons from "./character-creation/NavigationButtons";
import StepOne from "./character-creation/steps/StepOne";
import StepTwo from "./character-creation/steps/StepTwo";
import StepThree from "./character-creation/steps/StepThree";

interface CharacterCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialCharacterData: CharacterData = {
  nome: "",
  raca: "",
  idade: "",
  altura: "",
  genero: "",
  archetype: {
    name: "",
    id: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
    tp: 0,
    hp: 0,
    mp: 0
  },
  atributos: ATTRIBUTE_KEYS.reduce((acc, key) => ({ ...acc, [key]: "" }), {} as Record<AttributeKey, number | string>),
};

export default function CharacterCreationModal({ isOpen, onClose }: CharacterCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [characterData, setCharacterData] = useState<CharacterData>(initialCharacterData);

  const attributesAsNumbers = useMemo(() => {
    return ATTRIBUTE_KEYS.reduce((acc, key) => ({
      ...acc,
      [key]: parseInt(characterData.atributos[key] as string) || 0,
    }), {} as Record<AttributeKey, number>);
  }, [characterData.atributos]);

  const derivedStats: DerivedStats = useMemo(() => {
    return calculateDerivedStats(
      attributesAsNumbers,
      characterData.archetype.hp,
      characterData.archetype.mp,
      characterData.archetype.tp
    );
  }, [attributesAsNumbers, characterData.archetype.hp, characterData.archetype.mp, characterData.archetype.tp]);

  if (!isOpen) return null;

  const totalSteps = STEP_NAMES.length;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleDataChange = (section: "base" | "atributos", key: string, value: string | number) => {
    if (section === "base") {
      setCharacterData({ ...characterData, [key]: value });
    } else if (section === "atributos") {
      setCharacterData({
        ...characterData,
        atributos: { ...characterData.atributos, [key as AttributeKey]: value },
      });
    }
  };

  const handleArchetypeSelect = (archetype: Archetype | null) => {
    if (archetype) {
      setCharacterData(prev => ({ ...prev, archetype }));
    } else {
      setCharacterData(prev => ({
        ...prev,
        archetype: initialCharacterData.archetype
      }));
    }
  };

  const handleFinish = () => {
    console.log("Personagem Criado:", characterData, derivedStats);
    onClose();
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <StepOne characterData={characterData} onDataChange={handleDataChange} />;
      case 1:
        return (
          <StepTwo
            characterData={characterData}
            derivedStats={derivedStats}
            onDataChange={handleDataChange}
            onArchetypeSelect={handleArchetypeSelect}
          />
        );
      case 2:
        return <StepThree characterData={characterData} derivedStats={derivedStats} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800/75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-4xl relative shadow-2xl transform transition-all duration-300 scale-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors text-2xl"
          aria-label="Fechar Modal"
        >
          ✖
        </button>

        <h2 className="text-3xl font-extrabold text-gray-800 mb-1">Criar Novo Personagem</h2>
        <p className="text-gray-500 mb-6">Processo de 3 Etapas. Crie seu herói em minutos.</p>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <div className="min-h-[400px] mb-6">{renderCurrentStep()}</div>

        <NavigationButtons
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={handleBack}
          onNext={handleNext}
          onFinish={handleFinish}
        />
      </div>
    </div>
  );
}