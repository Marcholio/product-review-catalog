import React, { useEffect, useState } from 'react';
import type { OnboardingStep } from '../../contexts/OnboardingContext';
import { FiX, FiArrowRight, FiArrowLeft } from 'react-icons/fi';
import Button from '../ui/Button';

interface OnboardingTooltipProps {
  step: OnboardingStep;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  step,
  currentStep,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [arrowPosition, setArrowPosition] = useState('');
  const [visible, setVisible] = useState(false);

  // Calculate position based on target element and position prop
  useEffect(() => {
    const calculatePosition = () => {
      if (step.target === 'body' || step.position === 'center') {
        // Center in the viewport
        setPosition({
          top: window.innerHeight / 2 - 150,
          left: window.innerWidth / 2 - 175,
        });
        setArrowPosition('');
        setVisible(true);
        return;
      }

      const targetElement = document.querySelector(step.target);
      if (!targetElement) {
        console.error(`Target element not found: ${step.target}`);
        setVisible(false);
        return;
      }

      const rect = targetElement.getBoundingClientRect();
      const tooltipWidth = 350;
      const tooltipHeight = 200;
      const margin = 20;

      let newTop = 0;
      let newLeft = 0;
      let newArrowPosition = '';

      switch (step.position) {
        case 'top':
          newTop = rect.top - tooltipHeight - margin;
          newLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          newArrowPosition = 'bottom';
          break;
        case 'right':
          newTop = rect.top + rect.height / 2 - tooltipHeight / 2;
          newLeft = rect.right + margin;
          newArrowPosition = 'left';
          break;
        case 'bottom':
          newTop = rect.bottom + margin;
          newLeft = rect.left + rect.width / 2 - tooltipWidth / 2;
          newArrowPosition = 'top';
          break;
        case 'left':
          newTop = rect.top + rect.height / 2 - tooltipHeight / 2;
          newLeft = rect.left - tooltipWidth - margin;
          newArrowPosition = 'right';
          break;
      }

      // Adjust if tooltip would go off screen
      if (newLeft < 10) newLeft = 10;
      if (newLeft + tooltipWidth > window.innerWidth - 10) {
        newLeft = window.innerWidth - tooltipWidth - 10;
      }
      if (newTop < 10) newTop = 10;
      if (newTop + tooltipHeight > window.innerHeight - 10) {
        newTop = window.innerHeight - tooltipHeight - 10;
      }

      setPosition({ top: newTop, left: newLeft });
      setArrowPosition(newArrowPosition);
      setVisible(true);
    };

    calculatePosition();

    // Recalculate on resize
    window.addEventListener('resize', calculatePosition);
    return () => window.removeEventListener('resize', calculatePosition);
  }, [step]);

  if (!visible) return null;

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-blue-100 p-4 w-[350px]"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {/* Arrow based on position */}
      {arrowPosition && (
        <div
          className={`absolute w-4 h-4 bg-white border-t border-l border-blue-100 transform rotate-45 ${
            arrowPosition === 'top' ? 'top-[-8px] left-1/2 ml-[-8px] border-r-0 border-b-0' :
            arrowPosition === 'right' ? 'top-1/2 right-[-8px] mt-[-8px] border-l-0 border-b-0' :
            arrowPosition === 'bottom' ? 'bottom-[-8px] left-1/2 ml-[-8px] border-t-0 border-r-0' :
            'top-1/2 left-[-8px] mt-[-8px] border-r-0 border-b-0'
          }`}
        />
      )}

      {/* Title and close button */}
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold text-blue-600">{step.title}</h3>
        <Button 
          onClick={onSkip}
          variant="link"
          size="sm"
          className="p-0"
          aria-label="Skip onboarding"
        >
          <FiX className="w-5 h-5" />
        </Button>
      </div>

      {/* Content */}
      <div className="text-gray-600 mb-4">
        {step.content}
      </div>

      {/* Step indicator and navigation */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-500">
          Step {currentStep + 1} of {totalSteps}
        </div>
        <div className="flex gap-2">
          {currentStep > 0 && (
            <Button
              onClick={onPrev}
              variant="outline"
              size="sm"
              leftIcon={<FiArrowLeft size={16} />}
            >
              Previous
            </Button>
          )}
          <Button
            onClick={onNext}
            variant="primary"
            size="sm"
            rightIcon={currentStep < totalSteps - 1 ? <FiArrowRight size={16} /> : undefined}
          >
            {currentStep === totalSteps - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTooltip;