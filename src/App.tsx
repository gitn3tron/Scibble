import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './context/SocketContext';
import { GameProvider } from './context/GameContext';
import HomePage from './pages/HomePage';
import RoomCreationPage from './pages/RoomCreationPage';
import GameRoomPage from './pages/GameRoomPage';

function App() {
  return (
    <Router>
      <SocketProvider>
        <GameProvider>
          <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-indigo-800 text-white">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/create-room" element={<RoomCreationPage />} />
              <Route path="/room/:roomId" element={<GameRoomPage />} />
            </Routes>
          </div>
        </GameProvider>
      </SocketProvider>
    </Router>
  );
}

export default App;