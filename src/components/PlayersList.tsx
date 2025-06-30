import React from 'react';
import { Users, Crown, TrendingUp, TrendingDown } from 'lucide-react';
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

interface PlayersListProps {
  players: Player[];
  currentPlayerId: string | undefined;
}

const PlayersList: React.FC<PlayersListProps> = ({ players, currentPlayerId }) => {
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

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
                    <AvatarDisplay 
                      avatar={player.avatar} 
                      size="medium" 
                      isDrawing={player.isDrawing}
                      animate={true}
                    />
                  </div>
                  
                  <div className="flex-grow">
                    <div className="font-semibold text-gray-800 flex items-center">
                      {player.name}
                      {player.id === currentPlayerId && (
                        <span className="text-purple-600 ml-2 text-sm font-medium">(You)</span>
                      )}
                      {player.isDrawing && (
                        <span className="ml-2 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium animate-pulse">
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