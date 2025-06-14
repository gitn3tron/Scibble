import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { MessageSquare, Send } from 'lucide-react';

const ChatBox: React.FC = () => {
  const { player, gameState, sendMessage } = useGame();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    scrollToBottom();
  }, [gameState.messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !player) return;
    
    sendMessage(message);
    setMessage('');
  };
  
  const renderMessage = (msg: typeof gameState.messages[0]) => {
    if (msg.type === 'system') {
      return (
        <div key={msg.id} className="p-2 text-sm text-gray-600 italic bg-gray-50 rounded-lg mx-2 my-1">
          {msg.text}
        </div>
      );
    }
    
    if (msg.type === 'correct-guess') {
      return (
        <div key={msg.id} className="p-2 text-sm font-medium text-green-700 bg-green-100 rounded-lg mx-2 my-1">
          {msg.text}
        </div>
      );
    }
    
    const isCurrentPlayer = player && msg.playerId === player.id;
    
    return (
      <div 
        key={msg.id} 
        className={`p-2 mb-1 max-w-[85%] mx-2 ${
          isCurrentPlayer 
            ? 'ml-auto bg-purple-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
            : 'mr-auto bg-gray-200 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg'
        }`}
      >
        {!isCurrentPlayer && (
          <div className="text-xs font-bold mb-1 text-gray-600">{msg.playerName}</div>
        )}
        <div className={isCurrentPlayer ? 'text-white' : 'text-gray-800'}>{msg.text}</div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-3 bg-gray-50 border-b flex items-center">
        <MessageSquare size={18} className="text-purple-600 mr-2" />
        <h3 className="font-semibold text-gray-800">Chat & Activity</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto p-2 bg-white">
        <div className="flex flex-col space-y-1">
          {gameState.messages.length > 0 ? (
            gameState.messages.map(renderMessage)
          ) : (
            <div className="text-center text-gray-500 p-4">
              No messages yet. Start chatting!
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t bg-white flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={gameState.isPlaying ? "Type your guess..." : "Type a message..."}
          className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-800"
          disabled={!player || !gameState.roomId || (player && gameState.players.find(p => p.id === player.id)?.isDrawing)}
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          disabled={!message.trim() || !player || !gameState.roomId || (player && gameState.players.find(p => p.id === player.id)?.isDrawing)}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;