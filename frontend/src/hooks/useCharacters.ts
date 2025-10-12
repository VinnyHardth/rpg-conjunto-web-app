import useSWR, { KeyedMutator } from "swr";
import api from "@/lib/axios";
import { Character, CreateCharacter, Archetype, CreateCharacterAttribute } from "@/types/models";
import { calculateExpertises, calculateStatus } from "@/lib/characterCalculations";

const fetcher = (url: string) => api.get(url).then(res => res.data);

// Tipos para os dados do banco
interface DatabaseAttribute {
  id: string;
  name: string;
}

interface DatabaseExpertise {
  id: string;
  name: string;
}

interface StatusData {
  name: string;
  value: number;
}

// Interface para a resposta da API de characterattributes
interface CharacterAttributeResponse {
  id: string;
  characterId: string;
  attributeId: string;
  valueBase: number;
  valueInv: number;
  valueExtra: number;
  // adicione outros campos conforme necessário
}

// Mapeamento correto baseado nas perícias do banco
const EXPERTISE_NAME_MAP: Record<string, string> = {
  // Defensivas
  magicRes: "Magic resistance",
  fisicalRes: "Physical resistance",
  // Percepção
  perception: "Perception",
  // Sociais
  intimidation: "Intimidation",
  faith: "Faith",
  inspiration: "Inspiration",
  determination: "Determination",
  bluff: "Bluff",
  // Físicas
  reflexes: "Reflexes",
};

type CharactersMutator = KeyedMutator<Character[]>;

export function useCharacters(userId?: string) {
  const { 
    data: characters = [], 
    error, 
    isLoading, 
    mutate 
  } = useSWR<Character[]>(
    userId ? `/characters/user/${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  const addCharacter = async (
    characterData: CreateCharacter,
    archetype: Archetype,
    attributes: CreateCharacterAttribute[],
    expertisesDb: DatabaseExpertise[],
    attributesDb: DatabaseAttribute[],
  ): Promise<Character> => {
    try {
      // 1. Validação dos dados de entrada
      if (!characterData.name?.trim()) {
        throw new Error("Nome do personagem é obrigatório");
      }

      if (attributes.length === 0) {
        throw new Error("Atributos são obrigatórios");
      }

      // 2. Calcula stats derivadas
      const attributeMap = buildAttributeMap(attributes, attributesDb);
      const calculatedExpertises = calculateExpertises(attributeMap);
      const calculatedStatus = calculateStatus(attributeMap, archetype);

      // 3. Logs de debug (apenas em desenvolvimento)
      if (process.env.NODE_ENV === 'development') {
        logDebugInfo(characterData, attributeMap, calculatedExpertises, calculatedStatus, expertisesDb);
      }

      // 4. Cria personagem base
      const createdCharacter = await createBaseCharacter(characterData, archetype);

      // 5. Cria atributos, perícias e status em paralelo
      await Promise.all([
        createCharacterAttributes(createdCharacter.id, attributes),
        createCharacterExpertises(createdCharacter.id, calculatedExpertises, expertisesDb),
        createCharacterStatus(createdCharacter.id, calculatedStatus),
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
  attributesDb: DatabaseAttribute[]
): Record<string, number> {
  const attributeMap: Record<string, number> = {};

  attributes.forEach(attr => {
    attributeMap[attr.attributeId] = attr.valueBase;
    
    const attribute = attributesDb.find(a => a.id === attr.attributeId);
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
  expertisesDb: DatabaseExpertise[]
): void {
  console.group("🐛 Debug - Criação de Personagem");
  console.log("📝 Dados do personagem:", characterData);
  console.log("🎯 Atributos calculados:", attributeMap);
  console.log("📊 Perícias calculadas:", expertises);
  console.log("❤️ Status calculados:", status);
  console.log("🏷️ Perícias no banco:", expertisesDb.map(e => e.name));
  console.groupEnd();
}

async function createBaseCharacter(
  characterData: CreateCharacter, 
  archetype: Archetype
): Promise<Character> {
  const response = await api.post("/characters", {
    ...characterData,
    archetypeId: archetype.id,
  });
  
  return response.data;
}

async function createCharacterAttributes(
  characterId: string, 
  attributes: CreateCharacterAttribute[]
): Promise<void> {
  const requests = attributes.map(attr =>
    api.post("/characterattributes", { 
      ...attr, 
      characterId 
    })
  );

  await Promise.all(requests);
}

async function createCharacterExpertises(
  characterId: string,
  calculatedExpertises: ReturnType<typeof calculateExpertises>,
  expertisesDb: DatabaseExpertise[]
): Promise<void> {
  // Tipo para as requisições de perícia
  type ExpertiseRequest = Promise<CharacterAttributeResponse>;

  const expertiseRequests: ExpertiseRequest[] = Object.entries(calculatedExpertises)
    .map(([skillKey, skillValue]) => {
      // Usa o mapeamento para encontrar o nome correto no banco
      const mappedSkillName = EXPERTISE_NAME_MAP[skillKey];
      
      if (!mappedSkillName) {
        console.warn(`❌ Nome de perícia não mapeado: ${skillKey}`);
        console.log("📋 Perícias disponíveis para mapeamento:", Object.keys(EXPERTISE_NAME_MAP));
        return null;
      }

      const expertiseFromDB = expertisesDb.find(exp => 
        exp.name === mappedSkillName
      );
      
      if (!expertiseFromDB) {
        console.warn(`❌ Perícia não encontrada no banco: ${skillKey} → ${mappedSkillName}`);
        console.log("🏷️ Perícias disponíveis no banco:", expertisesDb.map(e => e.name));
        return null;
      }

      console.log(`✅ Perícia encontrada: ${skillKey} → ${mappedSkillName} (ID: ${expertiseFromDB.id})`);

      return api.post<CharacterAttributeResponse>("/characterattributes", {
        characterId,
        attributeId: expertiseFromDB.id,
        valueBase: skillValue,
        valueInv: 0,
        valueExtra: 0,
      }).then(res => res.data);
    })
    .filter((request): request is ExpertiseRequest => request !== null);

  const results = await Promise.allSettled(expertiseRequests);
  
  // Log dos resultados
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      console.error(`❌ Erro ao criar perícia ${index}:`, result.reason);
    }
  });

  const successfulResults = results.filter(r => r.status === 'fulfilled') as PromiseFulfilledResult<CharacterAttributeResponse>[];
  console.log(`✅ ${successfulResults.length} perícias criadas com sucesso`);
}

async function createCharacterStatus(
  characterId: string,
  calculatedStatus: ReturnType<typeof calculateStatus>
): Promise<void> {
  const statusList: StatusData[] = [
    { name: "HP", value: calculatedStatus.hp },
    { name: "MP", value: calculatedStatus.mp },
    { name: "TP", value: calculatedStatus.tp },
    { name: "Movimento", value: calculatedStatus.mov },
  ];

  const statusRequests = statusList.map(status =>
    api.post("/status", {
      name: status.name,
      valueMax: status.value,
      valueActual: status.value,
      valueBonus: 0,
      characterId,
    })
  );

  await Promise.all(statusRequests);
}

async function updateSWRCache(
  newCharacter: Character, 
  mutate: CharactersMutator
): Promise<void> {
  await mutate((currentCharacters: Character[] | undefined) => {
    return currentCharacters ? [newCharacter, ...currentCharacters] : [newCharacter];
  }, { revalidate: false });
}