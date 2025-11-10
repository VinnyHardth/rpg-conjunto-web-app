import useSWR, { KeyedMutator } from "swr";
import api from "@/lib/axios";
import {
  Character,
  CreateCharacter,
  Archetype,
  CreateCharacterAttribute,
} from "@/types/models";
import {
  calculateExpertises,
  calculateStatus,
} from "@/lib/characterCalculations";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

// Tipos para os dados do banco
interface DatabaseAttribute {
  id: string;
  name: string;
}

interface StatusData {
  name: string;
  value: number;
}

interface AddCharacterPayload {
  info: CreateCharacter;
  archetype: Archetype;
  attributes: CreateCharacterAttribute[];
  expertises: CreateCharacterAttribute[];
  dbExpertises: DatabaseAttribute[];
  dbAttributes: DatabaseAttribute[];
  manualStats?: {
    hp: number;
    mp: number;
    tp: number;
    movimento: number;
    rf: number;
    rm: number;
  };
}

type CharactersMutator = KeyedMutator<Character[]>;

export function useCharacters(userId?: string) {
  const {
    data: characters = [],
    error,
    isLoading,
    mutate,
  } = useSWR<Character[]>(
    userId ? `/characters/user/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    },
  );

  const addCharacter = async (
    payload: AddCharacterPayload,
  ): Promise<Character> => {
    try {
      const {
        info: characterData,
        archetype,
        attributes,
        expertises,
        dbExpertises: expertisesDb,
        dbAttributes: attributesDb,
        manualStats,
      } = payload;
      // 1. Validação dos dados de entrada
      if (!characterData.name?.trim()) {
        throw new Error("Nome do personagem é obrigatório");
      }

      if (attributes.length === 0) {
        throw new Error("Atributos são obrigatórios");
      }

      // 2. Calcula stats derivadas
      const attributeMap = buildAttributeMap(attributes, attributesDb);
      const expertiseMap = buildAttributeMap(expertises, expertisesDb);

      // Calcula os status base. Para NPCs, isso serve como um fallback ou para
      // status que não são sobrescritos manualmente (como movimento, rf, rm).
      const calculatedStatus = calculateStatus(attributeMap, archetype);

      // Se for um NPC e tiver status manuais, eles têm prioridade.
      // Caso contrário, usa os status calculados.
      const finalStatus =
        characterData.type === "NPC" && manualStats
          ? { ...calculatedStatus, ...manualStats }
          : calculatedStatus;

      // 3. Logs de debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV === "development") {
        logDebugInfo(
          characterData,
          attributeMap,
          expertiseMap,
          finalStatus,
          expertisesDb,
        );
      }

      // 4. Cria personagem base
      const createdCharacter = await createBaseCharacter(
        characterData,
        archetype,
      );

      // 5. Cria atributos, perícias e status em paralelo
      await Promise.all([
        createCharacterAttributes(createdCharacter.id, attributes),
        createCharacterAttributes(createdCharacter.id, expertises),
        createCharacterStatus(createdCharacter.id, finalStatus),
      ]);

      // 6. Atualiza cache SWR
      await updateSWRCache(createdCharacter, mutate);

      return createdCharacter;
    } catch (error) {
      console.error("Erro ao criar personagem:", error);
      throw error;
    }
  };

  return {
    characters,
    isLoading,
    error: error as Error | null,
    addCharacter,
    refreshCharacters: mutate,
  };
}
// Funções auxiliares
function buildAttributeMap(
  attributes: CreateCharacterAttribute[],
  attributesDb: DatabaseAttribute[],
): Record<string, number> {
  const attributeMap: Record<string, number> = {};

  attributes.forEach((attr) => {
    attributeMap[attr.attributeId] = attr.valueBase;

    const attribute = attributesDb.find((a) => a.id === attr.attributeId);
    if (attribute) {
      attributeMap[attribute.name] = attr.valueBase;
    }
  });

  return attributeMap;
}

function logDebugInfo(
  characterData: CreateCharacter,
  attributeMap: Record<string, number>,
  expertises: ReturnType<typeof calculateExpertises>,
  status: ReturnType<typeof calculateStatus>,
  expertisesDb: DatabaseAttribute[],
): void {
  console.group("🐛 Debug - Criação de Personagem");
  console.log("📝 Dados do personagem:", characterData);
  console.log("🎯 Atributos calculados:", attributeMap);
  console.log("📊 Perícias calculadas:", expertises);
  console.log("❤️ Status calculados:", status);
  console.log(
    "🏷️ Perícias no banco:",
    expertisesDb.map((e) => e.name),
  );
  console.groupEnd();
}

async function createBaseCharacter(
  characterData: CreateCharacter,
  archetype: Archetype,
): Promise<Character> {
  const response = await api.post("/characters", {
    ...characterData,
    archetypeId: archetype.id,
  });

  return response.data;
}

async function createCharacterAttributes(
  characterId: string,
  attributes: CreateCharacterAttribute[],
): Promise<void> {
  const requests = attributes.map((attr) =>
    api.post("/characterattributes", {
      ...attr,
      characterId,
    }),
  );

  await Promise.all(requests);
}

async function createCharacterStatus(
  characterId: string,
  finalStatus: ReturnType<typeof calculateStatus>,
): Promise<void> {
  const statusList: StatusData[] = [
    { name: "HP", value: finalStatus.hp },
    { name: "MP", value: finalStatus.mp },
    { name: "TP", value: finalStatus.tp },
    { name: "Movimento", value: finalStatus.mov },
    { name: "Resistência Física", value: finalStatus.rf },
    { name: "Resistência Mágica", value: finalStatus.rm },
  ];

  const statusRequests = statusList.map((status) =>
    api.post("/status", {
      name: status.name,
      valueMax: status.value,
      valueActual: status.value,
      valueBonus: 0,
      characterId,
    }),
  );

  await Promise.all(statusRequests);
}

async function updateSWRCache(
  newCharacter: Character,
  mutate: CharactersMutator,
): Promise<void> {
  await mutate(
    (currentCharacters: Character[] | undefined) => {
      return currentCharacters
        ? [newCharacter, ...currentCharacters]
        : [newCharacter];
    },
    { revalidate: false },
  );
}
