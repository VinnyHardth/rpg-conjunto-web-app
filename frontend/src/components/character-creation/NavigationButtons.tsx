interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  onFinish: () => void;
}

export default function NavigationButtons({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  onFinish,
}: NavigationButtonsProps) {
  return (
    <div className="flex justify-between mt-6">
      <button
        onClick={onBack}
        disabled={currentStep === 0}
        className={`
          px-6 py-2 rounded-lg font-semibold transition-all
          ${
            currentStep === 0
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
          }
        `}
      >
        Anterior
      </button>

      {currentStep < totalSteps - 1 ? (
        <button
          onClick={onNext}
          className="bg-blue-600 text-white px-8 py-2 rounded-lg font-semibold hover:bg-blue-700 shadow-md transition-colors"
        >
          Próximo Passo
        </button>
      ) : (
        <button
          onClick={onFinish}
          className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 shadow-xl transition-colors transform hover:scale-[1.02]"
        >
          Finalizar Criação
        </button>
      )}
    </div>
  );
}
