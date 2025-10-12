import React from "react";
import { STEPS_NAMES } from "@/types/models";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({
  currentStep,
  totalSteps,
}: StepIndicatorProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      {STEPS_NAMES.map((name, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            <div
              className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors duration-300
              ${
                index === currentStep
                  ? "bg-blue-500 text-white shadow-lg"
                  : index < currentStep
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-500"
              }
            `}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span className="text-xs mt-1 text-center hidden sm:block text-gray-600">
              {name}
            </span>
          </div>
          {index < totalSteps - 1 && (
            <div
              className={`
              flex-1 h-0.5 mx-1 transition-colors duration-300
              ${index < currentStep ? "bg-green-500" : "bg-gray-300"}
            `}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
