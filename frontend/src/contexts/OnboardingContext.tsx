import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

// Define onboarding steps
export type OnboardingStep = {
  id: string;
  title: string;
  content: string;
  target: string; // CSS selector for the element to highlight
  position: 'top' | 'right' | 'bottom' | 'left' | 'center';
  requiredPath?: string; // Optional: only show this step on a specific path
  requiredAuth?: boolean; // Optional: only show this step if user is authenticated
};

// Define different onboarding flows
export type OnboardingFlow = {
  id: string;
  name: string;
  steps: OnboardingStep[];
};

export interface OnboardingContextType {
  isOnboarding: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: OnboardingStep | null;
  startOnboarding: (flowId?: string) => void;
  endOnboarding: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipOnboarding: () => void;
  goToStep: (stepIndex: number) => void;
}

// Create context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Define the default onboarding flows
const defaultFlows: OnboardingFlow[] = [
  {
    id: 'main',
    name: 'Main Onboarding',
    steps: [
      {
        id: 'welcome',
        title: 'Welcome to Product Catalog!',
        content: 'This quick tour will show you how to use the main features of our application.',
        target: 'body',
        position: 'center',
      },
      {
        id: 'productSearch',
        title: 'Find Products',
        content: 'Search for products by name or description using this search bar.',
        target: '#onboarding-search-input',
        position: 'bottom',
      },
      {
        id: 'sortBy',
        title: 'Sort Products',
        content: 'Sort products by newest, price, rating, or popularity.',
        target: '#onboarding-sort-container',
        position: 'bottom',
      },
      {
        id: 'categories',
        title: 'Filter by Category',
        content: 'Filter products by selecting a specific category.',
        target: '#onboarding-category-container',
        position: 'bottom',
      },
      {
        id: 'priceRange',
        title: 'Set Price Range',
        content: 'Adjust the price slider to find products within your budget.',
        target: '#onboarding-price-range-container',
        position: 'top',
      },
      {
        id: 'products',
        title: 'Browse Products',
        content: 'Browse through our product catalog. Click on any product to see more details.',
        target: '#onboarding-product-grid',
        position: 'top',
      },
      {
        id: 'pagination',
        title: 'Navigate Pages',
        content: 'Use these controls to navigate between pages of products.',
        target: '#onboarding-pagination',
        position: 'top',
      },
      {
        id: 'auth',
        title: 'Sign In or Register',
        content: 'Create an account to save your favorite products to a wishlist and leave reviews.',
        target: 'a[href="/auth"]',
        position: 'left',
        requiredAuth: false,
      },
    ],
  },
  {
    id: 'product-details',
    name: 'Product Details',
    steps: [
      {
        id: 'product-info',
        title: 'Product Information',
        content: 'Here you can see all the details about the product, including description, price, and rating.',
        target: '#onboarding-product-info',
        position: 'center',
        requiredPath: '/products',
      },
      {
        id: 'product-image',
        title: 'Product Image',
        content: 'View high-quality images of the product to better understand its appearance.',
        target: '#onboarding-product-image-container',
        position: 'right',
        requiredPath: '/products',
      },
      {
        id: 'product-rating',
        title: 'Product Rating',
        content: 'See how other customers have rated this product.',
        target: '#onboarding-product-rating',
        position: 'bottom',
        requiredPath: '/products',
      },
      {
        id: 'wishlist-btn',
        title: 'Add to Wishlist',
        content: 'Click this button to save the product to your wishlist for later.',
        target: '#onboarding-wishlist-button',
        position: 'left',
        requiredPath: '/products',
        requiredAuth: true,
      },
      {
        id: 'reviews',
        title: 'Customer Reviews',
        content: 'Read what other customers think about this product.',
        target: '#reviews',
        position: 'top',
        requiredPath: '/products',
      },
      {
        id: 'write-review',
        title: 'Write a Review',
        content: 'Share your own experience with this product by writing a review.',
        target: '#review-form',
        position: 'top',
        requiredPath: '/products',
        requiredAuth: true,
      },
    ],
  },
  {
    id: 'wishlist',
    name: 'Wishlist',
    steps: [
      {
        id: 'wishlist-intro',
        title: 'Your Wishlist',
        content: 'This is your wishlist where you can keep track of products you\'re interested in.',
        target: 'h1',
        position: 'bottom',
        requiredPath: '/wishlist',
        requiredAuth: true,
      },
      {
        id: 'wishlist-items',
        title: 'Wishlist Items',
        content: 'Click on a product to view its details or remove items from your wishlist.',
        target: '.grid',
        position: 'top',
        requiredPath: '/wishlist',
        requiredAuth: true,
      },
    ],
  },
];

// Provider component
export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [flows] = useState<OnboardingFlow[]>(defaultFlows);
  const [activeFlow, setActiveFlow] = useState<OnboardingFlow | null>(null);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [shownOnboarding, setShownOnboarding] = useState(false);
  
  const location = useLocation();
  const { user } = useAuth();

  // Check localStorage on mount to see if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('onboardingCompleted') === 'true';
    setShownOnboarding(hasCompletedOnboarding);
    
    // Auto-start onboarding for first-time visitors
    if (!hasCompletedOnboarding && !isOnboarding) {
      // Slight delay to ensure the app is fully loaded
      const timer = setTimeout(() => {
        startOnboarding('main');
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  // Filter steps based on current path and auth status
  const getFilteredSteps = (flow: OnboardingFlow): OnboardingStep[] => {
    return flow.steps.filter(step => {
      // Skip steps that require a specific path if we're not on that path
      if (step.requiredPath && !location.pathname.includes(step.requiredPath)) {
        return false;
      }
      
      // Skip steps that require authentication if user is not logged in
      if (step.requiredAuth === true && !user) {
        return false;
      }
      
      // Skip steps that require no authentication if user is logged in
      if (step.requiredAuth === false && user) {
        return false;
      }
      
      return true;
    });
  };

  // Get current step data
  const getCurrentStepData = (): OnboardingStep | null => {
    if (!activeFlow) return null;
    
    const filteredSteps = getFilteredSteps(activeFlow);
    return currentStep < filteredSteps.length ? filteredSteps[currentStep] : null;
  };

  // Start onboarding with a specific flow
  const startOnboarding = (flowId: string = 'main') => {
    const flow = flows.find(f => f.id === flowId) || flows[0];
    setActiveFlow(flow);
    setCurrentStep(0);
    setIsOnboarding(true);
  };

  // End onboarding
  const endOnboarding = () => {
    setIsOnboarding(false);
    setActiveFlow(null);
    localStorage.setItem('onboardingCompleted', 'true');
  };

  // Skip onboarding entirely
  const skipOnboarding = () => {
    endOnboarding();
  };

  // Go to next step
  const nextStep = () => {
    if (!activeFlow) return;
    
    const filteredSteps = getFilteredSteps(activeFlow);
    
    if (currentStep < filteredSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      endOnboarding();
    }
  };

  // Go to previous step
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Go to a specific step
  const goToStep = (stepIndex: number) => {
    if (!activeFlow) return;
    
    const filteredSteps = getFilteredSteps(activeFlow);
    
    if (stepIndex >= 0 && stepIndex < filteredSteps.length) {
      setCurrentStep(stepIndex);
    }
  };

  // Get total steps
  const totalSteps = activeFlow ? getFilteredSteps(activeFlow).length : 0;
  const currentStepData = getCurrentStepData();

  return (
    <OnboardingContext.Provider
      value={{
        isOnboarding,
        currentStep,
        totalSteps,
        currentStepData,
        startOnboarding,
        endOnboarding,
        nextStep,
        prevStep,
        skipOnboarding,
        goToStep,
      }}
    >
      {children}
    </OnboardingContext.Provider>
  );
};

// Hook for using the onboarding context
export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};