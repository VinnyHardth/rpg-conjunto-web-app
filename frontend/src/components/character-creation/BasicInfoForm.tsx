import { CharacterData, GENEROS_MOCK } from "@/types/character";

interface BasicInfoFormProps {
  characterData: CharacterData;
  onDataChange: (section: "base", key: string, value: string | number) => void;
}

export default function BasicInfoForm({ characterData, onDataChange }: BasicInfoFormProps) {
  return (
    <div className="md:col-span-2 space-y-3">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nome:</label>
        <input
          type="text"
          value={characterData.nome}
          onChange={(e) => onDataChange("base", "nome", e.target.value)}
          placeholder="Ex: Kaelen"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Raça:</label>
        <input
          type="text"
          value={characterData.raca}
          onChange={(e) => onDataChange("base", "raca", e.target.value)}
          placeholder="Ex: Humano"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700">Idade:</label>
          <input
            type="number"
            value={characterData.idade}
            onChange={(e) => onDataChange("base", "idade", parseInt(e.target.value) || "")}
            placeholder="0"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Altura (cm):</label>
          <input
            type="number"
            value={characterData.altura}
            onChange={(e) => onDataChange("base", "altura", parseInt(e.target.value) || "")}
            placeholder="170"
            min="0"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gênero:</label>
          <select
            value={characterData.genero}
            onChange={(e) => onDataChange("base", "genero", e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border focus:border-blue-500 focus:ring-blue-500 bg-white"
          >
            <option value="" disabled>Selecione</option>
            {GENEROS_MOCK.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}