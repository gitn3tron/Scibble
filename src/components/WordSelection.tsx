import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface WordSelectionProps {
  words: string[];
  timeLeft: number;
  onWordSelect: (word: string) => void;
}

const WordSelection: React.FC<WordSelectionProps> = ({ words, timeLeft, onWordSelect }) => {
  const [selectedWord, setSelectedWord] = useState<string>('');

  useEffect(() => {
    // Auto-select first word if time runs out
    if (timeLeft <= 0 && !selectedWord && words.length > 0) {
      handleWordSelect(words[0]);
    }
  }, [timeLeft, selectedWord, words]);

  const handleWordSelect = (word: string) => {
    if (selectedWord) return; // Prevent multiple selections
    setSelectedWord(word);
    onWordSelect(word);
  };

  if (words.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose a Word to Draw</h2>
          <div className="flex items-center justify-center text-orange-600">
            <Clock size={20} className="mr-2" />
            <span className="font-mono text-lg">{timeLeft}s</span>
          </div>
        </div>
        
        <div className="space-y-3">
          {words.map((word, index) => (
            <button
              key={word}
              onClick={() => handleWordSelect(word)}
              className={`w-full p-4 text-lg font-medium rounded-lg transition-colors border-2 ${
                selectedWord === word
                  ? 'bg-purple-600 text-white border-purple-600'
                  : selectedWord
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-gray-100 hover:bg-purple-100 hover:text-purple-700 border-transparent hover:border-purple-300'
              }`}
              disabled={!!selectedWord}
            >
              {word}
            </button>
          ))}
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          {selectedWord ? (
            `Word selected: ${selectedWord}`
          ) : timeLeft > 0 ? (
            "Choose quickly! Time is running out."
          ) : (
            "Time's up! Auto-selecting first word..."
          )}
        </div>
      </div>
    </div>
  );
};

export default WordSelection;