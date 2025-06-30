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