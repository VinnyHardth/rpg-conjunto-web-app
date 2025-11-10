// app/characters/[id]/manage/page.tsx
"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import useSWR from "swr";
import { useCharacterData } from "@/hooks/useCharacterData";
import toast from "react-hot-toast";
import CharacterBasicInfo from "./components/CharacterBasicInfo";
import CharacterAttributes from "./components/CharacterAttributes";
import CharacterInventoryEquipment from "./components/CharacterInventoryEquipment";
import AddInventoryItemDialog from "./components/AddInventoryItemDialog";
import CharacterExpertises from "./components/CharacterExpertises";
import { EquipItemDialog } from "./components/EquipItemDialog";

import {
  CharacterBasicInfoUpdate,
  FullCharacterData,
  CharacterDTO,
} from "@rpg/shared";
import type { CharacterHasItemDTO, ItemsDTO } from "@rpg/shared";

import {
  CharacterAttribute,
  Status,
  EquipSlot,
  Archetype,
} from "@/types/models";

import api from "@/lib/axios";
import { AxiosResponse } from "axios";
import {
  createCharacterInventoryItem,
  fetchItems,
  updateCharacterInventoryItem,
  deleteCharacterInventoryItem,
} from "@/lib/api";
import { calculateStatus } from "@/lib/characterCalculations";
import { AttributesDTO } from "@rpg/shared";

const MANAGEMENT_TABS = [
  { id: "info", name: "Informações Básicas", icon: "📝" },
  { id: "attributes", name: "Atributos", icon: "💪" },
  { id: "expertises", name: "Perícias", icon: "📈" },
  { id: "inventory", name: "Inventário", icon: "🎒" },
] as const;

type ManagementTab = (typeof MANAGEMENT_TABS)[number]["id"];

const isValidManagementTab = (tabId: string | null): tabId is ManagementTab =>
  tabId !== null && MANAGEMENT_TABS.some((tab) => tab.id === tabId);

export default function CharacterManagementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data, isLoading, error, mutate } = useCharacterData(id);
  const [originalCharacterData, setOriginalCharacterData] =
    useState<FullCharacterData | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tabFromParams = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<ManagementTab>(() =>
    isValidManagementTab(tabFromParams) ? tabFromParams : "info",
  );

  const [localCharacterData, setLocalCharacterData] =
    useState<FullCharacterData | null>(null);
  const [pendingUpdates, setPendingUpdates] = useState<
    Partial<FullCharacterData>
  >({});
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemToEquip, setItemToEquip] = useState<CharacterHasItemDTO | null>(
    null,
  );
  const [selectedEquipSlot, setSelectedEquipSlot] = useState<EquipSlot>(
    EquipSlot.NONE,
  );
  const [isUpdatingEquipment, setIsUpdatingEquipment] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

  const {
    data: availableItems,
    isLoading: isLoadingItems,
    error: itemsError,
  } = useSWR<ItemsDTO[]>("items", fetchItems, {
    revalidateOnFocus: false,
  });

  const { data: archetypes, error: archetypesError } = useSWR<Archetype[]>(
    "archetypes",
    () => api.get("/archetypes").then((res) => res.data),
  );

  const {
    data: attributesDefinitions,
    //isLoading: isLoadingAttributes,
    error: attributesError,
  } = useSWR<AttributesDTO[]>("attributes", () =>
    api.get("/attributes").then((res) => res.data),
  );

  useEffect(() => {
    if (data) {
      setLocalCharacterData(data);
      setOriginalCharacterData(data);
    }
  }, [data]);

  useEffect(() => {
    if (isValidManagementTab(tabFromParams)) {
      setActiveTab((prev) => (prev === tabFromParams ? prev : tabFromParams));
      return;
    }

    setActiveTab((prev) => (prev === "info" ? prev : "info"));
  }, [tabFromParams]);

  useEffect(() => {
    if (!itemsError) return;
    console.error("Falha ao carregar itens disponíveis:", itemsError);
    toast.error("Não foi possível carregar a lista de itens.");
  }, [itemsError]);

  useEffect(() => {
    if (!archetypesError) return;
    console.error("Falha ao carregar arquétipos:", archetypesError);
    toast.error("Não foi possível carregar a lista de arquétipos.");
  }, [archetypesError]);

  useEffect(() => {
    if (!attributesError) return;
    console.error(
      "Falha ao carregar definições de atributos:",
      attributesError,
    );
    toast.error("Não foi possível carregar as definições de atributos.");
  }, [attributesError]);

  const handleBasicInfoUpdate = (updates: CharacterBasicInfoUpdate) => {
    setPendingUpdates(
      (prev): Partial<FullCharacterData> => ({
        ...prev,
        info: {
          ...(localCharacterData?.info as CharacterDTO), // Start with the full, current data
          ...prev.info,
          ...updates,
          id, // Ensure ID is always present and correct
        },
      }),
    );

    // Recalcula os status em tempo real se o arquétipo foi alterado
    let newCalculatedStatus: Status[] | undefined;
    let newCalculatedArchetype: Archetype | undefined;

    // Lógica para quando o tipo muda de NPC para PC
    // Isso deve recalcular os status e exibi-los imediatamente
    if (
      updates.type === "PC" &&
      localCharacterData?.info.type === "NPC" &&
      archetypes &&
      attributesDefinitions &&
      localCharacterData
    ) {
      console.log("🔄 Personagem convertido para PC. Recalculando status base...");
      const currentArchetype: Archetype =
        archetypes.find(
          (arch) => arch.id === localCharacterData.info.archetypeId,
        ) ||
        localCharacterData.archetype || {
          id: "none-placeholder",
          name: "None",
          hp: 0,
          mp: 0,
          tp: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        };

      const attributeIdToNameMap = attributesDefinitions.reduce<
        Record<string, string>
      >((acc, attrDef) => {
        acc[attrDef.id] = attrDef.name;
        return acc;
      }, {});

      const attributeRecord = localCharacterData.attributes.reduce<
        Record<string, number>
      >((acc, attr) => {
        const attrName = attributeIdToNameMap[attr.attributeId];
        if (attrName) {
          acc[attrName] = attr.valueBase + attr.valueInv;
        }
        return acc;
      }, {});

      const newStatusValues = calculateStatus(attributeRecord, currentArchetype);
      const updatedStatus = mapStatusValues(
        localCharacterData.status,
        newStatusValues,
      );

      newCalculatedStatus = updatedStatus;
      setPendingUpdates((prev) => ({ ...prev, status: newCalculatedStatus }));
      toast.success("Status recalculados para o tipo PC.");
    }

    // Lógica para quando o arquétipo é alterado
    if (
      updates.archetypeId !== undefined &&
      archetypes &&
      attributesDefinitions &&
      localCharacterData
    ) {
      const newArchetype = archetypes.find(
        (arch) => arch.id === updates.archetypeId,
      ) || localCharacterData.archetype; // Fallback para o arquétipo atual se o novo não for encontrado

      if (newArchetype) {
        const attributeIdToNameMap = attributesDefinitions.reduce<
          Record<string, string>
        >((acc, attrDef) => {
          acc[attrDef.id] = attrDef.name;
          return acc;
        }, {});

        const attributeRecord = localCharacterData.attributes.reduce<
          Record<string, number>
        >((acc, attr) => {
          const attrName = attributeIdToNameMap[attr.attributeId];
          if (attrName) {
            acc[attrName] = attr.valueBase + attr.valueInv;
          }
          return acc;
        }, {});

        const newStatusValues = calculateStatus(attributeRecord, newArchetype); // Use newArchetype aqui
        newCalculatedStatus = mapStatusValues(
          localCharacterData.status,
          newStatusValues,
        );
        setPendingUpdates((prev) => ({ ...prev, status: newCalculatedStatus }));
      }
    }

    setLocalCharacterData((prevData) => {
      if (!prevData) return null; // Should not happen, but keeps type safety
      return {
        ...prevData,
        info: {
          ...prevData.info,
          ...updates,
        },
        // Atualiza o status e arquétipo no estado local se eles foram recalculados
        ...(newCalculatedStatus ? { status: newCalculatedStatus } : {}),
        ...(newCalculatedArchetype ? { archetype: newCalculatedArchetype } : {}),

      };
    });
  };


  const handleAttributesUpdate = (updatedAttribute: CharacterAttribute) => {
    setPendingUpdates((prev) => {
      const existingAttributes = prev.attributes || [];
      const otherAttributes = existingAttributes.filter(
        (attr) => attr.id !== updatedAttribute.id,
      );
      return {
        ...prev,
        attributes: [...otherAttributes, updatedAttribute],
      };
    });

    setLocalCharacterData((prevData) => {
      if (!prevData) return null; // Should not happen, but keeps type safety
      const updatedAttributes = prevData.attributes.map((attr) =>
        attr.id === updatedAttribute.id ? updatedAttribute : attr,
      );
      return {
        ...prevData,
        attributes: updatedAttributes,
      };
    });
  };

  const handleStatusUpdate = (updates: Status[]) => {
    console.log("📊 Status atualizado:", updates);
    setPendingUpdates((prev) => ({ ...prev, status: updates }));

    // Atualiza o estado local para refletir na UI imediatamente
    setLocalCharacterData((prev) =>
      prev ? { ...prev, status: updates } : null,
    );
  };

  const handleTabChange = (tabId: ManagementTab) => {
    setActiveTab(tabId);
    router.push(`${pathname}?tab=${tabId}`, { scroll: false });
  };

  const handleSave = async () => {
    if (!localCharacterData || Object.keys(pendingUpdates).length === 0) return;


    try {
      const promises: Promise<AxiosResponse>[] = [];

      // 1️⃣ Atualiza personagem base
      if (pendingUpdates.info && Object.keys(pendingUpdates.info).length > 0) {
        // Sanitize the payload to send only allowed fields

        const {
          id: _charId,
          userId: _userId,
          createdAt: _createdAt,
          updatedAt: _updatedAt,
          deletedAt: _deletedAt,
          ...allowedUpdates
        } = pendingUpdates.info;

        // Ensure annotations is a string
        if (
          allowedUpdates.annotations === null ||
          allowedUpdates.annotations === undefined
        ) {
          allowedUpdates.annotations = "";
        }
        promises.push(api.put(`/characters/${id}`, allowedUpdates));
      }

      // 2️⃣ Atualiza atributos
      const attributesToUpdate = pendingUpdates.attributes || [];
      if (attributesToUpdate.length > 0) {
        for (const attribute of attributesToUpdate) {
          promises.push(
            api.put(`/characterattributes/${attribute.id}`, {
              valueBase: attribute.valueBase,
            }),
          );
        }
      }

      // 3️⃣ Atualiza status
      const statusToUpdate = pendingUpdates.status || [];
      if (statusToUpdate.length > 0) {
        for (const status of statusToUpdate) {
          promises.push(
            api.put(`/status/${status.id}`, {
              valueMax: status.valueMax,
              valueActual: status.valueActual,
            }),
          );
        }
      }

      // // 4️⃣ Atualiza inventário
      // if (pendingUpdates.inventory && pendingUpdates.inventory.length > 0) {
      //   promises.push(api.put(`/characters/${id}/inventory`, pendingUpdates.inventory));
      // }

      // // 5️⃣ Atualiza skills
      // if (pendingUpdates.skills && pendingUpdates.skills.length > 0) {
      //   promises.push(api.put(`/characters/${id}/skills`, pendingUpdates.skills));
      // }

      if (promises.length === 0) {
        console.warn("⚠️ Nenhuma atualização pendente encontrada.");
        return;
      }

      // Executa todas as atualizações em paralelo
      await Promise.all(promises);
    
      // Limpa as pendências e revalida os dados do SWR para buscar o estado mais recente do servidor
      setPendingUpdates({});
      mutate();
      toast.success("Personagem atualizado com sucesso!");
    } catch (error) {
      console.error("❌ Erro ao atualizar personagem:", error);
      toast.error("Erro ao salvar personagem.");
    }
  };

  const handleCancel = () => {
    if (originalCharacterData) {
      setLocalCharacterData(originalCharacterData);
    }
    setPendingUpdates({});
  };

  const handleAddItem = async (payload: {
    itemId: string;
    quantity: number;
  }) => {
    if (!id) {
      toast.error("Personagem não encontrado.");
      return;
    }

    try {
      setIsAddingItem(true);

      const itemDefinition = availableItems?.find(
        (item) => item.id === payload.itemId,
      );
      const targetValue = itemDefinition?.value ?? 0;

      await createCharacterInventoryItem({
        characterId: id,
        itemId: payload.itemId,
        quantity: payload.quantity,
        is_equipped: false,
        equipped_slot: EquipSlot.NONE,
        value: targetValue,
      });

      toast.success("Item adicionado ao inventário.");
      setIsAddItemOpen(false);
      await mutate();
    } catch (err) {
      console.error("Erro ao adicionar item ao inventário:", err);
      toast.error("Não foi possível adicionar o item.");
      throw err;
    } finally {
      setIsAddingItem(false);
    }
  };

  const resolveItemName = (itemId: string) =>
    availableItems?.find((item) => item.id === itemId)?.name ?? itemId;

  const handleEquipItem = (item: CharacterHasItemDTO) => {
    setItemToEquip(item);
  };

  const handleConfirmEquip = async () => {
    if (!itemToEquip) return;
    try {
      setIsUpdatingEquipment(true);
      const baseItemDefinition = availableItems?.find(
        (entry) => entry.id === itemToEquip.itemId,
      );
      const itemValue = itemToEquip.value ?? baseItemDefinition?.value ?? 0;

      if (!itemToEquip.is_equipped && itemToEquip.quantity > 1) {
        const remaining = itemToEquip.quantity - 1;

        if (remaining > 0) {
          await updateCharacterInventoryItem(itemToEquip.id, {
            quantity: remaining,
            is_equipped: false,
            equipped_slot: EquipSlot.NONE,
          });
        } else {
          await deleteCharacterInventoryItem(itemToEquip.id);
        }

        await createCharacterInventoryItem({
          characterId: id,
          itemId: itemToEquip.itemId,
          quantity: 1,
          is_equipped: true,
          equipped_slot: selectedEquipSlot,
          value: itemValue,
        });
      } else {
        await updateCharacterInventoryItem(itemToEquip.id, {
          is_equipped: true,
          equipped_slot: selectedEquipSlot,
        });
      }

      toast.success("Item equipado com sucesso.");
      setItemToEquip(null);
      setSelectedEquipSlot(EquipSlot.NONE);
      await mutate();
    } catch (err) {
      console.error("Erro ao equipar item:", err);
      toast.error("Não foi possível equipar o item.");
    } finally {
      setIsUpdatingEquipment(false);
    }
  };

  const handleUnequipItem = async (item: CharacterHasItemDTO) => {
    try {
      setIsUpdatingEquipment(true);
      await updateCharacterInventoryItem(item.id, {
        is_equipped: false,
        equipped_slot: EquipSlot.NONE,
      });
      toast.success("Equipamento removido do personagem.");
      setSelectedEquipSlot(EquipSlot.NONE);
      await mutate();
    } catch (err) {
      console.error("Erro ao remover equipamento:", err);
      toast.error("Não foi possível remover o equipamento.");
    } finally {
      setIsUpdatingEquipment(false);
    }
  };

  const handleDeleteInventoryItem = async (item: CharacterHasItemDTO) => {
    if (item.is_equipped) {
      toast.error("Desquipe o item antes de removê-lo do inventário.");
      return;
    }

    try {
      setDeletingItemId(item.id);
      await deleteCharacterInventoryItem(item.id);
      toast.success("Item removido do inventário.");
      await mutate();
    } catch (err) {
      console.error("Erro ao remover item do inventário:", err);
      toast.error("Não foi possível remover o item.");
    } finally {
      setDeletingItemId(null);
    }
  };
  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!localCharacterData) {
    return <div>Character not found</div>;
  }

  const characterData = localCharacterData;

  console.log("📝 Dados do personagem:", characterData);
  console.log("📝 Atualizações pendentes:", pendingUpdates);

  const hpStatus = characterData.status.find((s) => s.name === "HP");
  const mpStatus = characterData.status.find((s) => s.name === "MP");
  const tpStatus = characterData.status.find((s) => s.name === "TP");

  const hasPendingChanges = Object.keys(pendingUpdates).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Cabeçalho com botões de salvar/cancelar */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {characterData.info.name}
            </h1>
            <p className="text-gray-600">
              Geração {characterData.info.generation} •{" "}
              {characterData.info.race}
              {characterData.archetype && ` • ${characterData.archetype.name}`}
            </p>
          </div>

          <div className="text-right">
            <div className="flex gap-4 mt-2">
              <div className="text-red-600 font-semibold">
                HP: {hpStatus?.valueActual || 0}/{hpStatus?.valueMax || 0}
              </div>
              <div className="text-blue-600 font-semibold">
                MP: {mpStatus?.valueActual || 0}/{mpStatus?.valueMax || 0}
              </div>
              <div className="text-yellow-600 font-semibold">
                TP: {tpStatus?.valueActual || 0}/{tpStatus?.valueMax || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navegação por abas */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <nav className="flex border-b">
          {MANAGEMENT_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center px-6 py-3 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <span className="mr-2 text-lg">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Conteúdo da aba ativa */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        {activeTab === "info" && (
          <CharacterBasicInfo
            character={characterData.info}
            archetype={characterData.archetype}
            allArchetypes={archetypes ?? []}
            onUpdate={handleBasicInfoUpdate}
          />
        )}

        {activeTab === "attributes" && (
          <CharacterAttributes
            attributes={characterData.attributes}
            status={characterData.status}
            archetype={characterData.archetype}
            onAttributesUpdate={handleAttributesUpdate}
            onStatusUpdate={handleStatusUpdate}
            character={characterData.info}
          />
        )}

        {activeTab === "expertises" && (
          <CharacterExpertises
            attributes={characterData.attributes}
            onAttributesUpdate={handleAttributesUpdate}
          />
        )}

        {activeTab === "inventory" && (
          <CharacterInventoryEquipment
            inventory={characterData.inventory}
            onAddItem={() => setIsAddItemOpen(true)}
            onEquipItem={handleEquipItem}
            onUnequipItem={handleUnequipItem}
            onDeleteItem={handleDeleteInventoryItem}
            itemsCatalog={availableItems ?? []}
            isProcessingEquipment={isUpdatingEquipment}
            deletingItemId={deletingItemId}
          />
        )}
      </div>

      <AddInventoryItemDialog
        open={isAddItemOpen}
        onClose={() => setIsAddItemOpen(false)}
        items={availableItems ?? []}
        isLoadingItems={isLoadingItems}
        isSubmitting={isAddingItem}
        onSubmit={handleAddItem}
      />
      <EquipItemDialog
        open={Boolean(itemToEquip)}
        inventoryItem={itemToEquip}
        characterInventory={characterData.inventory}
        itemName={itemToEquip ? resolveItemName(itemToEquip.itemId) : undefined}
        isSubmitting={isUpdatingEquipment}
        selectedSlot={selectedEquipSlot}
        onSelectSlot={(slot) => setSelectedEquipSlot(slot)}
        onClose={() => {
          if (isUpdatingEquipment) return;
          setItemToEquip(null);
        }}
        onConfirm={handleConfirmEquip}
      />

      {/* Rodapé Fixo para Salvar/Cancelar */}
      {hasPendingChanges && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14">
              <span className="text-gray-700 font-medium">
                Você tem alterações não salvas.
              </span>
              <div className="flex gap-4">
                <button
                  onClick={handleCancel}
                  className="px-6 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão Flutuante para Visualização (aparece apenas sem alterações pendentes) */}
      {!hasPendingChanges && (
        <Link
          href={`/home`}
          title="Ver Ficha do Personagem"
          className="fixed bottom-4 right-6 bg-blue-600 text-white w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg hover:bg-blue-700 transition-transform hover:scale-110 z-40"
        >
          🏠
        </Link>
      )}
    </div>
  );
}

function mapStatusValues(
  statusList: Status[],
  newStatusValues: ReturnType<typeof calculateStatus>,
): Status[] {
  return statusList.map((s) => {
    let newMaxValue: number | undefined;
    if (s.name === "HP") newMaxValue = newStatusValues.hp;
    if (s.name === "MP") newMaxValue = newStatusValues.mp;
    if (s.name === "TP") newMaxValue = newStatusValues.tp;

    if (newMaxValue !== undefined) {
      const isAtMax = s.valueActual >= s.valueMax;
      return {
        ...s,
        valueMax: newMaxValue,
        valueActual: isAtMax ? newMaxValue : Math.min(s.valueActual, newMaxValue),
      };
    }
    return s;
  });
}
