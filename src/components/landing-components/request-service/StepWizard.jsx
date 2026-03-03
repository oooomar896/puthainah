import React from 'react';
import { Check } from 'lucide-react';

const StepWizard = ({ currentStep, steps }) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 -z-10 rounded"></div>
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-primary -z-10 rounded transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>

        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;

          return (
            <div key={step.id} className="flex flex-col items-center gap-2 bg-white px-2">
              <div
                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 z-10
                  ${isCompleted ? 'bg-primary border-primary text-white' :
                    isCurrent ? 'bg-white border-primary text-primary shadow-md scale-110' :
                      'bg-white border-gray-300 text-gray-400'}`}
              >
                {isCompleted ? <Check size={16} /> : <span className="text-xs md:text-sm">{stepNumber}</span>}
              </div>
              <span className={`text-[10px] md:text-sm font-medium text-center transition-all duration-300
                ${isCurrent ? 'text-primary block' : 'text-gray-500 hidden md:block'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepWizard;
