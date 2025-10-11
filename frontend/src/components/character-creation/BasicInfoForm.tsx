import { CreateFullCharacter, GENEROS_MOCK } from "@/types/models";

interface BasicInfoFormProps {
  characterData: CreateFullCharacter;
  onDataChange: (section: "base", key: string, value: string | number) => void;
}

export default function BasicInfoForm({
  characterData,
  onDataChange,
}: BasicInfoFormProps) {
  // Funções auxiliares para converter valores null/undefined para string vazia
  const getStringValue = (value: string | null | undefined): string =>
    value || "";

  return (
    <div className="md:col-span-2 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome:</label>
        <input
          type="text"
          value={getStringValue(characterData.info.name)}
          onChange={(e) => onDataChange("base", "name", e.target.value)}
          placeholder="Ex: Kaelen"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Raça:</label>
        <input
          type="text"
          value={getStringValue(characterData.info.race)}
          onChange={(e) => onDataChange("base", "race", e.target.value)}
          placeholder="Ex: Humano"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Idade:
          </label>
          <input
            type="number"
            value={characterData.info.age || 0}
            onChange={(e) =>
              onDataChange("base", "age", parseInt(e.target.value) || 0)
            }
            placeholder="0"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Altura (cm):
          </label>
          <input
            type="number"
            value={characterData.info.height || 0}
            onChange={(e) =>
              onDataChange("base", "height", parseFloat(e.target.value) || 0)
            }
            placeholder="170"
            min="0"
            step="0.1"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gênero:
          </label>
          <select
            value={getStringValue(characterData.info.gender)}
            onChange={(e) => onDataChange("base", "gender", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>
              Selecione
            </option>
            {GENEROS_MOCK.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Anotações:
        </label>
        <textarea
          value={getStringValue(characterData.info.annotations)}
          onChange={(e) => onDataChange("base", "annotations", e.target.value)}
          placeholder="Anotações sobre o personagem..."
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
