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
    if (timeLeft <= 0 && !selectedWord && words.length > 0) {
      handleWordSelect(words[0]);
    }
  }, [timeLeft, selectedWord, words]);

  const handleWordSelect = (word: string) => {
    if (selectedWord) return;
    setSelectedWord(word);
    onWordSelect(word);
  };

  if (words.length === 0) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-200">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Choose Your Word</h2>
          <p className="text-gray-600 mb-4">Pick a word to draw for other players</p>
          <div className="flex items-center justify-center text-orange-600 bg-orange-50 rounded-full px-4 py-2 inline-flex">
            <Clock size={20} className="mr-2" />
            <span className="font-mono text-xl font-bold">{timeLeft}s</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {words.map((word, index) => (
            <button
              key={word}
              onClick={() => handleWordSelect(word)}
              className={`w-full p-4 text-lg font-semibold rounded-xl transition-all duration-200 border-2 transform ${
                selectedWord === word
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600 scale-105 shadow-lg'
                  : selectedWord
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-50'
                    : 'bg-white hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 hover:text-purple-700 border-gray-200 hover:border-purple-300 hover:scale-102 shadow-sm hover:shadow-md'
              }`}
              disabled={!!selectedWord}
            >
              <div className="flex items-center justify-between">
                <span>{word}</span>
                <span className="text-sm opacity-70">
                  {word.length} letter{word.length !== 1 ? 's' : ''}
                </span>
              </div>
            </button>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          {selectedWord ? (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg border border-green-200">
              <span className="font-semibold">Word selected: {selectedWord}</span>
            </div>
          ) : timeLeft > 0 ? (
            <p className="text-gray-500 text-sm">
              Choose quickly! Time is running out.
            </p>
          ) : (
            <div className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg border border-orange-200">
              <span className="font-semibold">Time's up! Auto-selecting first word...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WordSelection;