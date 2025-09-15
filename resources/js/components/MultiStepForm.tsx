import React from 'react';

interface Step {
    id: number;
    name: string;
    description: string;
}

interface MultiStepFormProps {
    steps: Step[];
    currentStep: number;
    onStepChange: (step: number) => void;
    canProceedToStep: (step: number) => boolean;
    children: React.ReactNode;
}

export default function MultiStepForm({ steps, currentStep, onStepChange, canProceedToStep, children }: MultiStepFormProps) {
    const currentStepInfo = steps[currentStep - 1];
    const nextStepInfo = steps[currentStep];

    return (
        <div>
            {/* Simplified Step Progress */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">You are here</p>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {currentStepInfo?.name}
                        </h3>
                    </div>

                    {nextStepInfo && (
                        <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Next</p>
                            <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                                <span>{nextStepInfo.name}</span>
                                <svg className="h-4 w-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                    <div className="bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentStep / steps.length) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                        <span>Step {currentStep} of {steps.length}</span>
                        <span>{Math.round((currentStep / steps.length) * 100)}% complete</span>
                    </div>
                </div>
            </div>

            {/* Form Content */}
            {children}
        </div>
    );
}