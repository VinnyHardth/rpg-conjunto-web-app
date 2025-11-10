import React, { useState, useMemo, useEffect } from "react";

// Types
import {
  CreateFullCharacter,
  Archetype,
  Attributes,
  CharacterType,
  CreateCharacterAttribute,
  AttributeKind,
  STEPS_NAMES,
} from "@/types/models";

// APIs and services
import { fetchAttributeKinds } from "@/lib/api";

// Utilities
import { calculateStatus } from "@/lib/characterCalculations";

// Components
import StepIndicator from "./character-creation/StepIndicator";
import NavigationButtons from "./character-creation/NavigationButtons";
import StepOne from "./character-creation/steps/StepOne";
import StepTwo from "./character-creation/steps/StepTwo";
import StepThree from "./character-creation/steps/StepThree";
import StepFour from "./character-creation/steps/StepFour";

import { useCharacters } from "@/hooks/useCharacters";
import type { AxiosError } from "axios";

// Constants

const initialCharacterData: CreateFullCharacter = {
  info: {
    name: "",
    race: "",
    age: 0,
    height: 0,
    money: 50,
    type: CharacterType.PC,
    generation: 0,
    gender: "",
    userId: "",
    archetypeId: "",
    annotations: "",
    imageUrl: "https://placehold.co/150x150",
  },
  attributes: [],
  expertises: [],
  status: [],
  archetype: {
    id: "",
    name: "None",
    hp: 0,
    mp: 0,
    tp: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
};

type CharacterStatus = {
  hp: number;
  mp: number;
  tp: number;
  movimento: number;
  rf: number;
  rm: number;
};


const initialOverriddenStats:  Partial<CharacterStatus> = {};

interface CharacterCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

// Tipo para os atributos calculados
interface CalculatedStats {
  expertises: Record<string, number>;
  status: Record<string, number>;
}

const createCharacterAttribute = (
  attributeId: string,
  attributeName: string,
  valueBase: number = 0,
): CreateCharacterAttribute => {
  return {
    characterId: "", // Será preenchido quando o personagem for criado
    attributeId: attributeId,
    alias: attributeName,
    valueBase: valueBase,
    valueInv: 0,
    valueExtra: 0,
  };
};

export default function CharacterCreationModal({
  isOpen,
  onClose,
  userId,
}: CharacterCreationModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [characterData, setCharacterData] =
    useState<CreateFullCharacter>(initialCharacterData);
  const [attributes, setAttributes] = useState<Attributes[]>([]);
  const [overriddenStats, setOverriddenStats] = useState<Partial<CharacterStatus>>(initialOverriddenStats);
  const [expertises, setExpertises] = useState<Attributes[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { addCharacter } = useCharacters(userId);

  // ATTRIBUTE_KEYS será definido dinamicamente com base no fetch
  const [attributeKeys, setAttributeKeys] = useState<string[]>([]);

  const totalExpertisePoints = useMemo(
    () => Math.floor(expertises.length / 2),
    [expertises],
  );

  // Buscar atributos e perícias do banco
  useEffect(() => {
    const fetchData = async () => {
      if (!isOpen) return;

      setIsLoading(true);
      try {
        const [attributesData, expertisesData] = await Promise.all([
          fetchAttributeKinds(AttributeKind.ATTRIBUTE),
          fetchAttributeKinds(AttributeKind.EXPERTISE),
        ]);

        setAttributes(attributesData);
        setExpertises(expertisesData);

        // Ordenar os atributos e perícias
        setAttributes(
          attributesData.sort((a, b) => a.name.localeCompare(b.name)),
        );

        // Definir ATTRIBUTE_KEYS dinamicamente com base nos nomes dos atributos do banco
        const dynamicAttributeKeys = attributesData.map((attr) => attr.name);
        setAttributeKeys(dynamicAttributeKeys);

        // Inicializar atributos básicos com estrutura CORRETA
        const initialAttributes = attributesData.map((attribute) =>
          createCharacterAttribute(attribute.id, attribute.name, 0),
        );

        const initialExpertises = expertisesData.map((expertise) =>
          createCharacterAttribute(expertise.id, expertise.name, 0),
        );

        setCharacterData((prev) => ({
          ...prev,
          attributes: initialAttributes,
          // Inicializa as perícias do personagem com valor 0
          expertises: initialExpertises,
        }));
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isOpen]);

  // Função para resetar completamente o formulário
  const resetForm = () => {
    setCharacterData(initialCharacterData);
    setCurrentStep(0);
    setOverriddenStats(initialOverriddenStats);
    setAttributeKeys([]);
  };

  // Converter atributos para números no formato esperado pelas funções de cálculo
  const attributesAsNumbers = useMemo(() => {
    // Criar um mapa para acesso rápido: attributeId -> valueBase
    const attributeValueMap = new Map(
      characterData.attributes.map((attr) => [
        attr.attributeId,
        attr.valueBase,
      ]),
    );

    return attributeKeys.reduce(
      (acc, key) => {
        const attributeDef = attributes.find((attr) => attr.name === key);
        const value = attributeDef
          ? attributeValueMap.get(attributeDef.id) || 0
          : 0;

        return {
          ...acc,
          [key]: value,
        };
      },
      {} as Record<string, number>,
    );
  }, [characterData.attributes, attributeKeys, attributes]);

  // Calcular estatísticas derivadas usando as novas funções
  const calculatedStats: CalculatedStats = useMemo(() => {
    const status = calculateStatus(
      attributesAsNumbers,
      characterData.archetype,
    );

    // Perícias não são mais calculadas aqui
    return { expertises: {}, status };
  }, [attributesAsNumbers, characterData.archetype]);

  // Status finais para exibição e salvamento. Para NPCs, combina calculados com overrides.
  const finalStats = useMemo(() => {
    const baseStats = {
      hp: calculatedStats.status.hp || 0,
      mp: calculatedStats.status.mp || 0,
      tp: calculatedStats.status.tp || 0,
      movimento: calculatedStats.status.mov || 0,
      rf: calculatedStats.status.rf || 0,
      rm: calculatedStats.status.rm || 0,
    };

    if (characterData.info.type === CharacterType.NPC) {
      return { ...baseStats, ...overriddenStats };
    }
    return baseStats;
  }, [calculatedStats, characterData.info.type, overriddenStats]);

  // Resetar o formulário quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalSteps = STEPS_NAMES.length;

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

  // Atualizar informações básicas
  const handleDataChange = (
    section: "base" | "atributos",
    key: string,
    value: string | number,
  ) => {
    if (section === "base") {
      setCharacterData((prev) => ({
        ...prev,
        info: {
          ...prev.info,
          [key]: value,
        },
      }));
    } else if (section === "atributos") {
      setCharacterData((prev) => {
        const existingAttributeIndex = prev.attributes.findIndex((attr) => {
          // Encontrar pelo nome do atributo através do ID
          const attributeDef = attributes.find(
            (a) => a.id === attr.attributeId,
          );
          return attributeDef?.name === key;
        });

        if (existingAttributeIndex >= 0) {
          const updatedAttributes = [...prev.attributes];
          updatedAttributes[existingAttributeIndex] = {
            ...updatedAttributes[existingAttributeIndex],
            valueBase: Number(value) || 0,
          };
          return { ...prev, attributes: updatedAttributes };
        } else {
          // Encontrar o atributo no banco pelo nome
          const attributeFromDB = attributes.find((attr) => attr.name === key);
          if (attributeFromDB) {
            const newAttribute = createCharacterAttribute(
              attributeFromDB.id,
              key,
              Number(value) || 0,
            );
            return { ...prev, attributes: [...prev.attributes, newAttribute] };
          }
          return prev;
        }
      });
    }
  };

  const handleArchetypeSelect = (archetype: Archetype | null) => {
    if (archetype) {
      setCharacterData((prev) => ({
        ...prev,
        archetype,
        info: {
          ...prev.info,
          archetypeId: archetype.id,
        },
      }));
    } else {
      setCharacterData((prev) => ({
        ...prev,
        archetype: initialCharacterData.archetype,
        info: {
          ...prev.info,
          archetypeId: "",
        },
      }));
    }
  };

  const handleManualStatChange = (stat: string, value: number) => {
    // Atualiza apenas os status que foram manualmente alterados para o NPC
    setOverriddenStats((prev) => ({
      ...prev,
      [stat]: value,
    }));
  };

  const handleExpertiseChange = (expertiseId: string, newValue: number) => {
    setCharacterData((prev) => {
      const updatedExpertises = prev.expertises.map((exp) => {
        if (exp.attributeId === expertiseId) {
          return { ...exp, valueBase: newValue };
        }
        return exp;
      });
      return { ...prev, expertises: updatedExpertises };
    });
  };

  const validateCharacterInfo = (): string | null => {
    const trimmedName = characterData.info.name?.trim() ?? "";
    if (trimmedName.length < 2) {
      return "Defina um nome com pelo menos 2 caracteres.";
    }

    const trimmedRace = characterData.info.race?.trim() ?? "";
    if (trimmedRace.length < 2) {
      return "Informe uma raça com pelo menos 2 caracteres.";
    }

    if (!characterData.info.gender) {
      return "Selecione um gênero para o personagem.";
    }

    if (
      characterData.info.age === undefined ||
      characterData.info.age === null ||
      characterData.info.age < 0
    ) {
      return "Defina uma idade válida (zero ou maior).";
    }

    if (
      characterData.info.height === undefined ||
      characterData.info.height === null ||
      characterData.info.height < 0
    ) {
      return "Defina uma altura válida (zero ou maior).";
    }

    if (
      characterData.info.type === CharacterType.PC &&
      !characterData.archetype.id
    ) {
      return "Selecione um arquétipo para continuar.";
    }

    if (!characterData.info.userId && !userId) {
      return "Não foi possível localizar o usuário. Refaça o login e tente novamente.";
    }

    return null;
  };

  const handleFinish = async () => {
    const validationError = validateCharacterInfo();
    if (validationError) {
      alert(validationError);
      return;
    }

    const baseInfo = {
      ...characterData.info,
      name: characterData.info.name.trim(),
      race: characterData.info.race?.trim() ?? null,
      annotations: characterData.info.annotations?.trim() || undefined,
      gender: characterData.info.gender.trim(),
      userId,
      archetypeId: characterData.archetype.id,
      money: characterData.info.money ?? 0,
      type: characterData.info.type ?? CharacterType.PC,
    };

    try {
      await addCharacter({
        info: baseInfo,
        archetype: characterData.archetype,
        attributes: characterData.attributes,
        expertises: characterData.expertises,
        dbExpertises: expertises,
        dbAttributes: attributes,
        manualStats:
          baseInfo.type === CharacterType.NPC ? finalStats : undefined,
    });

      resetForm();
      onClose();
    } catch (error) {
      console.error("Erro ao criar personagem:", error);
      const axiosError = error as AxiosError<{
        message?: string;
        error?: string;
      }>;
      const serverMessage =
        axiosError.response?.data?.message ??
        axiosError.response?.data?.error ??
        "Erro ao criar personagem. Verifique os dados e tente novamente.";
      alert(serverMessage);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Função auxiliar para obter valor de atributo pelo nome
  const getAttributeValue = (attributeName: string): number => {
    const attributeDef = attributes.find((attr) => attr.name === attributeName);
    if (!attributeDef) return 0;

    const characterAttribute = characterData.attributes.find(
      (attr) => attr.attributeId === attributeDef.id,
    );
    return characterAttribute?.valueBase || 0;
  };

  const renderCurrentStep = () => {
    if (isLoading) {
      return (
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">
              Carregando atributos e perícias...
            </p>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <StepOne
            characterData={characterData}
            onDataChange={handleDataChange}
          />
        );
      case 1:
        return (
          <StepTwo
            characterData={characterData}
            derivedStats={finalStats}
            onDataChange={handleDataChange}
            onManualStatChange={handleManualStatChange}
            onArchetypeSelect={handleArchetypeSelect}
            getAttributeValue={getAttributeValue}
            attributes={attributes}
            expertises={expertises}
            attributeKeys={attributeKeys}
          />
        );
      case 2:
        return (
          <StepThree
            characterData={characterData}
            allExpertises={expertises}
            onExpertiseChange={handleExpertiseChange}
            totalPoints={totalExpertisePoints}
          />
        );
      case 3:
        return (
          <StepFour characterData={characterData} derivedStats={finalStats} />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-800/75 flex justify-center items-center z-50 p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-4xl relative shadow-2xl transform transition-all duration-300 scale-100">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors text-2xl"
          aria-label="Fechar Modal"
        >
          ✖
        </button>

        <h2 className="text-3xl font-extrabold text-gray-800 mb-1">
          Criar Novo Personagem
        </h2>
        <p className="text-gray-500 mb-6">
          Processo de 3 Etapas. Crie seu herói em minutos.
        </p>

        <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />

        <div className="min-h-[400px] max-h-[60vh] overflow-y-auto p-2 mb-6 border rounded-lg bg-gray-50/50">
          {renderCurrentStep()}
        </div>

        <NavigationButtons
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={handleBack}
          onNext={handleNext}
          onFinish={handleFinish}
          // isLoading={isLoading}
        />
      </div>
    </div>
  );
}
