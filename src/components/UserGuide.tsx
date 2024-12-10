'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const guideSteps = [
    {
      title: "Welcome to the Aura System! 👋",
      description: "Aura is a community-driven reputation system where members can recognize and appreciate each other's positive contributions. Think of it as a way to measure and reward the positive impact someone has on our community.",
      icon: "✨"
    },
    {
      title: "Your Aura Status 🌟",
      description: "Your Aura score is visible on your profile and dashboard. It reflects your standing in the community based on the positive interactions and contributions you've made. The higher your Aura, the more respected you are in the community.",
      icon: "📊"
    },
    {
      title: "Viewing Other Profiles 👥",
      description: "Want to learn more about other community members? Simply click on any username to view their profile. You'll see their Aura score, contribution history, and recent activities.",
      icon: "👤"
    },
    {
      title: "Understanding the Leaderboard 🏆",
      description: "The leaderboard showcases our most valued community members. It's updated in real-time and ranks users based on their Aura scores. The top 3 users get special recognition with gold, silver, and bronze badges!",
      icon: "🏅"
    },
    {
      title: "Giving and Receiving Aura ⚡",
      description: "See someone being helpful or making great contributions? You can increase their Aura by clicking the '+' button on their profile. Remember, Aura should be given based on genuine positive contributions to maintain a healthy community.",
      icon: "🎁"
    },
    {
      title: "Daily Limits ⏰",
      description: "To keep the system fair and prevent misuse, there's a daily limit on how much Aura you can give or receive. This ensures that Aura scores genuinely reflect consistent positive contributions rather than one-time actions.",
      icon: "⚖️"
    }
  ];

  const handleNext = () => {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
      setCurrentStep(0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto bg-white rounded-xl shadow-xl">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gray-100">
          <div 
            className="h-full bg-indigo-600 transition-all duration-300 ease-in-out"
            style={{ width: `${((currentStep + 1) / guideSteps.length) * 100}%` }}
          />
        </div>

        <div className="pt-6">
          <div className="mb-6 text-center">
            <span className="inline-block text-4xl mb-2">
              {guideSteps[currentStep].icon}
            </span>
          </div>

          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-gray-900 text-center">
              {guideSteps[currentStep].title}
            </DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-gray-600 text-center">
              {guideSteps[currentStep].description}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="flex flex-col space-y-4 mt-8">
          <div className="flex items-center justify-center space-x-2">
            {guideSteps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'w-4 bg-indigo-600' 
                    : 'w-2 bg-gray-200'
                }`}
              />
            ))}
          </div>

          <DialogFooter className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm font-medium transition-colors"
            >
              Previous
            </Button>
            
            <span className="text-sm text-gray-500 font-medium">
              {currentStep + 1} of {guideSteps.length}
            </span>
            
            <Button
              onClick={handleNext}
              className="px-4 py-2 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
            >
              {currentStep === guideSteps.length - 1 ? "Get Started" : "Next"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UserGuide; 