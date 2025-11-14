import { Attributes } from "@/types/models";

interface AttributeInputsProps {
  attributeKeys: string[];
  attributes: Attributes[];
  getAttributeValue: (attributeName: string) => number;
  onAttributeChange: (attributeId: string, value: number | string) => void;
  disabled?: boolean;
}

export default function AttributeInputs({
  attributeKeys,
  attributes,
  getAttributeValue,
  onAttributeChange,
  disabled = false,
}: AttributeInputsProps) {
  const handleInputChange = (attrKey: string, value: string) => {
    // Encontra o atributo correspondente na lista completa para obter o ID
    const attribute = attributes.find((attr) => attr.name === attrKey);
    if (attribute) {
      onAttributeChange(attribute.id, parseInt(value) || 0);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {attributeKeys.map((attrKey) => (
        <div
          key={attrKey}
          className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
        >
          <label className="text-sm font-semibold text-gray-700">
            {attrKey}:
          </label>
          <input
            type="number"
            value={getAttributeValue(attrKey) || ""}
            onChange={(e) => handleInputChange(attrKey, e.target.value)}
            placeholder="0"
            min="0"
            disabled={disabled}
            className="w-16 rounded-md border-gray-300 shadow-sm p-1 border focus:border-indigo-500 focus:ring-indigo-500 text-center text-lg font-bold disabled:bg-gray-200 disabled:cursor-not-allowed"
          />
        </div>
      ))}
    </div>
  );
}
