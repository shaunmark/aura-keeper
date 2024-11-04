'use client';

import { useFirebase } from '@/context/FirebaseContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import LoadingSpinner from '@/components/LoadingSpinner';
import Popup from '@/components/Popup';

const PLANS = [
  {
    name: 'Basic',
    price: 'Free',
    auraLimit: 1000,
    features: [
      'Basic daily aura limit',
      'Standard features',
      'Community support'
    ],
    recommended: false
  },
  {
    name: 'Pro',
    price: '$9.99/month',
    auraLimit: 5000,
    features: [
      '5x daily aura limit',
      'Priority support',
      'Premium badge',
      'Extended history'
    ],
    recommended: true
  },
  {
    name: 'Enterprise',
    price: '$24.99/month',
    auraLimit: 15000,
    features: [
      '15x daily aura limit',
      'Dedicated support',
      'Custom badge',
      'API access',
      'Analytics dashboard'
    ],
    recommended: false
  }
];

export default function PlansPage() {
  const { user, loading } = useFirebase();
  const router = useRouter();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [popup, setPopup] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
  });

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    router.push('/login');
    return null;
  }

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    // This is where you'd implement the actual upgrade logic
    setPopup({
      isOpen: true,
      title: 'Coming Soon',
      message: 'Premium plans will be available soon! Stay tuned for updates.',
      type: 'info'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-6 sm:mb-8">
          <button
            onClick={handleBack}
            className="group inline-flex items-center px-3 py-2 text-sm sm:text-base text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2 group-hover:-translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18" 
              />
            </svg>
            Back
          </button>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Upgrade Your Aura Limit
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Choose the plan that best fits your needs
          </p>
        </div>

        <div className="mt-12 space-y-4 sm:mt-16 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-6 lg:max-w-4xl lg:mx-auto xl:max-w-none xl:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-lg shadow-lg divide-y divide-gray-200 bg-white
                ${plan.recommended ? 'ring-2 ring-indigo-600' : ''}`}
            >
              <div className="p-6">
                {plan.recommended && (
                  <span className="inline-flex px-4 py-1 rounded-full text-sm font-semibold tracking-wide uppercase bg-indigo-100 text-indigo-600 mb-4">
                    Recommended
                  </span>
                )}
                <h3 className="text-2xl font-semibold text-gray-900">{plan.name}</h3>
                <p className="mt-4">
                  <span className="text-4xl font-extrabold text-gray-900">{plan.price}</span>
                </p>
                <p className="mt-2 text-lg text-indigo-600 font-medium">
                  {plan.auraLimit.toLocaleString()} daily aura limit
                </p>
                <ul className="mt-6 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex">
                      <svg
                        className="flex-shrink-0 w-6 h-6 text-green-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="ml-3 text-gray-500">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(plan.name)}
                  className={`mt-8 w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white 
                    ${plan.name === 'Basic' 
                      ? 'bg-gray-600 hover:bg-gray-700' 
                      : 'bg-indigo-600 hover:bg-indigo-700'} 
                    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors`}
                >
                  {plan.name === 'Basic' ? 'Current Plan' : 'Upgrade'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Popup
        isOpen={popup.isOpen}
        title={popup.title}
        message={popup.message}
        type={popup.type}
        onClose={() => setPopup(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
} 