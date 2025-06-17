import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);

// Updated CORS and Socket.IO configuration for better connection handling
const io = new Server(httpServer, {
  cors: {
    // Allow specific origins in development with protocol matching
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : ['http://localhost:5173', 'http://localhost:3000', 'https://localhost:5173', 'https://localhost:3000'],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  // Improved transport configuration
  transports: ['polling', 'websocket'],
  pingTimeout: 120000,    // 2 minutes
  pingInterval: 25000,    // 25 seconds
  upgradeTimeout: 30000,  // 30 seconds
  maxHttpBufferSize: 1e8  // 100 MB
});

// Game state storage
const rooms = new Map();
const players = new Map();

// Default word list
const defaultWords = [
  'apple', 'banana', 'car', 'dog', 'elephant', 'flower', 'guitar', 'house', 'igloo', 'jacket',
  'kite', 'lion', 'mountain', 'notebook', 'ocean', 'pizza', 'queen', 'rainbow', 'sun', 'tree',
  'umbrella', 'violin', 'whale', 'xylophone', 'yacht', 'zebra', 'airplane', 'butterfly', 'castle', 'diamond',
  'eagle', 'fire', 'garden', 'hammer', 'island', 'jungle', 'keyboard', 'lighthouse', 'mirror', 'nest',
  'orange', 'penguin', 'quilt', 'robot', 'sandwich', 'telescope', 'unicorn', 'volcano', 'waterfall', 'x-ray'
];

// Utility functions
function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createRoom(roomId, settings, hostPlayer) {
  const room = {
    id: roomId,
    players: [hostPlayer], // Host is ALWAYS the first player (index 0)
    settings,
    gameState: {
      isPlaying: false,
      currentRound: 0,
      currentDrawer: null,
      currentDrawerIndex: -1, // Track drawer index for proper rotation
      currentWord: '',
      wordChoices: [],
      timeLeft: 0,
      scores: {},
      messages: [],
      wordList: settings.customWordsOnly ? settings.customWords : [...defaultWords, ...settings.customWords],
      hintsRevealed: 0,
      playersWhoHaveDrawnThisRound: [], // Track who has drawn in current round
      totalDrawersNeeded: 0, // How many players need to draw this round
      isChoosingWord: false
    },
    timer: null,
    wordSelectionTimer: null
  };
  
  rooms.set(roomId, room);
  return room;
}

function getRandomWords(wordList, count = 3) {
  const shuffled = [...wordList].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, wordList.length));
}

function createRevealedWord(word, hintsRevealed = 0) {
  if (hintsRevealed === 0) {
    return word.replace(/[a-zA-Z]/g, '_');
  }
  
  const wordArray = word.split('');
  const letterIndices = [];
  
  // Get all letter positions
  for (let i = 0; i < word.length; i++) {
    if (word[i].match(/[a-zA-Z]/)) {
      letterIndices.push(i);
    }
  }
  
  // Calculate how many letters to reveal based on hints
  const lettersToReveal = Math.min(hintsRevealed, Math.floor(letterIndices.length * 0.6));
  
  // Randomly select which letters to reveal
  const revealedIndices = new Set();
  while (revealedIndices.size < lettersToReveal && revealedIndices.size < letterIndices.length) {
    const randomIndex = letterIndices[Math.floor(Math.random() * letterIndices.length)];
    revealedIndices.add(randomIndex);
  }
  
  return wordArray.map((char, index) => {
    if (revealedIndices.has(index) || !char.match(/[a-zA-Z]/)) {
      return char;
    }
    return '_';
  }).join('');
}

function startRound(room) {
  console.log(`🎯 Starting round ${room.gameState.currentRound + 1} for room ${room.id}`);
  
  // Increment round number
  room.gameState.currentRound++;
  
  // Reset round state
  room.gameState.playersWhoHaveDrawnThisRound = [];
  room.gameState.totalDrawersNeeded = room.players.length;
  room.gameState.hintsRevealed = 0;
  room.gameState.currentWord = '';
  room.gameState.wordChoices = [];
  room.gameState.isChoosingWord = false;
  
  console.log(`📊 Round ${room.gameState.currentRound}: Need ${room.gameState.totalDrawersNeeded} players to draw`);
  
  // Start first turn of the round
  startNextTurn(room);
}

function startNextTurn(room) {
  // Select next drawer (rotate through players)
  room.gameState.currentDrawerIndex = (room.gameState.currentDrawerIndex + 1) % room.players.length;
  const nextDrawer = room.players[room.gameState.currentDrawerIndex];
  
  room.gameState.currentDrawer = nextDrawer.id;
  room.gameState.isChoosingWord = true;
  room.gameState.timeLeft = 15; // 15 seconds for word selection
  
  // Add to players who have drawn this round
  room.gameState.playersWhoHaveDrawnThisRound.push(nextDrawer.id);
  
  console.log(`🎨 Turn started: ${nextDrawer.name} is drawing (${room.gameState.playersWhoHaveDrawnThisRound.length}/${room.gameState.totalDrawersNeeded})`);
  
  // Generate word choices for the drawer
  room.gameState.wordChoices = getRandomWords(room.gameState.wordList, room.settings.wordCount);
  
  // Update player drawing status
  room.players.forEach(player => {
    player.isDrawing = player.id === nextDrawer.id;
  });
  
  // Notify drawer about word choices
  const drawerSocket = players.get(nextDrawer.id);
  if (drawerSocket) {
    drawerSocket.emit('word-choices', {
      choices: room.gameState.wordChoices,
      timeLimit: 15 // 15 seconds to choose
    });
  }
  
  // Notify other players that drawer is choosing - FIXED: Send correct drawer name and round
  room.players.forEach(player => {
    if (player.id !== nextDrawer.id) {
      const socket = players.get(player.id);
      if (socket) {
        socket.emit('drawer-choosing', {
          currentRound: room.gameState.currentRound,
          drawingPlayerName: nextDrawer.name, // FIXED: Use correct drawer name
          timeLeft: 15
        });
      }
    }
  });
  
  // Start word selection timer with countdown
  const wordSelectionCountdown = setInterval(() => {
    room.gameState.timeLeft--;
    
    // Broadcast time update during word selection
    io.to(room.id).emit('time-update', { timeLeft: room.gameState.timeLeft });
    
    if (room.gameState.timeLeft <= 0) {
      clearInterval(wordSelectionCountdown);
      if (rooms.has(room.id) && room.gameState.isChoosingWord) {
        // Auto-select first word if drawer didn't choose
        console.log(`⏰ Auto-selecting word for room ${room.id}`);
        selectWord(room, room.gameState.wordChoices[0]);
      }
    }
  }, 1000);
  
  // Store the countdown interval
  room.wordSelectionTimer = wordSelectionCountdown;
}

function selectWord(room, selectedWord) {
  console.log(`📝 Word selected: ${selectedWord} for room ${room.id}`);
  
  // Clear word selection timer
  if (room.wordSelectionTimer) {
    clearInterval(room.wordSelectionTimer);
    room.wordSelectionTimer = null;
  }
  
  room.gameState.currentWord = selectedWord;
  room.gameState.wordChoices = [];
  room.gameState.timeLeft = room.settings.drawTime; // Set actual drawing time
  room.gameState.isChoosingWord = false;
  
  const revealedWord = createRevealedWord(room.gameState.currentWord);
  
  // Notify all players about turn start
  room.players.forEach(player => {
    const socket = players.get(player.id);
    if (socket) {
      socket.emit('turn-started', {
        currentRound: room.gameState.currentRound,
        timeLeft: room.gameState.timeLeft,
        drawingPlayerId: room.gameState.currentDrawer,
        drawingPlayerName: room.players.find(p => p.id === room.gameState.currentDrawer)?.name,
        currentWord: player.id === room.gameState.currentDrawer ? room.gameState.currentWord : undefined,
        revealedWord: revealedWord,
        turnNumber: room.gameState.playersWhoHaveDrawnThisRound.length,
        totalTurns: room.gameState.totalDrawersNeeded
      });
    }
  });
  
  // Start drawing timer
  room.timer = setInterval(() => {
    room.gameState.timeLeft--;
    
    // Broadcast time update
    io.to(room.id).emit('time-update', { timeLeft: room.gameState.timeLeft });
    
    // Check for hints based on settings
    if (room.settings.hintsCount > 0) {
      const hintInterval = Math.floor(room.settings.drawTime / (room.settings.hintsCount + 1));
      const hintsToGive = Math.floor((room.settings.drawTime - room.gameState.timeLeft) / hintInterval);
      
      if (hintsToGive > room.gameState.hintsRevealed && hintsToGive <= room.settings.hintsCount) {
        room.gameState.hintsRevealed = hintsToGive;
        const newRevealedWord = createRevealedWord(room.gameState.currentWord, room.gameState.hintsRevealed);
        io.to(room.id).emit('hint-revealed', { revealedWord: newRevealedWord });
      }
    }
    
    // End turn when time is up
    if (room.gameState.timeLeft <= 0) {
      endTurn(room);
    }
  }, 1000);
}

function endTurn(room) {
  console.log(`🏁 Ending turn for room ${room.id}. Players drawn: ${room.gameState.playersWhoHaveDrawnThisRound.length}/${room.gameState.totalDrawersNeeded}`);
  
  if (room.timer) {
    clearInterval(room.timer);
    room.timer = null;
  }
  
  if (room.wordSelectionTimer) {
    clearInterval(room.wordSelectionTimer);
    room.wordSelectionTimer = null;
  }
  
  // Reset drawing status
  room.players.forEach(player => {
    player.isDrawing = false;
  });
  
  // Broadcast turn end with the correct word
  const scores = {};
  room.players.forEach(player => {
    scores[player.id] = player.score;
  });
  
  io.to(room.id).emit('turn-ended', { 
    scores,
    correctWord: room.gameState.currentWord
  });
  
  // Reset turn state
  room.gameState.currentWord = '';
  room.gameState.wordChoices = [];
  room.gameState.hintsRevealed = 0;
  room.gameState.isChoosingWord = false;
  
  // Check if round is complete (all players have drawn)
  if (room.gameState.playersWhoHaveDrawnThisRound.length >= room.gameState.totalDrawersNeeded) {
    console.log(`✅ Round ${room.gameState.currentRound} completed for room ${room.id}`);
    
    // Check if game should end
    if (room.gameState.currentRound >= room.settings.totalRounds) {
      endGame(room);
      return;
    }
    
    // Start next round after a delay
    setTimeout(() => {
      if (rooms.has(room.id)) {
        startRound(room);
      }
    }, 5000);
  } else {
    // Continue with next turn in the same round
    setTimeout(() => {
      if (rooms.has(room.id)) {
        startNextTurn(room);
      }
    }, 3000);
  }
}

function endGame(room) {
  console.log(`🎊 Ending game for room ${room.id}`);
  
  room.gameState.isPlaying = false;
  
  const finalScores = {};
  room.players.forEach(player => {
    finalScores[player.id] = player.score;
  });
  
  io.to(room.id).emit('game-ended', { finalScores });
}

function addMessage(room, message) {
  room.gameState.messages.push(message);
  // Broadcast to ALL players in the room
  io.to(room.id).emit('new-message', message);
}

// Socket.IO event handlers
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  socket.on('create-room', (data) => {
    console.log('🏠 Received create-room event:', data);
    
    try {
      const { player, settings } = data;
      const roomId = generateRoomId();
      
      // Initialize player scores
      player.score = 0;
      player.isDrawing = false;
      
      // Store player socket mapping FIRST
      players.set(player.id, socket);
      
      // Create room with host as FIRST player
      const room = createRoom(roomId, settings, player);
      
      // Join socket to room IMMEDIATELY
      socket.join(roomId);
      
      console.log(`✅ Room ${roomId} created successfully with host: ${player.name}`);
      
      // Send response to client
      socket.emit('room-created', { roomId });
      
      // Immediately send player list to show host in room
      socket.emit('player-joined', { players: room.players });
      
      // Send welcome message
      const welcomeMessage = {
        id: uuidv4(),
        playerId: 'system',
        playerName: 'System',
        text: `Welcome to the room! Share the room code: ${roomId}`,
        type: 'system',
        timestamp: Date.now()
      };
      
      addMessage(room, welcomeMessage);
      
    } catch (error) {
      console.error('❌ Error creating room:', error);
      socket.emit('error', { message: 'Failed to create room' });
    }
  });

  socket.on('join-room', (data) => {
    console.log('🚪 Received join-room event:', data);
    
    try {
      const { player, roomId } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        console.log(`❌ Room ${roomId} not found`);
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Check if player is already in room (reconnection)
      const existingPlayerIndex = room.players.findIndex(p => p.id === player.id);
      if (existingPlayerIndex !== -1) {
        // Update existing player's socket
        players.set(player.id, socket);
        socket.join(roomId);
        
        console.log(`🔄 Player ${player.name} reconnected to room ${roomId}`);
        
        // Send current room state
        socket.emit('player-joined', { players: room.players });
        
        // Send existing messages
        room.gameState.messages.forEach(message => {
          socket.emit('new-message', message);
        });
        
        return;
      }
      
      // Check room capacity AFTER checking for existing player
      if (room.players.length >= room.settings.totalPlayers) {
        console.log(`❌ Room ${roomId} is full`);
        socket.emit('error', { message: 'Room is full' });
        return;
      }
      
      if (room.gameState.isPlaying) {
        console.log(`❌ Game in room ${roomId} already in progress`);
        socket.emit('error', { message: 'Game already in progress' });
        return;
      }
      
      // Initialize new player
      player.score = 0;
      player.isDrawing = false;
      
      // Store player socket mapping FIRST
      players.set(player.id, socket);
      
      // Add player to room (host remains at index 0)
      room.players.push(player);
      
      // Join socket to room
      socket.join(roomId);
      
      console.log(`✅ Player ${player.name} joined room ${roomId}. Total players: ${room.players.length}. Host: ${room.players[0].name}`);
      
      // Notify ALL players in room about updated player list
      io.to(roomId).emit('player-joined', { players: room.players });
      
      // Send welcome message
      const welcomeMessage = {
        id: uuidv4(),
        playerId: 'system',
        playerName: 'System',
        text: `${player.name} joined the game!`,
        type: 'system',
        timestamp: Date.now()
      };
      
      addMessage(room, welcomeMessage);
      
    } catch (error) {
      console.error('❌ Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  socket.on('start-game', (data) => {
    console.log('🎮 Received start-game event:', data);
    
    try {
      const { roomId } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        socket.emit('error', { message: 'Room not found' });
        return;
      }
      
      // Check if the player starting the game is the host (first player)
      const playerSocket = players.get(room.players[0].id);
      if (playerSocket?.id !== socket.id) {
        socket.emit('error', { message: 'Only the host can start the game' });
        return;
      }
      
      if (room.players.length < 2) {
        socket.emit('error', { message: 'Need at least 2 players to start' });
        return;
      }
      
      room.gameState.isPlaying = true;
      room.gameState.currentRound = 0;
      room.gameState.currentDrawerIndex = -1; // Reset drawer index
      
      // Initialize scores
      room.players.forEach(player => {
        room.gameState.scores[player.id] = 0;
        player.score = 0;
      });
      
      console.log(`✅ Game started for room ${roomId} by host: ${room.players[0].name}`);
      
      // Notify all players
      io.to(roomId).emit('game-started', {
        isPlaying: true,
        totalRounds: room.settings.totalRounds,
        currentRound: 0
      });
      
      // Start first round after a delay
      setTimeout(() => {
        if (rooms.has(roomId)) {
          startRound(room);
        }
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error starting game:', error);
      socket.emit('error', { message: 'Failed to start game' });
    }
  });

  socket.on('word-selected', (data) => {
    console.log('📝 Received word-selected event:', data);
    
    try {
      const { roomId, selectedWord } = data;
      const room = rooms.get(roomId);
      
      if (!room || !room.gameState.wordChoices.includes(selectedWord)) {
        console.log('❌ Invalid word selection');
        return;
      }
      
      selectWord(room, selectedWord);
      
    } catch (error) {
      console.error('❌ Error selecting word:', error);
    }
  });

  socket.on('send-message', (data) => {
    console.log('💬 Received send-message event:', data);
    
    try {
      const { roomId, playerId, playerName, text } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        console.log('❌ Room not found for message');
        return;
      }
      
      const player = room.players.find(p => p.id === playerId);
      if (!player) {
        console.log('❌ Player not found for message');
        return;
      }
      
      // Check if it's a correct guess during gameplay
      if (room.gameState.isPlaying && 
          room.gameState.currentWord && 
          text.toLowerCase().trim() === room.gameState.currentWord.toLowerCase() &&
          playerId !== room.gameState.currentDrawer) {
        
        // Award points
        const timeBonus = Math.floor(room.gameState.timeLeft / 10);
        const points = 100 + timeBonus;
        player.score += points;
        
        // Create correct guess message
        const correctMessage = {
          id: uuidv4(),
          playerId: playerId,
          playerName: playerName,
          text: `${playerName} guessed the word correctly! (+${points} points)`,
          type: 'correct-guess',
          timestamp: Date.now()
        };
        
        addMessage(room, correctMessage);
        
        // Notify about score update
        io.to(roomId).emit('player-guessed', { playerId, score: player.score });
        
        // End turn if someone guessed correctly
        endTurn(room);
        
      } else if (!room.gameState.isPlaying || !player.isDrawing) {
        // Regular chat message (allowed in lobby or if not drawing during game)
        const message = {
          id: uuidv4(),
          playerId: playerId,
          playerName: playerName,
          text: text,
          type: 'chat',
          timestamp: Date.now()
        };
        
        console.log(`💬 Broadcasting message from ${playerName} to room ${roomId}`);
        addMessage(room, message);
      }
      
    } catch (error) {
      console.error('❌ Error sending message:', error);
    }
  });

  socket.on('draw', (data) => {
    try {
      const { roomId, from, to, color, brushSize, tool } = data;
      
      // Broadcast drawing data to all other players in the room
      socket.to(roomId).emit('drawing-data', {
        from,
        to,
        color,
        brushSize,
        tool
      });
      
    } catch (error) {
      console.error('❌ Error handling draw event:', error);
    }
  });

  socket.on('clear', (data) => {
    try {
      const { roomId } = data;
      
      // Broadcast clear canvas to all other players in the room
      socket.to(roomId).emit('clear-canvas');
      
    } catch (error) {
      console.error('❌ Error handling clear event:', error);
    }
  });

  socket.on('undo', (data) => {
    try {
      const { roomId } = data;
      
      // Broadcast undo to all other players in the room
      socket.to(roomId).emit('undo-canvas');
      
    } catch (error) {
      console.error('❌ Error handling undo event:', error);
    }
  });

  socket.on('redo', (data) => {
    try {
      const { roomId } = data;
      
      // Broadcast redo to all other players in the room
      socket.to(roomId).emit('redo-canvas');
      
    } catch (error) {
      console.error('❌ Error handling redo event:', error);
    }
  });

  socket.on('leave-room', (data) => {
    console.log('🚪 Received leave-room event:', data);
    
    try {
      const { roomId, playerId } = data;
      const room = rooms.get(roomId);
      
      if (!room) return;
      
      const leavingPlayerName = room.players.find(p => p.id === playerId)?.name || 'A player';
      
      // Remove player from room
      room.players = room.players.filter(p => p.id !== playerId);
      players.delete(playerId);
      
      // Leave socket room
      socket.leave(roomId);
      
      // If room is empty, clean it up
      if (room.players.length === 0) {
        if (room.timer) {
          clearInterval(room.timer);
        }
        if (room.wordSelectionTimer) {
          clearInterval(room.wordSelectionTimer);
        }
        rooms.delete(roomId);
        console.log(`🧹 Room ${roomId} deleted (empty)`);
      } else {
        // Notify remaining players
        io.to(roomId).emit('player-joined', { players: room.players });
        
        const leaveMessage = {
          id: uuidv4(),
          playerId: 'system',
          playerName: 'System',
          text: `${leavingPlayerName} left the game`,
          type: 'system',
          timestamp: Date.now()
        };
        
        addMessage(room, leaveMessage);
      }
      
    } catch (error) {
      console.error('❌ Error leaving room:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
    
    // Find and remove player from any rooms
    for (const [playerId, playerSocket] of players.entries()) {
      if (playerSocket.id === socket.id) {
        // Find room containing this player
        for (const [roomId, room] of rooms.entries()) {
          const playerIndex = room.players.findIndex(p => p.id === playerId);
          if (playerIndex !== -1) {
            const disconnectedPlayerName = room.players[playerIndex].name;
            
            // Remove player
            room.players.splice(playerIndex, 1);
            players.delete(playerId);
            
            // Clean up empty room
            if (room.players.length === 0) {
              if (room.timer) {
                clearInterval(room.timer);
              }
              if (room.wordSelectionTimer) {
                clearInterval(room.wordSelectionTimer);
              }
              rooms.delete(roomId);
              console.log(`🧹 Room ${roomId} deleted (empty after disconnect)`);
            } else {
              // Notify remaining players
              io.to(roomId).emit('player-joined', { players: room.players });
              
              const disconnectMessage = {
                id: uuidv4(),
                playerId: 'system',
                playerName: 'System',
                text: `${disconnectedPlayerName} disconnected`,
                type: 'system',
                timestamp: Date.now()
              };
              
              addMessage(room, disconnectMessage);
            }
            break;
          }
        }
        break;
      }
    }
  });
});

// Start the server with improved error handling
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Server stats: Rooms: ${rooms.size}, Players: ${players.size}`);
}).on('error', (error) => {
  console.error('❌ Server failed to start:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received, shutting down gracefully');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received, shutting down gracefully');
  httpServer.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});