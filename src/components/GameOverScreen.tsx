import React from 'react';
import { Sparkles, Home, RotateCcw } from 'lucide-react';
import AvatarDisplay from './AvatarDisplay';

interface Player {
  id: string;
  name: string;
  avatar: {
    eyes: string;
    mouth: string;
    color: string;
    accessory: string;
    eyebrows: string;
  };
  score: number;
  isDrawing: boolean;
}

interface GameOverScreenProps {
  players: Player[];
  onPlayAgain: () => void;
  onExit: () => void;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ players, onPlayAgain, onExit }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winner = sortedPlayers[0];
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full text-center">
        <div className="mb-6">
          <Sparkles size={48} className="text-yellow-500 mx-auto mb-2" />
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Game Over!</h2>
        </div>
        
        {winner && (
          <div className="mb-6">
            <p className="text-lg text-gray-600 mb-2">Winner</p>
            <div className="flex items-center justify-center mt-2">
              <AvatarDisplay 
                avatar={winner.avatar} 
                size="medium" 
                animate={true}
                className="animate-pulse-glow"
              />
              <div className="text-xl font-bold text-gray-800 ml-3">{winner.name}</div>
            </div>
            <div className="text-3xl font-bold text-purple-600 mt-2">
              {winner.score} points
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3 text-gray-800">Final Rankings</h3>
          <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto">
            {sortedPlayers.map((player, index) => (
              <div key={player.id} className="flex items-center justify-between py-2 border-b last:border-b-0 border-gray-200">
                <div className="flex items-center">
                  <div className="w-6 text-center font-bold text-gray-600 mr-3">
                    {index + 1}
                  </div>
                  <AvatarDisplay 
                    avatar={player.avatar} 
                    size="small" 
                    animate={index < 3}
                  />
                  <div className="font-medium text-gray-800 ml-3">{player.name}</div>
                </div>
                <div className="font-bold text-gray-800">{player.score}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={onPlayAgain}
            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <RotateCcw size={20} className="mr-2" />
            Play Again
          </button>
          <button
            onClick={onExit}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Home size={20} className="mr-2" />
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameOverScreen;