import React from 'react';
import { Sparkles, Home, RotateCcw } from 'lucide-react';

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
  
  const renderAvatar = (player: Player) => {
    const renderEyes = () => {
      const baseStyle = "absolute bg-black";
      
      switch (player.avatar.eyes) {
        case 'happy':
          return (
            <>
              <div className={`${baseStyle} w-2 h-1 rounded-t-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-2 h-1 rounded-t-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
            </>
          );
        case 'wink':
          return (
            <>
              <div className={`${baseStyle} w-1.5 h-1.5 rounded-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-2 h-1 rounded-t-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
            </>
          );
        case 'surprised':
          return (
            <>
              <div className={`${baseStyle} w-2 h-2 rounded-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-2 h-2 rounded-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
            </>
          );
        case 'sleepy':
          return (
            <>
              <div className={`${baseStyle} w-3 h-0.5 left-1/4 top-1/3 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-3 h-0.5 right-1/4 top-1/3 transform translate-x-1/2`}></div>
            </>
          );
        case 'star':
          return (
            <>
              <div className="absolute left-1/4 top-1/3 transform -translate-x-1/2 text-yellow-400 text-sm">✦</div>
              <div className="absolute right-1/4 top-1/3 transform translate-x-1/2 text-yellow-400 text-sm">✦</div>
            </>
          );
        default: // normal
          return (
            <>
              <div className={`${baseStyle} w-1.5 h-1.5 rounded-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-1.5 h-1.5 rounded-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
            </>
          );
      }
    };

    const renderEyebrows = () => {
      if (player.avatar.eyebrows === 'none') return null;
      
      const baseStyle = "absolute bg-black";
      
      switch (player.avatar.eyebrows) {
        case 'raised':
          return (
            <>
              <div className={`${baseStyle} w-2 h-0.5 rounded-full left-1/4 top-1/4 transform -translate-x-1/2 rotate-12`}></div>
              <div className={`${baseStyle} w-2 h-0.5 rounded-full right-1/4 top-1/4 transform translate-x-1/2 -rotate-12`}></div>
            </>
          );
        case 'angry':
          return (
            <>
              <div className={`${baseStyle} w-2 h-0.5 left-1/4 top-1/4 transform -translate-x-1/2 -rotate-12`}></div>
              <div className={`${baseStyle} w-2 h-0.5 right-1/4 top-1/4 transform translate-x-1/2 rotate-12`}></div>
            </>
          );
        case 'worried':
          return (
            <>
              <div className={`${baseStyle} w-2 h-0.5 left-1/4 top-1/4 transform -translate-x-1/2 rotate-12`}></div>
              <div className={`${baseStyle} w-2 h-0.5 right-1/4 top-1/4 transform translate-x-1/2 rotate-12`}></div>
            </>
          );
        default: // normal
          return (
            <>
              <div className={`${baseStyle} w-2 h-0.5 left-1/4 top-1/4 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-2 h-0.5 right-1/4 top-1/4 transform translate-x-1/2`}></div>
            </>
          );
      }
    };

    const renderMouth = () => {
      const baseStyle = "absolute";
      
      switch (player.avatar.mouth) {
        case 'laugh':
          return (
            <div className={`${baseStyle} w-5 h-3 bg-black rounded-b-full left-1/2 bottom-1/4 transform -translate-x-1/2`}></div>
          );
        case 'neutral':
          return (
            <div className={`${baseStyle} w-4 h-0.5 bg-black left-1/2 bottom-1/4 transform -translate-x-1/2`}></div>
          );
        case 'surprised':
          return (
            <div className={`${baseStyle} w-3 h-3 bg-black rounded-full left-1/2 bottom-1/5 transform -translate-x-1/2`}></div>
          );
        case 'sad':
          return (
            <div className={`${baseStyle} w-4 h-2 border-t-2 border-black left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-t-full`}></div>
          );
        case 'tongue':
          return (
            <>
              <div className={`${baseStyle} w-4 h-2 border-b-2 border-black left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-b-full`}></div>
              <div className={`${baseStyle} w-1.5 h-1.5 bg-pink-400 rounded-full left-1/2 bottom-1/5 transform -translate-x-1/2`}></div>
            </>
          );
        default: // smile
          return (
            <div className={`${baseStyle} w-4 h-2 border-b-2 border-black left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-b-full`}></div>
          );
      }
    };

    const renderAccessory = () => {
      if (player.avatar.accessory === 'none') return null;
      
      const baseStyle = "absolute flex items-center justify-center";
      
      switch (player.avatar.accessory) {
        case 'glasses':
          return (
            <div className={`${baseStyle} left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-lg`}>
              👓
            </div>
          );
        case 'sunglasses':
          return (
            <div className={`${baseStyle} left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2 text-lg`}>
              🕶️
            </div>
          );
        case 'hat':
          return (
            <div className={`${baseStyle} left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/4 text-xl`}>
              🎩
            </div>
          );
        case 'crown':
          return (
            <div className={`${baseStyle} left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/4 text-xl`}>
              👑
            </div>
          );
        case 'headband':
          return (
            <div className={`${baseStyle} left-1/2 top-1/6 transform -translate-x-1/2 -translate-y-1/2 text-lg`}>
              🎀
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div 
        className="w-12 h-12 rounded-full relative transition-all duration-300 border-2 border-gray-300" 
        style={{ backgroundColor: player.avatar.color }}
      >
        {renderEyebrows()}
        {renderEyes()}
        {renderMouth()}
        {renderAccessory()}
      </div>
    );
  };
  
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
              {renderAvatar(winner)}
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
                  {renderAvatar(player)}
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