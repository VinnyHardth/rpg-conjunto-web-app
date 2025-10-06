import { CharacterData, DerivedStats } from "@/types/character";

interface StepThreeProps {
  characterData: CharacterData;
  derivedStats: DerivedStats;
}

export default function StepThree({ characterData, derivedStats }: StepThreeProps) {
  return (
    <div className="text-center p-8 bg-gray-50 rounded-lg shadow-inner">
      <h3 className="text-3xl font-extrabold text-green-700 mb-2">
        Personagem Quase Pronto! 🎉
      </h3>
      <p className="text-lg text-gray-600 mb-6">
        Confirme os detalhes finais antes de criar seu personagem.
      </p>
      <div className="inline-block text-left p-6 bg-white border border-gray-200 rounded-xl shadow-lg">
        <h4 className="font-bold text-xl text-gray-800 border-b pb-2 mb-4">
          Estatísticas Finais:
        </h4>
        <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-base">
          <div><span className="font-semibold">Nome:</span> {characterData.nome || "—"}</div>
          <div><span className="font-semibold">Raça:</span> {characterData.raca || "—"}</div>
          <div><span className="font-semibold text-red-600">HP Máximo:</span> <span className="font-bold">{derivedStats.hp}</span></div>
          <div><span className="font-semibold text-blue-600">MP Máximo:</span> <span className="font-bold">{derivedStats.mp}</span></div>
          <div><span className="font-semibold text-yellow-600">TP Máximo:</span> <span className="font-bold">{derivedStats.tp}</span></div>
          <div><span className="font-semibold text-green-600">Movimento:</span> <span className="font-bold">{derivedStats.mov}m</span></div>
        </div>
      </div>
      <p className="text-sm text-gray-500 mt-6">
        Se precisar ajustar algo, clique em Anterior.
      </p>
    </div>
  );
}