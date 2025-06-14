import React from 'react';
import { Palette, Eraser, PaintBucket, Undo2, Redo2 } from 'lucide-react';

const GameControls: React.FC = () => {
  return (
    <div className="flex justify-center space-x-2">
      <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded flex items-center">
        <Palette size={16} className="mr-1" />
        <span>Colors</span>
      </button>
      
      <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded flex items-center">
        <Eraser size={16} className="mr-1" />
        <span>Eraser</span>
      </button>
      
      <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded flex items-center">
        <PaintBucket size={16} className="mr-1" />
        <span>Fill</span>
      </button>
      
      <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded flex items-center">
        <Undo2 size={16} className="mr-1" />
        <span>Undo</span>
      </button>
      
      <button className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-1 px-3 rounded flex items-center">
        <Redo2 size={16} className="mr-1" />
        <span>Redo</span>
      </button>
    </div>
  );
};

export default GameControls;