import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import AvatarCreator from '../components/AvatarCreator';
import HowToPlayModal from '../components/HowToPlayModal';
import { v4 as uuidv4 } from 'uuid';
import { PencilRuler, HelpCircle } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setPlayer, joinRoom } = useGame();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatar, setAvatar] = useState({
    eyes: 'normal',
    mouth: 'smile',
    color: '#FF6B6B',
    accessory: 'none',
    eyebrows: 'normal'
  });
  const [nameError, setNameError] = useState('');
  const [roomError, setRoomError] = useState('');
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setName(savedName);
    }

    // Show how to play modal on first visit
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial');
    if (!hasSeenTutorial) {
      setShowHowToPlay(true);
    }
  }, []);

  const handleCreateRoom = () => {
    if (!validateName()) return;
    
    const playerId = uuidv4();
    setPlayer({
      id: playerId,
      name,
      avatar,
      score: 0,
      isDrawing: false
    });
    
    localStorage.setItem('playerName', name);
    navigate('/create-room');
  };

  const handleJoinRoom = () => {
    if (!validateName()) return;
    
    if (!roomCode.trim()) {
      setRoomError('Please enter a room code');
      return;
    }
    
    const playerId = uuidv4();
    setPlayer({
      id: playerId,
      name,
      avatar,
      score: 0,
      isDrawing: false
    });
    
    localStorage.setItem('playerName', name);
    joinRoom(roomCode);
    navigate(`/room/${roomCode}`);
  };

  const validateName = () => {
    if (!name.trim()) {
      setNameError('Please enter your name');
      return false;
    }
    if (name.length > 12) {
      setNameError('Name must be 12 characters or less');
      return false;
    }
    setNameError('');
    return true;
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    if (nameError) setNameError('');
  };

  const handleRoomCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomCode(e.target.value);
    if (roomError) setRoomError('');
  };

  const handleCloseHowToPlay = () => {
    setShowHowToPlay(false);
    localStorage.setItem('hasSeenTutorial', 'true');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden text-white transition-all duration-300 hover:shadow-3xl border border-white/20">
        <div className="p-8 bg-gradient-to-r from-purple-600/80 to-indigo-600/80 backdrop-blur-sm flex items-center justify-center relative">
          {/* Bolt.new Hackathon Badge */}
          <a
            href="https://bolt.new/"
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-4 right-16 z-10 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 transition-transform duration-300 hover:scale-110"
            title="Built with Bolt.new"
          >
            <svg
              viewBox="0 0 360 360"
              className="w-full h-full"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="180" cy="180" r="180" fill="#000000"/>
              <g fill="#ffffff">
                <path d="M 159.54 46.53 Q 157.54 46.82 157.53 46.82 A 0.68 0.68 0.0 0 1 156.87 46.25 L 155.45 36.79 A 2.13 2.05 22.5 0 0 155.01 35.78 L 142.51 20.10 A 0.10 0.10 0.0 0 1 142.57 19.93 L 147.97 19.12 A 0.44 0.43 65.9 0 1 148.38 19.28 Q 152.60 24.79 156.31 29.70 Q 156.89 30.47 157.16 30.43 Q 157.44 30.39 157.77 29.49 Q 159.91 23.71 162.36 17.22 A 0.44 0.43 -82.7 0 1 162.70 16.95 L 168.11 16.16 A 0.10 0.10 0.0 0 1 168.21 16.31 L 160.77 34.93 A 2.13 2.05 -39.3 0 0 160.64 36.02 L 162.01 45.49 A 0.68 0.68 0.0 0 1 161.55 46.23 Q 161.54 46.23 159.54 46.53 Z"/>
                <path d="M 202.43 31.09 A 0.38 0.38 0.0 0 0 202.38 31.78 C 210.28 35.75 206.58 46.48 198.47 46.03 Q 192.49 45.71 184.78 44.57 A 0.35 0.34 -82.3 0 1 184.49 44.18 L 187.66 16.64 A 0.59 0.59 0.0 0 1 188.29 16.12 Q 193.87 16.52 200.08 17.54 Q 206.83 18.65 207.14 24.87 Q 207.37 29.40 202.43 31.09 Z"/>
                <ellipse cx="225.82" cy="37.75" rx="14.98" ry="13.43" transform="rotate(-72.5)"/>
                <path d="M 135.05 36.98 C 143.89 37.11 145.24 48.38 137.74 51.52 Q 132.21 53.84 124.77 56.17 A 0.35 0.34 71.8 0 1 124.34 55.95 L 115.19 29.76 A 0.60 0.59 69.5 0 1 115.53 29.01 Q 120.73 26.94 126.77 25.15 Q 133.33 23.21 136.32 28.68 Q 138.50 32.66 134.79 36.33 A 0.38 0.38 0.0 0 0 135.05 36.98 Z"/>
                <path d="M 250.61 31.88 L 254.30 33.89 A 0.51 0.51 0.0 0 1 254.51 34.58 L 243.34 55.19 A 0.51 0.51 0.0 0 0 243.55 55.88 L 253.83 61.45 A 0.51 0.51 0.0 0 1 254.04 62.14 L 252.44 65.09 A 0.51 0.51 0.0 0 1 251.75 65.30 L 236.88 57.25 A 0.51 0.51 0.0 0 1 236.67 56.56 L 249.92 32.09 A 0.51 0.51 0.0 0 1 250.61 31.88 Z"/>
                <ellipse cx="94.48" cy="59.82" rx="13.38" ry="13.04" transform="rotate(55.5)"/>
                <path d="M 280.60 50.68 Q 285.06 54.29 289.21 57.47 A 0.55 0.54 -52.4 0 1 289.31 58.24 L 287.21 60.89 A 0.50 0.49 37.9 0 1 286.52 60.97 L 280.35 56.07 A 0.55 0.54 37.8 0 0 279.59 56.16 L 265.14 74.38 A 0.65 0.64 36.2 0 1 264.27 74.51 Q 264.26 74.50 262.72 73.28 Q 261.18 72.06 261.17 72.06 A 0.65 0.64 40.6 0 1 261.09 71.18 L 275.50 52.93 A 0.55 0.54 38.9 0 0 275.42 52.17 L 269.23 47.29 A 0.50 0.49 38.8 0 1 269.15 46.60 L 271.25 43.95 A 0.55 0.54 -50.9 0 1 272.02 43.86 Q 276.07 47.18 280.60 50.68 Z"/>
                <path d="M 178.82 145.25 A 0.25 0.25 0.0 0 0 179.25 145.47 C 186.68 137.35 195.65 132.44 206.93 132.39 C 238.83 132.23 250.13 158.60 246.70 186.27 C 242.73 218.35 220.79 247.65 185.26 244.30 C 176.27 243.45 165.92 239.02 160.45 231.45 A 0.39 0.39 0.0 0 0 159.75 231.60 L 157.60 241.37 A 1.14 1.14 0.0 0 1 157.03 242.13 L 112.79 265.60 A 0.22 0.22 0.0 0 1 112.47 265.35 L 149.90 94.98 A 0.77 0.77 0.0 0 1 150.65 94.37 L 189.53 94.37 A 0.38 0.38 0.0 0 1 189.90 94.83 L 178.82 145.25 Z"/>
              </g>
            </svg>
          </a>

          <button
            onClick={() => setShowHowToPlay(true)}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors"
            title="How to Play"
          >
            <HelpCircle size={24} className="text-white" />
          </button>
          
          <div className="flex flex-col items-center">
            <PencilRuler size={56} className="text-white mb-3 drop-shadow-lg" />
            <h1 className="text-4xl font-bold text-center text-white drop-shadow-lg">
              Scribble Draw & Guess
            </h1>
            <p className="text-purple-100 text-center mt-2 text-lg">Draw, guess, and have fun!</p>
            <div className="mt-3 text-sm bg-white/20 rounded-full px-3 py-1">
              Created by <span className="font-bold">Mohammad Abir Hayat</span> 🎨
            </div>
          </div>
        </div>

        <div className="p-8">
          <div className="mb-8">
            <label htmlFor="name" className="block text-sm font-semibold mb-3 text-white">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 transition-all duration-200 ${
                nameError ? 'border-red-400 ring-2 ring-red-400' : 'border-white/30 hover:border-white/50'
              }`}
              placeholder="Enter your name"
              maxLength={12}
            />
            {nameError && <p className="text-red-300 text-sm mt-2 bg-red-500/20 px-3 py-1 rounded-lg">{nameError}</p>}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold mb-4 text-white">
              Customize Your Avatar
            </label>
            <AvatarCreator avatar={avatar} setAvatar={setAvatar} />
          </div>

          <div className="mb-8">
            <label htmlFor="roomCode" className="block text-sm font-semibold mb-3 text-white">
              Room Code (to join existing room)
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={handleRoomCodeChange}
              className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 bg-white/10 backdrop-blur-sm text-white placeholder-white/60 transition-all duration-200 ${
                roomError ? 'border-red-400 ring-2 ring-red-400' : 'border-white/30 hover:border-white/50'
              }`}
              placeholder="Enter room code to join"
            />
            {roomError && <p className="text-red-300 text-sm mt-2 bg-red-500/20 px-3 py-1 rounded-lg">{roomError}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button
              onClick={handleCreateRoom}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex-1 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Create Room
            </button>
            <button
              onClick={handleJoinRoom}
              className="bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex-1 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>

      <HowToPlayModal 
        isOpen={showHowToPlay} 
        onClose={handleCloseHowToPlay} 
      />
    </div>
  );
};

export default HomePage;