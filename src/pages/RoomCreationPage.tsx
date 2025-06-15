import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useSocket } from '../context/SocketContext';
import { Clipboard, Play, ArrowLeft, Check, Loader2, Copy } from 'lucide-react';

const RoomCreationPage: React.FC = () => {
  const navigate = useNavigate();
  const { player, createRoom, gameState } = useGame();
  const { connected } = useSocket();
  const [isCreating, setIsCreating] = useState(false);
  const [settings, setSettings] = useState({
    totalPlayers: 6,
    drawTime: 60,
    totalRounds: 3,
    wordCount: 3,
    hintsCount: 2,
    customWordsOnly: false,
    customWords: ''
  });
  const [copied, setCopied] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redirect if no player set
  useEffect(() => {
    if (!player) {
      navigate('/');
    }
  }, [player, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setSettings(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setSettings(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setSettings(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear any error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateSettings = () => {
    const newErrors: Record<string, string> = {};
    
    if (settings.totalPlayers < 2 || settings.totalPlayers > 20) {
      newErrors.totalPlayers = 'Players must be between 2 and 20';
    }
    
    if (settings.drawTime < 15 || settings.drawTime > 240) {
      newErrors.drawTime = 'Draw time must be between 15 and 240 seconds';
    }
    
    if (settings.totalRounds < 2 || settings.totalRounds > 10) {
      newErrors.totalRounds = 'Rounds must be between 2 and 10';
    }
    
    if (settings.wordCount < 1 || settings.wordCount > 5) {
      newErrors.wordCount = 'Word count must be between 1 and 5';
    }
    
    if (settings.hintsCount < 0 || settings.hintsCount > 5) {
      newErrors.hintsCount = 'Hints must be between 0 and 5';
    }
    
    if (settings.customWordsOnly) {
      const words = settings.customWords.split(',').map(word => word.trim()).filter(Boolean);
      if (words.length < 10) {
        newErrors.customWords = 'Please enter at least 10 custom words';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateRoom = async () => {
    if (!validateSettings() || !connected) return;
    
    setIsCreating(true);
    
    const customWordsList = settings.customWords
      .split(',')
      .map(word => word.trim())
      .filter(Boolean);
      
    createRoom({
      ...settings,
      customWords: customWordsList
    });
    
    // Wait for room creation
    setTimeout(() => {
      setIsCreating(false);
    }, 2000);
  };

  const copyRoomLink = () => {
    if (gameState.roomId) {
      const roomLink = `${window.location.origin}/room/${gameState.roomId}`;
      navigator.clipboard.writeText(roomLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const copyRoomCode = () => {
    if (gameState.roomId) {
      navigator.clipboard.writeText(gameState.roomId);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const startGame = () => {
    if (gameState.roomId) {
      navigate(`/room/${gameState.roomId}`);
    }
  };

  if (!player) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow-xl text-gray-800">
        <div className="p-6 bg-purple-600 text-white flex justify-between items-center">
          <button 
            onClick={() => navigate('/')}
            className="p-2 rounded-full hover:bg-purple-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-center">Create Game Room</h1>
          <div className="w-8"></div>
        </div>

        {!connected && (
          <div className="p-6 text-center">
            <Loader2 className="animate-spin h-8 w-8 mx-auto text-purple-600 mb-4" />
            <p className="text-gray-600">Connecting to server...</p>
          </div>
        )}

        {connected && !gameState.roomId ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Total Players (2-20)
                </label>
                <input
                  type="number"
                  name="totalPlayers"
                  value={settings.totalPlayers}
                  onChange={handleInputChange}
                  min={2}
                  max={20}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.totalPlayers ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.totalPlayers && (
                  <p className="text-red-500 text-xs mt-1">{errors.totalPlayers}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Draw Time (15-240 seconds)
                </label>
                <input
                  type="number"
                  name="drawTime"
                  value={settings.drawTime}
                  onChange={handleInputChange}
                  min={15}
                  max={240}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.drawTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.drawTime && (
                  <p className="text-red-500 text-xs mt-1">{errors.drawTime}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Total Rounds (2-10)
                </label>
                <input
                  type="number"
                  name="totalRounds"
                  value={settings.totalRounds}
                  onChange={handleInputChange}
                  min={2}
                  max={10}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.totalRounds ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.totalRounds && (
                  <p className="text-red-500 text-xs mt-1">{errors.totalRounds}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Words Per Round (1-5)
                </label>
                <input
                  type="number"
                  name="wordCount"
                  value={settings.wordCount}
                  onChange={handleInputChange}
                  min={1}
                  max={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.wordCount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.wordCount && (
                  <p className="text-red-500 text-xs mt-1">{errors.wordCount}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">
                  Number of Hints (0-5)
                </label>
                <input
                  type="number"
                  name="hintsCount"
                  value={settings.hintsCount}
                  onChange={handleInputChange}
                  min={0}
                  max={5}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.hintsCount ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.hintsCount && (
                  <p className="text-red-500 text-xs mt-1">{errors.hintsCount}</p>
                )}
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="customWordsOnly"
                  name="customWordsOnly"
                  checked={settings.customWordsOnly}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-purple-600 rounded focus:ring-purple-500"
                />
                <label htmlFor="customWordsOnly" className="ml-2 text-sm font-medium">
                  Use Custom Words Only
                </label>
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-semibold mb-2">
                Custom Words (comma-separated)
              </label>
              <textarea
                name="customWords"
                value={settings.customWords}
                onChange={handleInputChange}
                placeholder="apple, banana, car, dog, elephant, flower, guitar, house, igloo, jacket"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] ${
                  errors.customWords ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.customWords && (
                <p className="text-red-500 text-xs mt-1">{errors.customWords}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                {settings.customWordsOnly
                  ? 'Enter at least 10 words, separated by commas'
                  : 'Optional: Add your own words to the default word list'}
              </p>
            </div>

            <div className="mt-6">
              <button
                onClick={handleCreateRoom}
                disabled={isCreating || !connected}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="animate-spin mr-2" size={20} />
                    Creating Room...
                  </>
                ) : (
                  'Create Room'
                )}
              </button>
            </div>
          </div>
        ) : connected && gameState.roomId ? (
          <div className="p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold mb-4">Room Created!</h2>
              
              {/* Room Code Display - Most Prominent */}
              <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border-2 border-purple-200">
                <p className="text-sm text-gray-600 mb-2">Share this room code with friends:</p>
                <div className="flex items-center justify-center space-x-3">
                  <div className="text-3xl font-bold text-purple-700 tracking-wider font-mono bg-white px-4 py-2 rounded-lg shadow-sm">
                    {gameState.roomId}
                  </div>
                  <button
                    onClick={copyRoomCode}
                    className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors shadow-sm"
                    title="Copy room code"
                  >
                    {codeCopied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
                {codeCopied && (
                  <p className="text-green-600 text-sm mt-2 font-medium">Room code copied!</p>
                )}
              </div>

              {/* Full Link - Secondary Option */}
              <div className="mb-6">
                <p className="text-gray-600 text-sm mb-2">Or share the full link:</p>
                <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-center">
                  <span className="text-gray-800 truncate text-sm">
                    {`${window.location.origin}/room/${gameState.roomId}`}
                  </span>
                  <button
                    onClick={copyRoomLink}
                    className="ml-2 p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
                    title="Copy full link"
                  >
                    {copied ? <Check size={16} /> : <Clipboard size={16} />}
                  </button>
                </div>
                {copied && (
                  <p className="text-green-600 text-xs mt-1">Link copied!</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <h3 className="font-semibold mb-2">Players ({gameState.players.length}/{settings.totalPlayers})</h3>
              
              <div className="max-h-48 overflow-y-auto bg-gray-50 rounded-lg p-2">
                {gameState.players.length > 0 ? (
                  gameState.players.map((p) => (
                    <div key={p.id} className="flex items-center p-2">
                      <div 
                        className="w-8 h-8 rounded-full mr-2"
                        style={{ backgroundColor: p.avatar.color }}
                      ></div>
                      <span>{p.name}{p.id === player.id ? ' (You)' : ''}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center p-4">
                    Waiting for players to join...
                  </p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                onClick={startGame}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
                disabled={gameState.players.length < 2}
              >
                <Play size={20} className="mr-2" />
                Start Game
              </button>
              {gameState.players.length < 2 && (
                <p className="text-amber-600 text-center text-sm mt-2">
                  At least 2 players needed to start
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default RoomCreationPage;