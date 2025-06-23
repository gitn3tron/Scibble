import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.CLIENT_URL 
      : ['http://localhost:5173', 'http://localhost:3000', 'https://localhost:5173', 'https://localhost:3000'],
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  },
  transports: ['polling', 'websocket'],
  pingTimeout: 120000,
  pingInterval: 25000,
  upgradeTimeout: 30000,
  maxHttpBufferSize: 1e8
});

// Game state storage
const rooms = new Map();
const playerSockets = new Map();

// Expanded word list with hundreds of drawable words
const defaultWords = [
  // Animals
  'cat', 'dog', 'elephant', 'lion', 'tiger', 'bear', 'wolf', 'fox', 'rabbit', 'mouse',
  'horse', 'cow', 'pig', 'sheep', 'goat', 'chicken', 'duck', 'goose', 'turkey', 'peacock',
  'eagle', 'hawk', 'owl', 'parrot', 'penguin', 'flamingo', 'swan', 'crane', 'pelican', 'toucan',
  'fish', 'shark', 'whale', 'dolphin', 'octopus', 'jellyfish', 'starfish', 'crab', 'lobster', 'seahorse',
  'butterfly', 'bee', 'ant', 'spider', 'ladybug', 'dragonfly', 'grasshopper', 'cricket', 'beetle', 'moth',
  'snake', 'lizard', 'turtle', 'frog', 'crocodile', 'alligator', 'iguana', 'chameleon', 'gecko', 'salamander',
  'monkey', 'gorilla', 'chimpanzee', 'orangutan', 'baboon', 'lemur', 'koala', 'panda', 'kangaroo', 'zebra',
  'giraffe', 'hippopotamus', 'rhinoceros', 'camel', 'llama', 'deer', 'moose', 'elk', 'antelope', 'buffalo',
  
  // Food & Drinks
  'apple', 'banana', 'orange', 'grape', 'strawberry', 'blueberry', 'raspberry', 'blackberry', 'cherry', 'peach',
  'pear', 'plum', 'apricot', 'mango', 'pineapple', 'watermelon', 'cantaloupe', 'honeydew', 'kiwi', 'coconut',
  'lemon', 'lime', 'grapefruit', 'avocado', 'tomato', 'cucumber', 'carrot', 'potato', 'onion', 'garlic',
  'broccoli', 'cauliflower', 'cabbage', 'lettuce', 'spinach', 'celery', 'asparagus', 'corn', 'peas', 'beans',
  'pepper', 'chili', 'eggplant', 'zucchini', 'squash', 'pumpkin', 'mushroom', 'radish', 'turnip', 'beet',
  'bread', 'cake', 'cookie', 'pie', 'donut', 'muffin', 'bagel', 'croissant', 'pretzel', 'waffle',
  'pancake', 'toast', 'sandwich', 'burger', 'pizza', 'pasta', 'noodles', 'rice', 'soup', 'salad',
  'cheese', 'milk', 'butter', 'yogurt', 'ice cream', 'chocolate', 'candy', 'lollipop', 'gum', 'popcorn',
  'coffee', 'tea', 'juice', 'soda', 'water', 'wine', 'beer', 'cocktail', 'smoothie', 'milkshake',
  
  // Objects & Tools
  'hammer', 'screwdriver', 'wrench', 'saw', 'drill', 'nail', 'screw', 'bolt', 'nut', 'pliers',
  'scissors', 'knife', 'fork', 'spoon', 'plate', 'bowl', 'cup', 'glass', 'bottle', 'jar',
  'pen', 'pencil', 'marker', 'crayon', 'brush', 'eraser', 'ruler', 'calculator', 'computer', 'phone',
  'television', 'radio', 'camera', 'microphone', 'speaker', 'headphones', 'keyboard', 'mouse', 'monitor', 'printer',
  'book', 'newspaper', 'magazine', 'letter', 'envelope', 'stamp', 'package', 'box', 'bag', 'suitcase',
  'clock', 'watch', 'calendar', 'mirror', 'lamp', 'candle', 'flashlight', 'battery', 'key', 'lock',
  'door', 'window', 'chair', 'table', 'bed', 'sofa', 'desk', 'shelf', 'cabinet', 'drawer',
  'refrigerator', 'stove', 'oven', 'microwave', 'toaster', 'blender', 'mixer', 'dishwasher', 'washing machine', 'dryer',
  
  // Transportation
  'car', 'truck', 'bus', 'motorcycle', 'bicycle', 'scooter', 'skateboard', 'roller skates', 'train', 'subway',
  'airplane', 'helicopter', 'rocket', 'spaceship', 'boat', 'ship', 'yacht', 'sailboat', 'canoe', 'kayak',
  'taxi', 'ambulance', 'fire truck', 'police car', 'school bus', 'van', 'limousine', 'convertible', 'pickup truck', 'trailer',
  
  // Nature & Weather
  'sun', 'moon', 'star', 'cloud', 'rain', 'snow', 'lightning', 'thunder', 'rainbow', 'wind',
  'tree', 'flower', 'grass', 'leaf', 'branch', 'root', 'seed', 'fruit', 'vegetable', 'garden',
  'mountain', 'hill', 'valley', 'river', 'lake', 'ocean', 'beach', 'island', 'desert', 'forest',
  'rock', 'stone', 'sand', 'dirt', 'mud', 'ice', 'fire', 'smoke', 'flame', 'ash',
  'rose', 'tulip', 'daisy', 'sunflower', 'lily', 'orchid', 'carnation', 'daffodil', 'iris', 'violet',
  
  // Sports & Activities
  'football', 'basketball', 'baseball', 'soccer', 'tennis', 'golf', 'hockey', 'volleyball', 'bowling', 'swimming',
  'running', 'jumping', 'dancing', 'singing', 'painting', 'drawing', 'reading', 'writing', 'cooking', 'baking',
  'fishing', 'hunting', 'camping', 'hiking', 'climbing', 'skiing', 'snowboarding', 'surfing', 'sailing', 'diving',
  'yoga', 'meditation', 'exercise', 'weightlifting', 'cycling', 'jogging', 'walking', 'stretching', 'boxing', 'wrestling',
  
  // Clothing & Accessories
  'shirt', 'pants', 'dress', 'skirt', 'shorts', 'jacket', 'coat', 'sweater', 'hoodie', 'vest',
  'hat', 'cap', 'helmet', 'crown', 'tiara', 'headband', 'scarf', 'tie', 'bow tie', 'belt',
  'shoes', 'boots', 'sandals', 'slippers', 'sneakers', 'heels', 'socks', 'stockings', 'gloves', 'mittens',
  'ring', 'necklace', 'bracelet', 'earrings', 'watch', 'glasses', 'sunglasses', 'purse', 'wallet', 'backpack',
  
  // Musical Instruments
  'piano', 'guitar', 'violin', 'drums', 'trumpet', 'saxophone', 'flute', 'clarinet', 'trombone', 'harp',
  'banjo', 'ukulele', 'harmonica', 'accordion', 'xylophone', 'tambourine', 'triangle', 'cymbals', 'bell', 'whistle',
  
  // Buildings & Places
  'house', 'apartment', 'castle', 'palace', 'mansion', 'cabin', 'tent', 'igloo', 'barn', 'garage',
  'school', 'hospital', 'library', 'museum', 'theater', 'cinema', 'restaurant', 'cafe', 'store', 'mall',
  'bank', 'post office', 'police station', 'fire station', 'airport', 'train station', 'bus stop', 'park', 'playground', 'zoo',
  'church', 'temple', 'mosque', 'synagogue', 'cathedral', 'tower', 'bridge', 'tunnel', 'road', 'street',
  
  // Body Parts
  'head', 'face', 'eye', 'nose', 'mouth', 'ear', 'hair', 'neck', 'shoulder', 'arm',
  'hand', 'finger', 'thumb', 'wrist', 'elbow', 'chest', 'back', 'stomach', 'waist', 'hip',
  'leg', 'knee', 'ankle', 'foot', 'toe', 'heel', 'brain', 'heart', 'lung', 'liver',
  
  // Emotions & Actions
  'happy', 'sad', 'angry', 'excited', 'surprised', 'scared', 'tired', 'sleepy', 'hungry', 'thirsty',
  'laughing', 'crying', 'smiling', 'frowning', 'winking', 'thinking', 'dreaming', 'sleeping', 'waking up', 'yawning',
  'hugging', 'kissing', 'waving', 'pointing', 'clapping', 'thumbs up', 'peace sign', 'high five', 'handshake', 'salute',
  
  // Shapes & Colors
  'circle', 'square', 'triangle', 'rectangle', 'oval', 'diamond', 'heart', 'star', 'cross', 'arrow',
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown', 'black', 'white',
  'gray', 'silver', 'gold', 'bronze', 'copper', 'turquoise', 'magenta', 'cyan', 'maroon', 'navy',
  
  // Fantasy & Mythology
  'dragon', 'unicorn', 'fairy', 'wizard', 'witch', 'ghost', 'vampire', 'werewolf', 'zombie', 'monster',
  'angel', 'devil', 'genie', 'mermaid', 'centaur', 'phoenix', 'griffin', 'pegasus', 'troll', 'goblin',
  
  // Space & Science
  'planet', 'asteroid', 'comet', 'galaxy', 'nebula', 'black hole', 'satellite', 'telescope', 'microscope', 'laboratory',
  'atom', 'molecule', 'crystal', 'magnet', 'battery', 'circuit', 'robot', 'android', 'cyborg', 'alien',
  
  // Holidays & Celebrations
  'birthday', 'wedding', 'graduation', 'anniversary', 'party', 'festival', 'carnival', 'parade', 'fireworks', 'balloon',
  'gift', 'present', 'ribbon', 'bow', 'card', 'invitation', 'decoration', 'confetti', 'streamer', 'banner',
  
  // Games & Toys
  'ball', 'doll', 'teddy bear', 'puzzle', 'blocks', 'lego', 'yo-yo', 'kite', 'frisbee', 'boomerang',
  'chess', 'checkers', 'cards', 'dice', 'domino', 'marbles', 'spinning top', 'slinky', 'rubik cube', 'jigsaw',
  
  // Professions
  'doctor', 'nurse', 'teacher', 'student', 'chef', 'waiter', 'pilot', 'driver', 'mechanic', 'electrician',
  'plumber', 'carpenter', 'painter', 'artist', 'musician', 'singer', 'dancer', 'actor', 'director', 'writer',
  'lawyer', 'judge', 'police officer', 'firefighter', 'soldier', 'sailor', 'farmer', 'gardener', 'baker', 'barber',
  
  // Technology
  'internet', 'website', 'email', 'password', 'download', 'upload', 'wifi', 'bluetooth', 'usb', 'charger',
  'tablet', 'smartphone', 'laptop', 'desktop', 'server', 'database', 'software', 'app', 'game', 'virtual reality',
  
  // Miscellaneous
  'magic', 'spell', 'potion', 'treasure', 'map', 'compass', 'adventure', 'journey', 'quest', 'mission',
  'secret', 'mystery', 'clue', 'riddle', 'puzzle', 'code', 'symbol', 'sign', 'signal', 'message',
  'story', 'tale', 'legend', 'myth', 'fable', 'poem', 'song', 'melody', 'rhythm', 'beat',
  'pattern', 'design', 'style', 'fashion', 'trend', 'culture', 'tradition', 'custom', 'habit', 'routine'
];

// Enhanced scoring system
const SCORING = {
  CORRECT_GUESS_BASE: 100,
  TIME_BONUS_MULTIPLIER: 2,
  DRAWER_BONUS: 50,
  WRONG_GUESS_PENALTY: -5,
  HINT_PENALTY: 10,
  POSITION_BONUS: [50, 30, 20, 10, 5] // Bonus for 1st, 2nd, 3rd, etc. correct guesses
};

function generateRoomId() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function createRoom(roomId, settings, hostPlayer) {
  const room = {
    id: roomId,
    players: [hostPlayer],
    settings,
    gameState: {
      isPlaying: false,
      currentRound: 0,
      currentDrawer: null,
      currentDrawerIndex: -1,
      currentWord: '',
      wordChoices: [],
      timeLeft: 0,
      scores: {},
      messages: [],
      wordList: settings.customWordsOnly ? settings.customWords : [...defaultWords, ...settings.customWords],
      hintsRevealed: 0,
      playersWhoHaveDrawnThisRound: [],
      totalDrawersNeeded: 0,
      isChoosingWord: false,
      correctGuesses: [], // Track order of correct guesses for bonus points
      wrongGuesses: new Set() // Track wrong guesses for penalties
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
  
  for (let i = 0; i < word.length; i++) {
    if (word[i].match(/[a-zA-Z]/)) {
      letterIndices.push(i);
    }
  }
  
  const lettersToReveal = Math.min(hintsRevealed, Math.floor(letterIndices.length * 0.6));
  
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

function calculateScore(room, playerId, isCorrectGuess, timeLeft) {
  if (!isCorrectGuess) {
    // Penalty for wrong guess
    return SCORING.WRONG_GUESS_PENALTY;
  }

  // Base score for correct guess
  let score = SCORING.CORRECT_GUESS_BASE;
  
  // Time bonus (more points for faster guesses)
  const timeBonus = Math.floor((timeLeft / room.settings.drawTime) * 100 * SCORING.TIME_BONUS_MULTIPLIER);
  score += timeBonus;
  
  // Position bonus (first correct guess gets more points)
  const position = room.gameState.correctGuesses.length;
  if (position < SCORING.POSITION_BONUS.length) {
    score += SCORING.POSITION_BONUS[position];
  }
  
  // Hint penalty (fewer points if hints were revealed)
  const hintPenalty = room.gameState.hintsRevealed * SCORING.HINT_PENALTY;
  score -= hintPenalty;
  
  return Math.max(score, 10); // Minimum 10 points for correct guess
}

function awardDrawerBonus(room) {
  const drawer = room.players.find(p => p.id === room.gameState.currentDrawer);
  if (drawer && room.gameState.correctGuesses.length > 0) {
    // Drawer gets bonus based on how many people guessed correctly
    const drawerBonus = SCORING.DRAWER_BONUS * room.gameState.correctGuesses.length;
    drawer.score += drawerBonus;
    
    const bonusMessage = {
      id: uuidv4(),
      playerId: 'system',
      playerName: 'System',
      text: `${drawer.name} earned ${drawerBonus} bonus points for drawing!`,
      type: 'system',
      timestamp: Date.now()
    };
    
    addMessage(room, bonusMessage);
  }
}

function startRound(room) {
  console.log(`🎯 Starting round ${room.gameState.currentRound + 1} for room ${room.id}`);
  
  room.gameState.currentRound++;
  room.gameState.playersWhoHaveDrawnThisRound = [];
  room.gameState.totalDrawersNeeded = room.players.length;
  room.gameState.hintsRevealed = 0;
  room.gameState.currentWord = '';
  room.gameState.wordChoices = [];
  room.gameState.isChoosingWord = false;
  room.gameState.correctGuesses = [];
  room.gameState.wrongGuesses.clear();
  
  console.log(`📊 Round ${room.gameState.currentRound}: Need ${room.gameState.totalDrawersNeeded} players to draw`);
  
  startNextTurn(room);
}

function startNextTurn(room) {
  room.gameState.currentDrawerIndex = (room.gameState.currentDrawerIndex + 1) % room.players.length;
  const nextDrawer = room.players[room.gameState.currentDrawerIndex];
  
  room.gameState.currentDrawer = nextDrawer.id;
  room.gameState.isChoosingWord = true;
  room.gameState.timeLeft = 15;
  room.gameState.correctGuesses = [];
  room.gameState.wrongGuesses.clear();
  
  room.gameState.playersWhoHaveDrawnThisRound.push(nextDrawer.id);
  
  console.log(`🎨 Turn started: ${nextDrawer.name} (ID: ${nextDrawer.id}) is drawing (${room.gameState.playersWhoHaveDrawnThisRound.length}/${room.gameState.totalDrawersNeeded})`);
  
  room.gameState.wordChoices = getRandomWords(room.gameState.wordList, room.settings.wordCount);
  
  console.log(`📝 Generated word choices for ${nextDrawer.name}:`, room.gameState.wordChoices);
  
  room.players.forEach(player => {
    player.isDrawing = player.id === nextDrawer.id;
  });
  
  io.to(room.id).emit('player-joined', { players: room.players });
  
  const drawerSocket = playerSockets.get(nextDrawer.id);
  
  if (drawerSocket && drawerSocket.connected) {
    console.log(`📤 CRITICAL: Sending word choices to drawer ${nextDrawer.name} (${nextDrawer.id})`);
    
    drawerSocket.emit('word-choices', {
      choices: room.gameState.wordChoices,
      timeLimit: 15
    });
    
    console.log(`✅ CRITICAL: Word choices sent successfully to ${nextDrawer.name}`);
    
  } else {
    console.error(`❌ CRITICAL: Drawer socket not found or disconnected for ${nextDrawer.name} (${nextDrawer.id})`);
  }
  
  room.players.forEach(player => {
    if (player.id !== nextDrawer.id) {
      const socket = playerSockets.get(player.id);
      if (socket && socket.connected) {
        console.log(`📤 Notifying ${player.name} that ${nextDrawer.name} is choosing word`);
        socket.emit('drawer-choosing', {
          currentRound: room.gameState.currentRound,
          drawingPlayerName: nextDrawer.name,
          timeLeft: 15
        });
      }
    }
  });
  
  const wordSelectionCountdown = setInterval(() => {
    room.gameState.timeLeft--;
    
    console.log(`⏰ Word selection countdown: ${room.gameState.timeLeft}s remaining for room ${room.id}`);
    
    io.to(room.id).emit('time-update', { timeLeft: room.gameState.timeLeft });
    
    if (room.gameState.timeLeft <= 0) {
      clearInterval(wordSelectionCountdown);
      if (rooms.has(room.id) && room.gameState.isChoosingWord) {
        console.log(`⏰ Auto-selecting word for room ${room.id}`);
        selectWord(room, room.gameState.wordChoices[0]);
      }
    }
  }, 1000);
  
  room.wordSelectionTimer = wordSelectionCountdown;
}

function selectWord(room, selectedWord) {
  console.log(`📝 Word selected: ${selectedWord} for room ${room.id}`);
  
  if (room.wordSelectionTimer) {
    clearInterval(room.wordSelectionTimer);
    room.wordSelectionTimer = null;
  }
  
  room.gameState.currentWord = selectedWord;
  room.gameState.wordChoices = [];
  room.gameState.timeLeft = room.settings.drawTime;
  room.gameState.isChoosingWord = false;
  
  const revealedWord = createRevealedWord(room.gameState.currentWord);
  
  room.players.forEach(player => {
    const socket = playerSockets.get(player.id);
    if (socket && socket.connected) {
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
  
  room.timer = setInterval(() => {
    room.gameState.timeLeft--;
    
    io.to(room.id).emit('time-update', { timeLeft: room.gameState.timeLeft });
    
    if (room.settings.hintsCount > 0) {
      const hintInterval = Math.floor(room.settings.drawTime / (room.settings.hintsCount + 1));
      const hintsToGive = Math.floor((room.settings.drawTime - room.gameState.timeLeft) / hintInterval);
      
      if (hintsToGive > room.gameState.hintsRevealed && hintsToGive <= room.settings.hintsCount) {
        room.gameState.hintsRevealed = hintsToGive;
        const newRevealedWord = createRevealedWord(room.gameState.currentWord, room.gameState.hintsRevealed);
        io.to(room.id).emit('hint-revealed', { revealedWord: newRevealedWord });
      }
    }
    
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
  
  // Award drawer bonus
  awardDrawerBonus(room);
  
  room.players.forEach(player => {
    player.isDrawing = false;
  });
  
  const scores = {};
  room.players.forEach(player => {
    scores[player.id] = player.score;
  });
  
  io.to(room.id).emit('turn-ended', { 
    scores,
    correctWord: room.gameState.currentWord
  });
  
  room.gameState.currentWord = '';
  room.gameState.wordChoices = [];
  room.gameState.hintsRevealed = 0;
  room.gameState.isChoosingWord = false;
  room.gameState.correctGuesses = [];
  room.gameState.wrongGuesses.clear();
  
  if (room.gameState.playersWhoHaveDrawnThisRound.length >= room.gameState.totalDrawersNeeded) {
    console.log(`✅ Round ${room.gameState.currentRound} completed for room ${room.id}`);
    
    if (room.gameState.currentRound >= room.settings.totalRounds) {
      endGame(room);
      return;
    }
    
    setTimeout(() => {
      if (rooms.has(room.id)) {
        startRound(room);
      }
    }, 5000);
  } else {
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
      
      player.score = 0;
      player.isDrawing = false;
      
      playerSockets.set(player.id, socket);
      console.log(`🔗 CRITICAL: Stored player ${player.name} (${player.id}) with socket ${socket.id}`);
      
      const room = createRoom(roomId, settings, player);
      
      socket.join(roomId);
      
      console.log(`✅ Room ${roomId} created successfully with host: ${player.name}`);
      
      socket.emit('room-created', { roomId });
      socket.emit('player-joined', { players: room.players });
      
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
      
      const existingPlayerIndex = room.players.findIndex(p => p.id === player.id);
      if (existingPlayerIndex !== -1) {
        playerSockets.set(player.id, socket);
        console.log(`🔗 CRITICAL: Updated player ${player.name} (${player.id}) with socket ${socket.id}`);
        socket.join(roomId);
        
        console.log(`🔄 Player ${player.name} reconnected to room ${roomId}`);
        
        socket.emit('player-joined', { players: room.players });
        
        room.gameState.messages.forEach(message => {
          socket.emit('new-message', message);
        });
        
        return;
      }
      
      if (room.gameState.isPlaying) {
        console.log(`❌ Game in room ${roomId} already in progress`);
        socket.emit('error', { message: 'Game already in progress' });
        return;
      }
      
      if (room.players.length >= room.settings.totalPlayers) {
        console.log(`❌ Room ${roomId} is full`);
        socket.emit('error', { message: 'Room is full' });
        return;
      }
      
      player.score = 0;
      player.isDrawing = false;
      
      playerSockets.set(player.id, socket);
      console.log(`🔗 CRITICAL: Stored player ${player.name} (${player.id}) with socket ${socket.id}`);
      
      room.players.push(player);
      
      socket.join(roomId);
      
      console.log(`✅ Player ${player.name} joined room ${roomId}. Total players: ${room.players.length}. Host: ${room.players[0].name}`);
      
      io.to(roomId).emit('player-joined', { players: room.players });
      
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
      
      const hostSocket = playerSockets.get(room.players[0].id);
      if (hostSocket?.id !== socket.id) {
        socket.emit('error', { message: 'Only the host can start the game' });
        return;
      }
      
      if (room.players.length < 2) {
        socket.emit('error', { message: 'Need at least 2 players to start' });
        return;
      }
      
      room.gameState.isPlaying = true;
      room.gameState.currentRound = 0;
      room.gameState.currentDrawerIndex = -1;
      
      room.players.forEach(player => {
        room.gameState.scores[player.id] = 0;
        player.score = 0;
      });
      
      console.log(`✅ Game started for room ${roomId} by host: ${room.players[0].name}`);
      
      io.to(roomId).emit('game-started', {
        isPlaying: true,
        totalRounds: room.settings.totalRounds,
        currentRound: 0
      });
      
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
    console.log('📝 CRITICAL: Received word-selected event:', data);
    
    try {
      const { roomId, selectedWord } = data;
      const room = rooms.get(roomId);
      
      if (!room) {
        console.log('❌ Room not found for word selection');
        return;
      }
      
      // FIXED: Check if the selected word is in the current word choices
      if (!room.gameState.wordChoices.includes(selectedWord)) {
        console.log('❌ Invalid word selection - word not in choices:', {
          selectedWord,
          availableChoices: room.gameState.wordChoices
        });
        return;
      }
      
      console.log(`✅ CRITICAL: Valid word selection: ${selectedWord} for room ${roomId}`);
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
      
      // Enhanced scoring system for guesses
      if (room.gameState.isPlaying && 
          room.gameState.currentWord && 
          playerId !== room.gameState.currentDrawer) {
        
        const guess = text.toLowerCase().trim();
        const correctWord = room.gameState.currentWord.toLowerCase();
        
        if (guess === correctWord) {
          // Correct guess
          if (!room.gameState.correctGuesses.includes(playerId)) {
            const points = calculateScore(room, playerId, true, room.gameState.timeLeft);
            player.score += points;
            room.gameState.correctGuesses.push(playerId);
            
            const correctMessage = {
              id: uuidv4(),
              playerId: playerId,
              playerName: playerName,
              text: `${playerName} guessed correctly! (+${points} points)`,
              type: 'correct-guess',
              timestamp: Date.now()
            };
            
            addMessage(room, correctMessage);
            io.to(roomId).emit('player-guessed', { playerId, score: player.score });
            
            // End turn if everyone guessed or first correct guess (depending on game mode)
            if (room.gameState.correctGuesses.length >= room.players.length - 1) {
              endTurn(room);
            }
          }
        } else {
          // Wrong guess penalty
          if (!room.gameState.wrongGuesses.has(playerId)) {
            const penalty = calculateScore(room, playerId, false, room.gameState.timeLeft);
            player.score = Math.max(0, player.score + penalty); // Don't go below 0
            room.gameState.wrongGuesses.add(playerId);
            
            // Regular chat message for wrong guess
            const message = {
              id: uuidv4(),
              playerId: playerId,
              playerName: playerName,
              text: text,
              type: 'chat',
              timestamp: Date.now()
            };
            
            addMessage(room, message);
            io.to(roomId).emit('player-guessed', { playerId, score: player.score });
          } else {
            // Just show the message without penalty (already penalized once)
            const message = {
              id: uuidv4(),
              playerId: playerId,
              playerName: playerName,
              text: text,
              type: 'chat',
              timestamp: Date.now()
            };
            
            addMessage(room, message);
          }
        }
        
      } else if (!room.gameState.isPlaying || !player.isDrawing) {
        // Regular chat message
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
      
      socket.to(roomId).emit('clear-canvas');
      
    } catch (error) {
      console.error('❌ Error handling clear event:', error);
    }
  });

  socket.on('undo', (data) => {
    try {
      const { roomId, imageData } = data;
      
      socket.to(roomId).emit('undo-canvas', { imageData });
      
    } catch (error) {
      console.error('❌ Error handling undo event:', error);
    }
  });

  socket.on('redo', (data) => {
    try {
      const { roomId, imageData } = data;
      
      socket.to(roomId).emit('redo-canvas', { imageData });
      
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
      
      room.players = room.players.filter(p => p.id !== playerId);
      playerSockets.delete(playerId);
      
      socket.leave(roomId);
      
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
    
    for (const [playerId, playerSocket] of playerSockets.entries()) {
      if (playerSocket.id === socket.id) {
        for (const [roomId, room] of rooms.entries()) {
          const playerIndex = room.players.findIndex(p => p.id === playerId);
          if (playerIndex !== -1) {
            const disconnectedPlayerName = room.players[playerIndex].name;
            
            room.players.splice(playerIndex, 1);
            playerSockets.delete(playerId);
            
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

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Server stats: Rooms: ${rooms.size}, Players: ${playerSockets.size}`);
  console.log(`📚 Word list loaded with ${defaultWords.length} words`);
}).on('error', (error) => {
  console.error('❌ Server failed to start:', error);
});

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