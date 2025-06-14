import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useSocket } from '../context/SocketContext';
import DrawingCanvas from '../components/DrawingCanvas';
import ChatBox from '../components/ChatBox';
import PlayersList from '../components/PlayersList';
import GameControls from '../components/GameControls';
import GameOverScreen from '../components/GameOverScreen';
import { Clock, Home } from 'lucide-react';

const GameRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { socket, connected } = useSocket();
  const { player, gameState, joinRoom, startGame, leaveRoom } = useGame();
  const [showGameOver, setShowGameOver] = useState(false);

  useEffect(() => {
    if (!player) {
      navigate('/');
      return;
    }

    if (connected && socket && roomId) {
      joinRoom(roomId);
    }

    return () => {
      leaveRoom();
    };
  }, [connected, socket, roomId, player]);

  useEffect(() => {
    if (!gameState.isPlaying && gameState.currentRound > 0) {
      setShowGameOver(true);
    }
  }, [gameState.isPlaying, gameState.currentRound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const goHome = () => {
    leaveRoom();
    navigate('/');
  };

  const isDrawing = player && gameState.players.find(p => p.id === player.id)?.isDrawing;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Game header */}
      <header className="bg-purple-800 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={goHome}
              className="p-2 rounded-full hover:bg-purple-700 transition-colors mr-2"
            >
              <Home size={20} />
            </button>
            <h1 className="text-xl font-bold">Scribble Draw & Guess</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <Clock size={20} className="mr-1" />
              <span className="font-mono">
                {formatTime(gameState.timeLeft)}
              </span>
            </div>
            <div>
              Round {gameState.currentRound}/{gameState.totalRounds}
            </div>
          </div>
        </div>
      </header>

      {/* Word display */}
      <div className="bg-indigo-700 text-white py-3 text-center">
        <div className="container mx-auto">
          {gameState.isPlaying ? (
            isDrawing ? (
              <div>
                <span className="font-bold text-lg">Your word:</span>{' '}
                <span className="text-xl font-bold">{gameState.currentWord}</span>
              </div>
            ) : (
              <div>
                <span className="font-bold text-lg">Guess the word:</span>{' '}
                <span className="text-xl font-mono tracking-wider">
                  {gameState.revealedWord}
                </span>
              </div>
            )
          ) : (
            <div className="text-lg">
              {gameState.players.length < 2
                ? "Waiting for more players to join..."
                : "Waiting for the game to start..."}
            </div>
          )}
        </div>
      </div>

      {/* Main game area */}
      <div className="flex-grow bg-gray-100 flex flex-col md:flex-row overflow-hidden">
        {/* Chat panel */}
        <div className="w-full md:w-1/4 bg-white shadow-md md:order-1 order-3">
          <ChatBox />
        </div>

        {/* Drawing area */}
        <div className="w-full md:w-2/4 flex flex-col md:order-2 order-1">
          <div className="flex-grow flex items-center justify-center p-4">
            <DrawingCanvas 
              isDrawing={isDrawing || false} 
              roomId={gameState.roomId || ''} 
            />
          </div>
          
          {isDrawing && (
            <div className="p-2 bg-gray-50 border-t">
              <GameControls />
            </div>
          )}
        </div>

        {/* Players list */}
        <div className="w-full md:w-1/4 bg-white shadow-md md:order-3 order-2">
          <PlayersList players={gameState.players} currentPlayerId={player?.id} />
        </div>
      </div>

      {/* Game over modal */}
      {showGameOver && (
        <GameOverScreen 
          players={gameState.players} 
          onPlayAgain={() => {
            setShowGameOver(false);
            startGame();
          }}
          onExit={() => {
            setShowGameOver(false);
            goHome();
          }}
        />
      )}
    </div>
  );
};

export default GameRoomPage;