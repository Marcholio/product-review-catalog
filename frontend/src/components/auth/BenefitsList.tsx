import React from 'react';

interface BenefitsListProps {
  title: string;
  items: string[];
}

const BenefitsList: React.FC<BenefitsListProps> = ({ title, items }) => {
  return (
    <div className="bg-blue-500/30 p-6 rounded-lg">
      <p style={{color: 'white !important'}} className="text-lg font-medium mb-2">{title}</p>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-start">
            <svg style={{color: '#93c5fd !important'}} className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span style={{color: '#dbeafe !important'}}>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default BenefitsList;