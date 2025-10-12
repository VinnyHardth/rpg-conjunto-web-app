import React, { useState, useMemo, useEffect } from "react";
import Decimal from "decimal.js";

// Types
import {
  CreateFullCharacter,
  CreateCharacter,
  Archetype,
  Attributes,
  CharacterType,
  CreateCharacterAttribute,
  AttributeKind,
} from "@/types/models";

// APIs and services
import api from "@/lib/axios";
import { fetchAttributeKinds } from "@/lib/api";

// Utilities
import {
  calculateExpertises,
  calculateStatus,
} from "@/lib/characterCalculations";

// Components
import StepIndicator from "./character-creation/StepIndicator";
import NavigationButtons from "./character-creation/NavigationButtons";
import StepOne from "./character-creation/steps/StepOne";
import StepTwo from "./character-creation/steps/StepTwo";
import StepThree from "./character-creation/steps/StepThree";

import { useCharacters } from "@/hooks/useCharacters";

// Constants
export const STEP_NAMES = [
  "Informações Básicas",
  "Atributos & Estatísticas",
  "Resumo Final",
];

// Mapeamento dos nomes das perícias para os nomes que vêm do banco
const SKILL_NAME_MAPPING: Record<string, string> = {
  magicRes: "Magic resistance",
  fisicalRes: "Physical resistance",
  perception: "Perception",
  intimidation: "Intimidation",
  faith: "Faith",
  inspiration: "Inspiration",
  determination: "Determination",
  bluff: "Bluff",
  reflexes: "Reflexes",
};

const ATTRIBUTE_ORDER = [
  "Strength",
  "Dexterity",
  "Intelligence",
  "Wisdom",
  "Constitution",
  "Charisma",
  "Destiny",
];

const initialCharacterData: CreateFullCharacter = {
  info: {
    name: "",
    race: "",
    age: 0,
    height: 0,
    money: new Decimal(50),
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
    name: "",
    hp: 0,
    mp: 0,
    tp: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  },
};

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
  const [expertises, setExpertises] = useState<Attributes[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ← Novo estado para submit

  const { addCharacter, characters } = useCharacters(userId);

  // ATTRIBUTE_KEYS será definido dinamicamente com base no fetch
  const [attributeKeys, setAttributeKeys] = useState<string[]>([]);

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
          attributesData.sort(
            (a, b) =>
              ATTRIBUTE_ORDER.indexOf(a.name) - ATTRIBUTE_ORDER.indexOf(b.name),
          ),
        );

        // Definir ATTRIBUTE_KEYS dinamicamente com base nos nomes dos atributos do banco
        const dynamicAttributeKeys = attributesData.map((attr) => attr.name);
        setAttributeKeys(dynamicAttributeKeys);

        console.log("Atributos carregados:", dynamicAttributeKeys);
        console.log(
          "Perícias carregadas:",
          expertisesData.map((exp) => exp.name),
        );

        // Inicializar atributos básicos com estrutura CORRETA
        const initialAttributes = attributesData.map((attribute) =>
          createCharacterAttribute(attribute.id, attribute.name, 0),
        );

        setCharacterData((prev) => ({
          ...prev,
          attributes: initialAttributes,
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
    const expertises = calculateExpertises(attributesAsNumbers);
    const status = calculateStatus(
      attributesAsNumbers,
      characterData.archetype,
    );

    return {
      expertises,
      status,
    };
  }, [attributesAsNumbers, characterData.archetype]);

  // Combinar com os modificadores do arquétipo
  const derivedStats = useMemo(() => {
    return {
      pericias: calculatedStats.expertises,
      hp: calculatedStats.status.hp || 0,
      mp: calculatedStats.status.mp || 0,
      tp: calculatedStats.status.tp || 0,
      movimento: calculatedStats.status.mov || 0,
    };
  }, [calculatedStats]);

  // Resetar o formulário quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

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

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      console.log("Personagem Criado:", characterData, derivedStats);

      // 1️⃣ Criar o personagem (APENAS dados que o backend conhece)
      const characterPayload: CreateCharacter = {
        ...characterData.info,
        userId: userId,
        archetypeId: characterData.archetype.id,
        // NÃO envie initialHp, initialMp, initialTp - o backend não conhece!
      };

      // Passa os derivedStats como segundo parâmetro para o cache
      const createdCharacter = await addCharacter(
        characterPayload,
        derivedStats,
      );
      console.log("Personagem criado com sucesso:", createdCharacter);

      // 2️⃣ Criar atributos, perícias e status em paralelo
      await Promise.all([
        // Atributos
        ...characterData.attributes.map((charAttr) =>
          api.post("/characterattributes", {
            ...charAttr,
            characterId: createdCharacter.id,
          }),
        ),

        // Perícias
        ...Object.entries(derivedStats.pericias).map(
          ([skillKey, skillValue]) => {
            const skillName = SKILL_NAME_MAPPING[skillKey];
            const expertiseFromDB = expertises.find(
              (dbExp) => dbExp.name === skillName,
            );
            if (!expertiseFromDB) return Promise.resolve(null);

            return api.post("/characterattributes", {
              characterId: createdCharacter.id,
              attributeId: expertiseFromDB.id,
              valueBase: skillValue,
              valueInv: 0,
              valueExtra: 0,
            });
          },
        ),

        // Status (criamos no banco normalmente)
        ...[
          { name: "HP", value: derivedStats.hp },
          { name: "MP", value: derivedStats.mp },
          { name: "TP", value: derivedStats.tp },
          { name: "Movimento", value: derivedStats.movimento },
        ].map((status) =>
          api.post("/status", {
            name: status.name,
            valueMax: status.value,
            valueBonus: 0,
            valueActual: status.value,
            characterId: createdCharacter.id,
          }),
        ),
      ]);

      console.log("Tudo criado com sucesso!");

      resetForm();
      onClose();
      alert("Personagem criado com sucesso!");
    } catch (error) {
      console.error("Erro ao criar personagem:", error);
      alert(
        "Erro ao criar personagem. Verifique o console para mais detalhes.",
      );
    } finally {
      setIsSubmitting(false);
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
            derivedStats={derivedStats}
            onDataChange={handleDataChange}
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
            derivedStats={derivedStats}
          />
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

        <div className="min-h-[400px] mb-6">{renderCurrentStep()}</div>

        <NavigationButtons
          currentStep={currentStep}
          totalSteps={totalSteps}
          onBack={handleBack}
          onNext={handleNext}
          onFinish={handleFinish}
          //isLoading={isLoading}
        />
      </div>
    </div>
  );
}
