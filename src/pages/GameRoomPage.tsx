00 to-indigo-800 text-white flex items-center justify-center">
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

  // Show waiting screen if someone else is choosing word
  if (gameState.isPlaying && gameState.isChoosingWord && !isDrawing && gameState.drawingPlayerName) {
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