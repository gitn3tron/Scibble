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
        <div key={msg.id} className="p-2 text-sm text-gray-500 italic">
          {msg.text}
        </div>
      );
    }
    
    if (msg.type === 'correct-guess') {
      return (
        <div key={msg.id} className="p-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg">
          <span className="font-bold">{msg.playerName}</span> guessed the word correctly!
        </div>
      );
    }
    
    const isCurrentPlayer = player && msg.playerId === player.id;
    
    return (
      <div 
        key={msg.id} 
        className={`p-2 mb-1 max-w-[85%] ${
          isCurrentPlayer 
            ? 'ml-auto bg-purple-600 text-white rounded-tl-lg rounded-tr-lg rounded-bl-lg' 
            : 'mr-auto bg-gray-200 text-gray-800 rounded-tl-lg rounded-tr-lg rounded-br-lg'
        }`}
      >
        {!isCurrentPlayer && (
          <div className="text-xs font-bold mb-1">{msg.playerName}</div>
        )}
        <div>{msg.text}</div>
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-2 bg-gray-50 border-b flex items-center">
        <MessageSquare size={18} className="text-purple-600 mr-2" />
        <h3 className="font-semibold">Chat & Activity</h3>
      </div>
      
      <div className="flex-grow overflow-y-auto p-2">
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
      
      <form onSubmit={handleSubmit} className="p-2 border-t flex">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={gameState.isPlaying ? "Type your guess..." : "Type a message..."}
          className="flex-grow px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          disabled={!player || !gameState.roomId || (player && gameState.players.find(p => p.id === player.id)?.isDrawing)}
        />
        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded-r-lg hover:bg-purple-700"
          disabled={!message.trim() || !player || !gameState.roomId || (player && gameState.players.find(p => p.id === player.id)?.isDrawing)}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;