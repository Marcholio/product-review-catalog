import React, { useEffect, useState } from 'react';

interface OnboardingHighlightProps {
  targetSelector: string;
}

export const OnboardingHighlight: React.FC<OnboardingHighlightProps> = ({
  targetSelector,
}) => {
  const [highlightStyle, setHighlightStyle] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Skip if we're targeting the body element (no highlighting needed)
    if (targetSelector === 'body') {
      setVisible(false);
      return;
    }

    const updateHighlightPosition = () => {
      try {
        const targetElement = document.querySelector(targetSelector);
        if (!targetElement) {
          console.warn(`Target element not found: ${targetSelector}`);
          setVisible(false);
          return;
        }

        const rect = targetElement.getBoundingClientRect();
        setHighlightStyle({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        });
        setVisible(true);
      } catch (error) {
        console.error('Error setting highlight position:', error);
        setVisible(false);
      }
    };

    // Initial position
    updateHighlightPosition();

    // Update on scroll or resize
    window.addEventListener('scroll', updateHighlightPosition);
    window.addEventListener('resize', updateHighlightPosition);

    return () => {
      window.removeEventListener('scroll', updateHighlightPosition);
      window.removeEventListener('resize', updateHighlightPosition);
    };
  }, [targetSelector]);

  if (!visible) return null;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        top: `${highlightStyle.top}px`,
        left: `${highlightStyle.left}px`,
        width: `${highlightStyle.width}px`,
        height: `${highlightStyle.height}px`,
        boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)',
        borderRadius: '4px',
        zIndex: 40,
      }}
    />
  );
};

export default OnboardingHighlight;