import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';

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

interface GameState {
  roomId: string | null;
  players: Player[];
  currentRound: number;
  totalRounds: number;
  timeLeft: number;
  currentWord: string;
  revealedWord: string;
  hints: number;
  isPlaying: boolean;
  messages: Message[];
  wordChoices: string[];
  isChoosingWord: boolean;
  drawingPlayerName: string;
  turnNumber: number;
  totalTurns: number;
}

interface Message {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  type: 'chat' | 'system' | 'correct-guess';
  timestamp: number;
}

interface GameContextType {
  player: Player | null;
  setPlayer: (player: Player) => void;
  gameState: GameState;
  createRoom: (settings: GameSettings) => void;
  joinRoom: (roomId: string) => void;
  startGame: () => void;
  sendMessage: (message: string) => void;
  leaveRoom: () => void;
  selectWord: (word: string) => void;
}

interface GameSettings {
  totalPlayers: number;
  drawTime: number;
  totalRounds: number;
  wordCount: number;
  hintsCount: number;
  customWordsOnly: boolean;
  customWords: string[];
}

const initialGameState: GameState = {
  roomId: null,
  players: [],
  currentRound: 0,
  totalRounds: 0,
  timeLeft: 0,
  currentWord: '',
  revealedWord: '',
  hints: 0,
  isPlaying: false,
  messages: [],
  wordChoices: [],
  isChoosingWord: false,
  drawingPlayerName: '',
  turnNumber: 0,
  totalTurns: 0,
};

const GameContext = createContext<GameContextType>({
  player: null,
  setPlayer: () => {},
  gameState: initialGameState,
  createRoom: () => {},
  joinRoom: () => {},
  startGame: () => {},
  sendMessage: () => {},
  leaveRoom: () => {},
  selectWord: () => {},
});

export const useGame = () => useContext(GameContext);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { socket } = useSocket();
  const [player, setPlayer] = useState<Player | null>(null);
  const [gameState, setGameState] = useState<GameState>(initialGameState);

  useEffect(() => {
    if (!socket) return;

    console.log('🔌 Setting up socket event listeners in GameContext');

    socket.on('room-created', (data: { roomId: string }) => {
      console.log('✅ Received room-created event:', data);
      setGameState(prev => ({ ...prev, roomId: data.roomId }));
    });

    socket.on('player-joined', (data: { players: Player[] }) => {
      console.log('👥 Received player-joined event:', data);
      setGameState(prev => ({ ...prev, players: data.players }));
    });

    socket.on('game-started', (data: Partial<GameState>) => {
      console.log('🎮 Received game-started event:', data);
      setGameState(prev => ({ ...prev, ...data, isPlaying: true }));
    });

    socket.on('word-choices', (data: { choices: string[], timeLimit: number }) => {
      console.log('📝 Received word-choices event:', data);
      setGameState(prev => ({
        ...prev,
        wordChoices: data.choices,
        isChoosingWord: true,
        timeLeft: data.timeLimit
      }));
    });

    socket.on('drawer-choosing', (data: {
      currentRound: number,
      drawingPlayerName: string,
      timeLeft: number
    }) => {
      console.log('⏳ Received drawer-choosing event:', data);
      setGameState(prev => ({
        ...prev,
        currentRound: data.currentRound,
        drawingPlayerName: data.drawingPlayerName,
        timeLeft: data.timeLeft,
        isChoosingWord: false,
        wordChoices: []
      }));
    });

    socket.on('turn-started', (data: {
      currentRound: number,
      timeLeft: number,
      drawingPlayerId: string,
      drawingPlayerName: string,
      currentWord?: string,
      revealedWord: string,
      turnNumber: number,
      totalTurns: number
    }) => {
      console.log('🎯 Received turn-started event:', data);
      setGameState(prev => ({
        ...prev,
        currentRound: data.currentRound,
        timeLeft: data.timeLeft,
        revealedWord: data.revealedWord,
        drawingPlayerName: data.drawingPlayerName,
        turnNumber: data.turnNumber,
        totalTurns: data.totalTurns,
        isChoosingWord: false,
        wordChoices: [],
        players: prev.players.map(p => ({
          ...p,
          isDrawing: p.id === data.drawingPlayerId
        })),
        currentWord: player?.id === data.drawingPlayerId ? (data.currentWord || '') : '',
      }));
    });

    socket.on('time-update', (data: { timeLeft: number }) => {
      setGameState(prev => ({ ...prev, timeLeft: data.timeLeft }));
    });

    socket.on('hint-revealed', (data: { revealedWord: string }) => {
      console.log('💡 Received hint-revealed event:', data);
      setGameState(prev => ({ ...prev, revealedWord: data.revealedWord }));
    });

    socket.on('new-message', (message: Message) => {
      console.log('💬 Received new-message event:', message);
      setGameState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }));
    });

    socket.on('player-guessed', (data: { playerId: string, score: number }) => {
      console.log('🎯 Received player-guessed event:', data);
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => 
          p.id === data.playerId ? { ...p, score: data.score } : p
        )
      }));
    });

    socket.on('turn-ended', (data: { scores: Record<string, number>, correctWord: string }) => {
      console.log('🏁 Received turn-ended event:', data);
      setGameState(prev => ({
        ...prev,
        players: prev.players.map(p => ({
          ...p,
          score: data.scores[p.id] || p.score,
          isDrawing: false
        })),
        currentWord: '',
        revealedWord: data.correctWord
      }));
    });

    socket.on('game-ended', (data: { finalScores: Record<string, number> }) => {
      console.log('🎊 Received game-ended event:', data);
      setGameState(prev => ({
        ...prev,
        isPlaying: false,
        players: prev.players.map(p => ({
          ...p,
          score: data.finalScores[p.id] || p.score,
          isDrawing: false
        }))
      }));
    });

    // Add error event listener
    socket.on('error', (error: any) => {
      console.error('❌ Socket error:', error);
      alert(error.message || 'An error occurred');
    });

    socket.on('connect_error', (error: any) => {
      console.error('❌ Socket connection error:', error);
    });

    return () => {
      console.log('🧹 Cleaning up socket event listeners');
      socket.off('room-created');
      socket.off('player-joined');
      socket.off('game-started');
      socket.off('word-choices');
      socket.off('drawer-choosing');
      socket.off('turn-started');
      socket.off('time-update');
      socket.off('hint-revealed');
      socket.off('new-message');
      socket.off('player-guessed');
      socket.off('turn-ended');
      socket.off('game-ended');
      socket.off('error');
      socket.off('connect_error');
    };
  }, [socket, player]);

  const createRoom = (settings: GameSettings) => {
    console.log('🏠 createRoom called with:', { player, settings });
    
    if (!socket) {
      console.error('❌ No socket connection available');
      return;
    }
    
    if (!player) {
      console.error('❌ No player data available');
      return;
    }

    console.log('📤 Emitting create-room event to server...');
    socket.emit('create-room', { player, settings });
    console.log('✅ create-room event emitted successfully');
  };

  const joinRoom = (roomId: string) => {
    console.log('🚪 joinRoom called with:', { player, roomId });
    
    if (!socket) {
      console.error('❌ No socket connection for joinRoom');
      return;
    }
    
    if (!player) {
      console.error('❌ No player data for joinRoom');
      return;
    }

    console.log('📤 Emitting join-room event to server...');
    socket.emit('join-room', { player, roomId });
    setGameState(prev => ({ ...prev, roomId }));
    console.log('✅ join-room event emitted successfully');
  };

  const startGame = () => {
    console.log('🎮 startGame called with roomId:', gameState.roomId);
    
    if (!socket) {
      console.error('❌ No socket connection for startGame');
      return;
    }
    
    if (!gameState.roomId) {
      console.error('❌ No roomId for startGame');
      return;
    }

    console.log('📤 Emitting start-game event to server...');
    socket.emit('start-game', { roomId: gameState.roomId });
    console.log('✅ start-game event emitted successfully');
  };

  const selectWord = (word: string) => {
    console.log('📝 selectWord called with:', word);
    
    if (!socket || !gameState.roomId) {
      console.error('❌ No socket connection or roomId for selectWord');
      return;
    }

    console.log('📤 Emitting word-selected event to server...');
    socket.emit('word-selected', { roomId: gameState.roomId, selectedWord: word });
    console.log('✅ word-selected event emitted successfully');
  };

  const sendMessage = (message: string) => {
    if (socket && player && gameState.roomId) {
      console.log('💬 Sending message:', message);
      socket.emit('send-message', { 
        roomId: gameState.roomId, 
        playerId: player.id,
        playerName: player.name,
        text: message 
      });
    }
  };

  const leaveRoom = () => {
    console.log('🚪 leaveRoom called');
    
    if (socket && player && gameState.roomId) {
      console.log('📤 Emitting leave-room event to server...');
      socket.emit('leave-room', { roomId: gameState.roomId, playerId: player.id });
      setGameState(initialGameState);
      console.log('✅ leave-room event emitted successfully');
    }
  };

  return (
    <GameContext.Provider value={{
      player,
      setPlayer,
      gameState,
      createRoom,
      joinRoom,
      startGame,
      sendMessage,
      leaveRoom,
      selectWord
    }}>
      {children}
    </GameContext.Provider>
  );
};