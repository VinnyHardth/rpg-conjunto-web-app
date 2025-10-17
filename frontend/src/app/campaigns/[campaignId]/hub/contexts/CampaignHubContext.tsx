import { createContext, useContext, ReactNode } from "react";
import type { Attributes, Character, User } from "@/types/models";
import type { EffectDTO } from "@rpg/shared";
import type { RollDifficultyResponse } from "@/lib/api";
import { useCampaignData } from "../hooks/useCampaignData";
import { useCharacterManagement } from "../hooks/useCharacterManagement";
import { useDiceRolls } from "../hooks/useDiceRolls";
import { useDamagePanel } from "../hooks/useDamagePanel";
import { useHubInterface } from "../hooks/useHubInterface";
import { useRestActions } from "../hooks/useRestActions";

// Tipagem para o valor do contexto, agregando o retorno de todos os hooks
type CampaignHubContextType = {
  useCampaignData: ReturnType<typeof useCampaignData>;
  useCharacterManagement: ReturnType<typeof useCharacterManagement>;
  useDiceRolls: ReturnType<typeof useDiceRolls>;
  useDamagePanel: ReturnType<typeof useDamagePanel>;
  useHubInterface: ReturnType<typeof useHubInterface>;
  useRestActions: ReturnType<typeof useRestActions>;
  // Adicione outros valores globais aqui se necessário
  isMaster: boolean;
  sidebarCharacterId: string | null;
  sidebarCharacter: Character | null;
  sidebarRoll: RollDifficultyResponse | null;
  attributeDefinitions: Attributes[] | undefined;
  expertiseDefinitions: Attributes[] | undefined;
  effects: EffectDTO[] | undefined;
  effectsLoading: boolean;
  effectsError: Error | null;
  disableSelection: boolean;
  user: User | null;
};

// Cria o contexto com um valor inicial nulo
const CampaignHubContext = createContext<CampaignHubContextType | null>(null);

/**
 * Componente Provedor que encapsula toda a lógica de hooks.
 * Ele será usado no page.tsx para envolver os componentes filhos.
 */
export function CampaignHubProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: CampaignHubContextType;
}) {
  return (
    <CampaignHubContext.Provider value={value}>
      {children}
    </CampaignHubContext.Provider>
  );
}

/**
 * Hook customizado para consumir o contexto de forma segura.
 * Os componentes filhos usarão este hook para acessar os dados e funções.
 */
export function useCampaignHub() {
  const context = useContext(CampaignHubContext);
  if (!context) {
    throw new Error("useCampaignHub must be used within a CampaignHubProvider");
  }
  return context;
}
