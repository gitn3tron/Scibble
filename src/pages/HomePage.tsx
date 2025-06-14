import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import AvatarCreator from '../components/AvatarCreator';
import { v4 as uuidv4 } from 'uuid';
import { PencilRuler } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { setPlayer, joinRoom } = useGame();
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [avatar, setAvatar] = useState({
    eyes: 'normal',
    mouth: 'smile',
    color: '#8B5CF6'
  });
  const [nameError, setNameError] = useState('');
  const [roomError, setRoomError] = useState('');

  useEffect(() => {
    // Check for name in localStorage to provide a better UX
    const savedName = localStorage.getItem('playerName');
    if (savedName) {
      setName(savedName);
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden text-gray-800 transition-all duration-300 hover:shadow-2xl">
        <div className="p-6 bg-purple-600 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <PencilRuler size={48} className="text-white mb-2" />
            <h1 className="text-3xl font-bold text-center text-white">
              Scribble Draw & Guess
            </h1>
            <p className="text-purple-200 text-center mt-1">Draw, guess, and have fun!</p>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-semibold mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleNameChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                nameError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter your name"
              maxLength={12}
            />
            {nameError && <p className="text-red-500 text-xs mt-1">{nameError}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold mb-2">
              Customize Your Avatar
            </label>
            <AvatarCreator avatar={avatar} setAvatar={setAvatar} />
          </div>

          <div className="mb-6">
            <label htmlFor="roomCode" className="block text-sm font-semibold mb-2">
              Room Code (to join existing room)
            </label>
            <input
              type="text"
              id="roomCode"
              value={roomCode}
              onChange={handleRoomCodeChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                roomError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter room code to join"
            />
            {roomError && <p className="text-red-500 text-xs mt-1">{roomError}</p>}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mt-6">
            <button
              onClick={handleCreateRoom}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex-1"
            >
              Create Room
            </button>
            <button
              onClick={handleJoinRoom}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 flex-1"
            >
              Join Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;