import { useMemo } from "react";
import { CreateFullCharacter, Attributes } from "@/types/models";

interface StepThreeProps {
  characterData: CreateFullCharacter;
  allExpertises: Attributes[];
  onExpertiseChange: (expertiseId: string, value: number) => void;
  totalPoints: number;
}

export default function StepFour({
  characterData,
  allExpertises,
  onExpertiseChange,
  totalPoints,
}: StepThreeProps) {
  const distributedPoints = useMemo(
    () =>
      characterData.expertises.reduce(
        (sum, exp) => sum + (exp.valueBase || 0),
        0,
      ),
    [characterData.expertises],
  );

  const remainingPoints = totalPoints - distributedPoints;

  const handleIncrement = (expertiseId: string, currentValue: number) => {
    if (remainingPoints > 0 && currentValue < 3) {
      onExpertiseChange(expertiseId, currentValue + 1);
    }
  };

  const handleDecrement = (expertiseId: string, currentValue: number) => {
    if (currentValue > 0) {
      onExpertiseChange(expertiseId, currentValue - 1);
    }
  };

  return (
    <div className="p-4 border border-green-200 rounded-lg bg-green-50 h-full">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-xl text-green-700 flex items-center">
          <span className="mr-2">🧠</span> Distribua suas Perícias
        </h3>
        <div className="text-right">
          <div className="font-bold text-lg text-green-800">
            {remainingPoints}
          </div>
          <div className="text-sm text-gray-600">Pontos Restantes</div>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Você tem <strong>{totalPoints}</strong> pontos para distribuir entre as
        perícias. Cada perícia pode ter no máximo <strong>3</strong> pontos.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {allExpertises
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((expertise) => {
            const charExpertise = characterData.expertises.find(
              (e) => e.attributeId === expertise.id,
            );
            const currentValue = charExpertise?.valueBase || 0;

            return (
              <div
                key={expertise.id}
                className="flex items-center justify-between bg-white p-3 rounded-md shadow-sm"
              >
                <label className="text-sm font-semibold text-gray-700">
                  {expertise.name}:
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecrement(expertise.id, currentValue)}
                    disabled={currentValue === 0}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-lg font-bold">
                    {currentValue}
                  </span>
                  <button
                    onClick={() => handleIncrement(expertise.id, currentValue)}
                    disabled={remainingPoints === 0 || currentValue >= 3}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
}
