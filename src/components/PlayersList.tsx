import React from 'react';
import { Users, Crown } from 'lucide-react';

interface Player {
  id: string;
  name: string;
  avatar: {
    eyes: string;
    mouth: string;
    color: string;
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
      switch (player.avatar.eyes) {
        case 'happy':
          return (
            <>
              <div className="w-1 h-0.5 bg-black rounded-t-full absolute left-1/4 top-1/3"></div>
              <div className="w-1 h-0.5 bg-black rounded-t-full absolute right-1/4 top-1/3"></div>
            </>
          );
        case 'wink':
          return (
            <>
              <div className="w-1 h-1 bg-black rounded-full absolute left-1/4 top-1/3"></div>
              <div className="w-1 h-0.5 bg-black rounded-t-full absolute right-1/4 top-1/3"></div>
            </>
          );
        case 'surprised':
          return (
            <>
              <div className="w-1 h-1 bg-black rounded-full absolute left-1/4 top-1/3"></div>
              <div className="w-1 h-1 bg-black rounded-full absolute right-1/4 top-1/3"></div>
            </>
          );
        default: // normal
          return (
            <>
              <div className="w-1 h-1 bg-black rounded-full absolute left-1/4 top-1/3"></div>
              <div className="w-1 h-1 bg-black rounded-full absolute right-1/4 top-1/3"></div>
            </>
          );
      }
    };

    const renderMouth = () => {
      switch (player.avatar.mouth) {
        case 'laugh':
          return (
            <div className="w-3 h-1.5 bg-black rounded-b-full absolute left-1/2 bottom-1/4 transform -translate-x-1/2"></div>
          );
        case 'neutral':
          return (
            <div className="w-3 h-0.5 bg-black absolute left-1/2 bottom-1/4 transform -translate-x-1/2"></div>
          );
        case 'surprised':
          return (
            <div className="w-2 h-2 bg-black rounded-full absolute left-1/2 bottom-1/5 transform -translate-x-1/2"></div>
          );
        default: // smile
          return (
            <div className="w-3 h-1.5 border-b-1 border-black absolute left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-b-full"></div>
          );
      }
    };

    return (
      <div 
        className="w-10 h-10 rounded-full relative transition-all duration-300" 
        style={{ backgroundColor: player.avatar.color }}
      >
        {renderEyes()}
        {renderMouth()}
        
        {player.isDrawing && (
          <div className="absolute -bottom-1 -right-1 bg-yellow-500 text-xs rounded-full w-4 h-4 flex items-center justify-center text-white">
            ✏️
          </div>
        )}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-gray-50 border-b flex items-center">
        <Users size={18} className="text-purple-600 mr-2" />
        <h3 className="font-semibold">Players ({players.length})</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        {sortedPlayers.length > 0 ? (
          <div className="divide-y">
            {sortedPlayers.map((player, index) => (
              <div 
                key={player.id} 
                className={`flex items-center p-3 ${
                  player.id === currentPlayerId ? 'bg-purple-50' : ''
                }`}
              >
                <div className="flex items-center">
                  <div className="mr-2 w-6 text-center font-bold text-gray-500">
                    {index === 0 && <Crown size={16} className="text-yellow-500" />}
                    {index !== 0 && (index + 1)}
                  </div>
                  {renderAvatar(player)}
                </div>
                
                <div className="ml-3 flex-grow">
                  <div className="font-medium">
                    {player.name}
                    {player.id === currentPlayerId && ' (You)'}
                  </div>
                </div>
                
                <div className="font-bold text-lg">
                  {player.score}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 p-4">
            No players yet
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayersList;