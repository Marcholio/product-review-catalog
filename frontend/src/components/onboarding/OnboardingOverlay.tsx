import React from 'react';
import { useOnboarding } from '../../contexts/OnboardingContext';
import { OnboardingTooltip } from './OnboardingTooltip';
import { OnboardingHighlight } from './OnboardingHighlight';

export const OnboardingOverlay: React.FC = () => {
  const {
    isOnboarding,
    currentStep,
    totalSteps,
    currentStepData,
    nextStep,
    prevStep,
    skipOnboarding,
  } = useOnboarding();

  // Don't render anything if not in onboarding mode or no current step
  if (!isOnboarding || !currentStepData) {
    return null;
  }

  return (
    <>
      {/* Semi-transparent overlay to focus attention on highlights */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-30 pointer-events-none"
        aria-hidden="true"
      />
      
      {/* Highlight the target element */}
      <OnboardingHighlight targetSelector={currentStepData.target} />
      
      {/* Tooltip with step information */}
      <OnboardingTooltip
        step={currentStepData}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={nextStep}
        onPrev={prevStep}
        onSkip={skipOnboarding}
      />
    </>
  );
};

export default OnboardingOverlay;