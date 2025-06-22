import React from 'react';
import { Users, Crown, TrendingUp, TrendingDown } from 'lucide-react';

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

interface PlayersListProps {
  players: Player[];
  currentPlayerId: string | undefined;
}

const PlayersList: React.FC<PlayersListProps> = ({ players, currentPlayerId }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  
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
        className="w-12 h-12 rounded-full relative transition-all duration-300 border-2 border-white/20" 
        style={{ backgroundColor: player.avatar.color }}
      >
        {renderEyebrows()}
        {renderEyes()}
        {renderMouth()}
        {renderAccessory()}
        
        {player.isDrawing && (
          <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-xs rounded-full w-5 h-5 flex items-center justify-center text-white shadow-lg">
            ✏️
          </div>
        )}
      </div>
    );
  };

  const getScoreChange = (player: Player, index: number) => {
    // This would need to be tracked in game state for real implementation
    // For now, just show trending icons for top players
    if (index === 0 && player.score > 0) return 'up';
    if (index === sortedPlayers.length - 1 && player.score < 50) return 'down';
    return null;
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center">
        <Users size={20} className="mr-2" />
        <h3 className="font-bold text-lg">Players ({players.length})</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto bg-white">
        {sortedPlayers.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {sortedPlayers.map((player, index) => {
              const scoreChange = getScoreChange(player, index);
              return (
                <div 
                  key={player.id} 
                  className={`flex items-center p-4 transition-all duration-200 ${
                    player.id === currentPlayerId 
                      ? 'bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-500' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center mr-3">
                    <div className="mr-3 w-8 text-center">
                      {index === 0 ? (
                        <Crown size={20} className="text-yellow-500 mx-auto" />
                      ) : (
                        <span className="font-bold text-gray-500 text-lg">#{index + 1}</span>
                      )}
                    </div>
                    {renderAvatar(player)}
                  </div>
                  
                  <div className="flex-grow">
                    <div className="font-semibold text-gray-800 flex items-center">
                      {player.name}
                      {player.id === currentPlayerId && (
                        <span className="text-purple-600 ml-2 text-sm font-medium">(You)</span>
                      )}
                      {player.isDrawing && (
                        <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                          Drawing
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="font-bold text-xl text-gray-800 flex items-center">
                      {player.score}
                      {scoreChange === 'up' && <TrendingUp size={16} className="ml-1 text-green-500" />}
                      {scoreChange === 'down' && <TrendingDown size={16} className="ml-1 text-red-500" />}
                    </div>
                    <div className="text-xs text-gray-500">points</div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-gray-500 p-8">
            <Users size={48} className="mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No players yet</p>
            <p className="text-sm">Waiting for players to join...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersList;