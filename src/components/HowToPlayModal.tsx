import React, { useState, useEffect } from 'react';
import { X, Play, Palette, MessageCircle, Trophy, Users, Clock, Lightbulb } from 'lucide-react';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const steps = [
    {
      icon: <Users className="w-12 h-12 text-purple-600" />,
      title: "Join or Create a Room",
      description: "Create a new game room or join an existing one with a room code. Invite your friends to play together!",
      animation: "🏠"
    },
    {
      icon: <Play className="w-12 h-12 text-green-600" />,
      title: "Start the Game",
      description: "Once everyone has joined, the host can start the game. Players take turns drawing and guessing.",
      animation: "🎮"
    },
    {
      icon: <Palette className="w-12 h-12 text-blue-600" />,
      title: "Draw Your Word",
      description: "When it's your turn, choose from 3 words and draw it! Use different colors, brush sizes, and tools.",
      animation: "🎨"
    },
    {
      icon: <MessageCircle className="w-12 h-12 text-orange-600" />,
      title: "Guess the Drawing",
      description: "Type your guesses in the chat! The faster you guess correctly, the more points you earn.",
      animation: "💭"
    },
    {
      icon: <Lightbulb className="w-12 h-12 text-yellow-600" />,
      title: "Get Hints",
      description: "Stuck? Don't worry! Hints will reveal letters of the word as time passes.",
      animation: "💡"
    },
    {
      icon: <Trophy className="w-12 h-12 text-gold-600" />,
      title: "Win Points & Have Fun!",
      description: "Earn points for correct guesses and good drawings. The player with the most points wins!",
      animation: "🏆"
    }
  ];

  useEffect(() => {
    if (isOpen) {
      const interval = setInterval(() => {
        setIsAnimating(true);
        setTimeout(() => {
          setCurrentStep((prev) => (prev + 1) % steps.length);
          setIsAnimating(false);
        }, 300);
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [isOpen, steps.length]);

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <X size={24} />
          </button>
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-2">How to Play</h2>
            <p className="text-purple-100">Scribble Draw & Guess Game</p>
            <div className="mt-4 text-sm bg-white/20 rounded-full px-4 py-2 inline-block">
              Created by <span className="font-bold">Mohammad Abir Hayat</span> 🎨
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="text-center mb-8">
            <div className={`transition-all duration-300 ${isAnimating ? 'scale-75 opacity-50' : 'scale-100 opacity-100'}`}>
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 rounded-full p-4">
                  {currentStepData.icon}
                </div>
              </div>
              <div className="text-6xl mb-4 animate-bounce">
                {currentStepData.animation}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {currentStepData.title}
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed max-w-md mx-auto">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Step Indicators */}
          <div className="flex justify-center space-x-2 mb-8">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep 
                    ? 'bg-purple-600 scale-125' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>

          {/* Game Features */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800">Timed Rounds</h4>
              <p className="text-sm text-gray-600">Fast-paced drawing and guessing</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800">Multiplayer Fun</h4>
              <p className="text-sm text-gray-600">Play with friends online</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Trophy className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800">Scoring System</h4>
              <p className="text-sm text-gray-600">Earn points for speed and accuracy</p>
            </div>
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <Palette className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <h4 className="font-semibold text-gray-800">Drawing Tools</h4>
              <p className="text-sm text-gray-600">Colors, brushes, and more</p>
            </div>
          </div>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center mx-auto"
            >
              <Play size={20} className="mr-2" />
              Got It! Let's Play
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowToPlayModal;