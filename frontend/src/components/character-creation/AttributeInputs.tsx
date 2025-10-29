interface AttributeInputsProps {
  attributeKeys: string[];
  getAttributeValue: (attributeName: string) => number;
  onAttributeChange: (attribute: string, value: number | string) => void;
}

export default function AttributeInputs({
  attributeKeys,
  getAttributeValue,
  onAttributeChange,
}: AttributeInputsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {attributeKeys.map((attr) => (
        <div
          key={attr}
          className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
        >
          <label className="text-sm font-semibold text-gray-700">{attr}:</label>
          <input
            type="number"
            value={getAttributeValue(attr) || ""}
            onChange={(e) =>
              onAttributeChange(attr, parseInt(e.target.value) || 0)
            }
            placeholder="0"
            min="0"
            className="w-16 rounded-md border-gray-300 shadow-sm p-1 border focus:border-indigo-500 focus:ring-indigo-500 text-center text-lg font-bold"
          />
        </div>
      ))}
    </div>
  );
}
