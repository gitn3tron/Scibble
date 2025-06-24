import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useSocket } from '../context/SocketContext';
import DrawingCanvas from '../components/DrawingCanvas';
import ChatBox from '../components/ChatBox';
import PlayersList from '../components/PlayersList';
import GameOverScreen from '../components/GameOverScreen';
import WordSelection from '../components/WordSelection';
import { Clock, Home, Play, Users, Crown } from 'lucide-react';

const GameRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { socket, connected } = useSocket();
  const { player, gameState, joinRoom, startGame, leaveRoom, selectWord } = useGame();
  const [showGameOver, setShowGameOver] = useState(false);
  
  // CRITICAL FIX: Use refs to prevent duplicate joins
  const hasJoinedRoom = useRef(false);
  const hasLeftRoom = useRef(false);

  useEffect(() => {
    if (!player) {
      navigate('/');
      return;
    }

    // CRITICAL FIX: Only join room once when all conditions are met
    if (connected && socket && roomId && gameState.roomId !== roomId && !hasJoinedRoom.current) {
      console.log('🚪 CRITICAL: Joining room for the first time:', roomId);
      hasJoinedRoom.current = true;
      joinRoom(roomId);
    }
  }, [connected, socket, roomId, player, gameState.roomId, joinRoom, navigate]);

  // CRITICAL FIX: Separate cleanup effect that only runs on actual component unmount
  useEffect(() => {
    return () => {
      // Only leave room if we're actually leaving the page (not just re-rendering)
      const currentPath = window.location.pathname;
      const expectedPath = `/room/${gameState.roomId}`;
      
      if (gameState.roomId && currentPath !== expectedPath && !hasLeftRoom.current) {
        console.log('🚪 CRITICAL: Component unmounting, leaving room');
        hasLeftRoom.current = true;
        leaveRoom();
      }
    };
  }, []); // Empty dependency array - only runs on mount/unmount

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
    if (!hasLeftRoom.current) {
      hasLeftRoom.current = true;
      leaveRoom();
    }
    navigate('/');
  };

  const isDrawing = player && gameState.players.find(p => p.id === player.id)?.isDrawing;
  // Host is the FIRST player in the room (index 0), not the last
  const isHost = player && gameState.players.length > 0 && gameState.players[0].id === player.id;

  const renderPlayerAvatar = (player: any) => {
    const renderEyes = () => {
      const baseStyle = "absolute bg-black";
      
      switch (player.avatar.eyes) {
        case 'happy':
          return (
            <>
              <div className={`${baseStyle} w-1.5 h-0.5 rounded-t-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-1.5 h-0.5 rounded-t-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
            </>
          );
        case 'wink':
          return (
            <>
              <div className={`${baseStyle} w-1 h-1 rounded-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-1.5 h-0.5 rounded-t-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
            </>
          );
        case 'surprised':
          return (
            <>
              <div className={`${baseStyle} w-1.5 h-1.5 rounded-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-1.5 h-1.5 rounded-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
            </>
          );
        case 'sleepy':
          return (
            <>
              <div className={`${baseStyle} w-2 h-0.5 left-1/4 top-1/3 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-2 h-0.5 right-1/4 top-1/3 transform translate-x-1/2`}></div>
            </>
          );
        case 'star':
          return (
            <>
              <div className="absolute left-1/4 top-1/3 transform -translate-x-1/2 text-yellow-400 text-xs">✦</div>
              <div className="absolute right-1/4 top-1/3 transform translate-x-1/2 text-yellow-400 text-xs">✦</div>
            </>
          );
        default: // normal
          return (
            <>
              <div className={`${baseStyle} w-1 h-1 rounded-full left-1/4 top-1/3 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-1 h-1 rounded-full right-1/4 top-1/3 transform translate-x-1/2`}></div>
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
              <div className={`${baseStyle} w-1.5 h-0.5 rounded-full left-1/4 top-1/4 transform -translate-x-1/2 rotate-12`}></div>
              <div className={`${baseStyle} w-1.5 h-0.5 rounded-full right-1/4 top-1/4 transform translate-x-1/2 -rotate-12`}></div>
            </>
          );
        case 'angry':
          return (
            <>
              <div className={`${baseStyle} w-1.5 h-0.5 left-1/4 top-1/4 transform -translate-x-1/2 -rotate-12`}></div>
              <div className={`${baseStyle} w-1.5 h-0.5 right-1/4 top-1/4 transform translate-x-1/2 rotate-12`}></div>
            </>
          );
        case 'worried':
          return (
            <>
              <div className={`${baseStyle} w-1.5 h-0.5 left-1/4 top-1/4 transform -translate-x-1/2 rotate-12`}></div>
              <div className={`${baseStyle} w-1.5 h-0.5 right-1/4 top-1/4 transform translate-x-1/2 rotate-12`}></div>
            </>
          );
        default: // normal
          return (
            <>
              <div className={`${baseStyle} w-1.5 h-0.5 left-1/4 top-1/4 transform -translate-x-1/2`}></div>
              <div className={`${baseStyle} w-1.5 h-0.5 right-1/4 top-1/4 transform translate-x-1/2`}></div>
            </>
          );
      }
    };

    const renderMouth = () => {
      const baseStyle = "absolute";
      
      switch (player.avatar.mouth) {
        case 'laugh':
          return (
            <div className={`${baseStyle} w-3 h-1.5 bg-black rounded-b-full left-1/2 bottom-1/4 transform -translate-x-1/2`}></div>
          );
        case 'neutral':
          return (
            <div className={`${baseStyle} w-3 h-0.5 bg-black left-1/2 bottom-1/4 transform -translate-x-1/2`}></div>
          );
        case 'surprised':
          return (
            <div className={`${baseStyle} w-2 h-2 bg-black rounded-full left-1/2 bottom-1/5 transform -translate-x-1/2`}></div>
          );
        case 'sad':
          return (
            <div className={`${baseStyle} w-3 h-1.5 border-t-1 border-black left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-t-full`}></div>
          );
        case 'tongue':
          return (
            <>
              <div className={`${baseStyle} w-3 h-1.5 border-b-1 border-black left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-b-full`}></div>
              <div className={`${baseStyle} w-1 h-1 bg-pink-400 rounded-full left-1/2 bottom-1/5 transform -translate-x-1/2`}></div>
            </>
          );
        default: // smile
          return (
            <div className={`${baseStyle} w-3 h-1.5 border-b-1 border-black left-1/2 bottom-1/4 transform -translate-x-1/2 rounded-b-full`}></div>
          );
      }
    };

    const renderAccessory = () => {
      if (player.avatar.accessory === 'none') return null;
      
      const baseStyle = "absolute flex items-center justify-center text-xs";
      
      switch (player.avatar.accessory) {
        case 'glasses':
          return (
            <div className={`${baseStyle} left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2`}>
              👓
            </div>
          );
        case 'sunglasses':
          return (
            <div className={`${baseStyle} left-1/2 top-1/3 transform -translate-x-1/2 -translate-y-1/2`}>
              🕶️
            </div>
          );
        case 'hat':
          return (
            <div className={`${baseStyle} left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2`}>
              🎩
            </div>
          );
        case 'crown':
          return (
            <div className={`${baseStyle} left-1/2 top-0 transform -translate-x-1/2 -translate-y-1/2`}>
              👑
            </div>
          );
        case 'headband':
          return (
            <div className={`${baseStyle} left-1/2 top-1/4 transform -translate-x-1/2 -translate-y-1/2`}>
              🎀
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <div 
        className="w-10 h-10 rounded-full relative transition-all duration-300" 
        style={{ backgroundColor: player.avatar.color }}
      >
        {renderEyebrows()}
        {renderEyes()}
        {renderMouth()}
        {renderAccessory()}
      </div>
    );
  };

  // CRITICAL DEBUG LOGGING - This will show us exactly what's happening
  console.log('🔍 CRITICAL GameRoomPage Debug State:', {
    playerId: player?.id,
    playerName: player?.name,
    isDrawing,
    wordChoices: gameState.wordChoices,
    wordChoicesLength: gameState.wordChoices?.length || 0,
    isChoosingWord: gameState.isChoosingWord,
    drawingPlayerName: gameState.drawingPlayerName,
    timeLeft: gameState.timeLeft,
    isPlaying: gameState.isPlaying,
    currentRound: gameState.currentRound,
    currentWord: gameState.currentWord,
    // Show the exact condition values
    conditionCheck: {
      gameStateIsPlaying: gameState.isPlaying,
      isDrawingCheck: isDrawing,
      wordChoicesExists: !!gameState.wordChoices,
      wordChoicesLength: gameState.wordChoices?.length || 0,
      finalCondition: gameState.isPlaying && isDrawing && gameState.wordChoices && gameState.wordChoices.length > 0
    }
  });

  // CRITICAL: Show word selection modal when drawing player has word choices
  // This condition should be TRUE when the server sends word choices to the drawing player
  if (gameState.isPlaying && isDrawing && gameState.wordChoices && gameState.wordChoices.length > 0) {
    console.log('✅ CRITICAL: Showing word selection modal for drawing player');
    console.log('✅ CRITICAL: Word choices to display:', gameState.wordChoices);
    console.log('✅ CRITICAL: Player name:', player?.name);
    console.log('✅ CRITICAL: Time left:', gameState.timeLeft);
    
    return (
      <>
        <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Round {gameState.currentRound}</h2>
            <p className="text-purple-200">Choose your word to draw...</p>
          </div>
        </div>
        <WordSelection
          words={gameState.wordChoices}
          timeLeft={gameState.timeLeft}
          onWordSelect={selectWord}
        />
      </>
    );
  }

  // Show waiting screen for non-drawing players when someone is choosing word
  if (gameState.isPlaying && gameState.isChoosingWord && !isDrawing && gameState.drawingPlayerName) {
    console.log('✅ Showing waiting screen for non-drawing player');
    console.log('✅ Drawing player name:', gameState.drawingPlayerName);
    console.log('✅ Current player name:', player?.name);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold mb-2">Round {gameState.currentRound}</h2>
          <p className="text-purple-200">
            {gameState.drawingPlayerName} is choosing a word to draw...
          </p>
          <div className="mt-4 flex items-center justify-center text-orange-300">
            <Clock size={20} className="mr-2" />
            <span className="font-mono text-lg">{gameState.timeLeft}s</span>
          </div>
        </div>
      </div>
    );
  }

  // Show lobby if game hasn't started yet
  if (!gameState.isPlaying && gameState.currentRound === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
        {/* Header */}
        <header className="bg-purple-800 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <div className="flex items-center">
              <button 
                onClick={goHome}
                className="p-2 rounded-full hover:bg-purple-700 transition-colors mr-2"
              >
                <Home size={20} />
              </button>
              <h1 className="text-xl font-bold text-white">Scribble Draw & Guess</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-white">
                <Users size={20} className="mr-1" />
                <span>{gameState.players.length} players</span>
              </div>
            </div>
          </div>
        </header>

        {/* Lobby Content */}
        <div className="container mx-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Room Info */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-6 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Game Lobby</h2>
              <div className="text-xl text-purple-200 mb-4">
                Room Code: <span className="font-mono font-bold text-white bg-white/20 px-3 py-1 rounded-lg">{gameState.roomId}</span>
              </div>
              <p className="text-purple-200">
                {gameState.players.length < 2 
                  ? "Waiting for more players to join..." 
                  : isHost 
                    ? "Ready to start! Click the button below when everyone has joined."
                    : "Waiting for the host to start the game..."
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Players List */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <Users size={24} className="mr-2" />
                  Players ({gameState.players.length})
                </h3>
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {gameState.players.map((p, index) => (
                    <div key={p.id} className="flex items-center p-3 bg-white/10 rounded-lg">
                      {renderPlayerAvatar(p)}
                      <div className="flex-grow ml-3">
                        <div className="font-medium text-white flex items-center">
                          {p.name}
                          {p.id === player?.id && <span className="text-purple-300 ml-1"> (You)</span>}
                          {index === 0 && (
                            <div className="flex items-center ml-2">
                              <Crown size={16} className="text-yellow-400 mr-1" />
                              <span className="text-yellow-300 text-sm">Host</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden">
                <div className="h-80">
                  <ChatBox />
                </div>
              </div>
            </div>

            {/* Start Game Button (only for host) */}
            {isHost && (
              <div className="mt-6 text-center">
                <button
                  onClick={startGame}
                  disabled={gameState.players.length < 2}
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl transition-colors flex items-center justify-center mx-auto text-lg shadow-lg"
                >
                  <Play size={24} className="mr-2" />
                  Start Game
                </button>
                {gameState.players.length < 2 && (
                  <p className="text-amber-300 mt-2 font-medium">
                    At least 2 players needed to start
                  </p>
                )}
              </div>
            )}

            {/* Non-host message */}
            {!isHost && gameState.players.length >= 2 && (
              <div className="mt-6 text-center">
                <div className="bg-blue-500/20 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-blue-200 font-medium">
                    Waiting for {gameState.players[0]?.name} (Host) to start the game...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Game is active - show the main game interface
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white flex flex-col">
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
            <h1 className="text-xl font-bold text-white">Scribble Draw & Guess</h1>
          </div>
          
          <div className="flex items-center space-x-4 text-white">
            <div className="flex items-center">
              <Clock size={20} className="mr-1" />
              <span className="font-mono">
                {formatTime(gameState.timeLeft)}
              </span>
            </div>
            <div>
              Round {gameState.currentRound} • Turn {gameState.turnNumber}/{gameState.totalTurns}
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
                <span className="font-bold text-lg text-white">Your word:</span>{' '}
                <span className="text-xl font-bold text-yellow-300">{gameState.currentWord}</span>
              </div>
            ) : (
              <div>
                <span className="font-bold text-lg text-white">
                  {gameState.drawingPlayerName} is drawing:
                </span>{' '}
                <span className="text-xl font-mono tracking-wider text-yellow-300">
                  {gameState.revealedWord}
                </span>
              </div>
            )
          ) : (
            <div className="text-lg text-white">
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
              gameStarted={gameState.isPlaying}
              currentWord={gameState.currentWord}
              isChoosingWord={gameState.isChoosingWord}
              drawingPlayerName={gameState.drawingPlayerName}
            />
          </div>
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