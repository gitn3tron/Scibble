import React, { useRef, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Paintbrush, Eraser, RefreshCw, Palette } from 'lucide-react';

interface DrawingCanvasProps {
  isDrawing: boolean;
  roomId: string;
}

interface Point {
  x: number;
  y: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ isDrawing, roomId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socket } = useSocket();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'brush' | 'eraser'>('brush');

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Set default styles
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = brushSize;
    context.strokeStyle = color;

    setCtx(context);

    // Handle window resize
    const handleResize = () => {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      context.putImageData(imageData, 0, 0);
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.lineWidth = brushSize;
      context.strokeStyle = color;
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update brush size and color
  useEffect(() => {
    if (!ctx) return;
    ctx.lineWidth = brushSize;
    ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color;
  }, [ctx, color, brushSize, tool]);

  // Listen for drawing events from other players
  useEffect(() => {
    if (!socket || !ctx) return;

    socket.on('drawing-data', (data: {
      from: Point;
      to: Point;
      color: string;
      brushSize: number;
      tool: 'brush' | 'eraser';
    }) => {
      ctx.lineWidth = data.brushSize;
      ctx.strokeStyle = data.tool === 'eraser' ? '#ffffff' : data.color;
      
      ctx.beginPath();
      ctx.moveTo(data.from.x, data.from.y);
      ctx.lineTo(data.to.x, data.to.y);
      ctx.stroke();
    });

    socket.on('clear-canvas', () => {
      clearCanvas();
    });

    return () => {
      socket.off('drawing-data');
      socket.off('clear-canvas');
    };
  }, [socket, ctx]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    const point = getPointerPosition(e);
    setDrawing(true);
    setLastPoint(point);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing || !isDrawing || !ctx || !lastPoint) return;
    
    e.preventDefault();
    const currentPoint = getPointerPosition(e);
    
    // Draw line
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
    
    // Send drawing data to server
    if (socket && roomId) {
      socket.emit('draw', {
        roomId,
        from: lastPoint,
        to: currentPoint,
        color,
        brushSize,
        tool
      });
    }
    
    setLastPoint(currentPoint);
  };

  const endDrawing = () => {
    setDrawing(false);
    setLastPoint(null);
  };

  const getPointerPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      // Mouse event
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (socket && roomId && isDrawing) {
      socket.emit('clear', { roomId });
    }
  };

  const colorOptions = ['#000000', '#ff0000', '#0000ff', '#00ff00', '#ffff00', '#ff00ff', '#00ffff', '#ff9900'];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-grow border border-gray-300 bg-white rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={endDrawing}
        />
        
        {!isDrawing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-5 pointer-events-none">
            <div className="text-center">
              <p className="text-gray-600 font-medium">
                {drawing ? "Someone is drawing..." : "Waiting for drawer..."}
              </p>
            </div>
          </div>
        )}
      </div>
      
      {isDrawing && (
        <div className="flex items-center justify-center space-x-3 pt-2">
          <button
            onClick={() => setTool('brush')}
            className={`p-2 rounded-full ${
              tool === 'brush' ? 'bg-purple-600 text-white' : 'bg-gray-200'
            }`}
          >
            <Paintbrush size={18} />
          </button>
          
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-full ${
              tool === 'eraser' ? 'bg-purple-600 text-white' : 'bg-gray-200'
            }`}
          >
            <Eraser size={18} />
          </button>
          
          <div className="relative group">
            <button className="p-2 rounded-full bg-gray-200 flex items-center justify-center">
              <Palette size={18} style={{ color }}/>
            </button>
            
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:flex bg-white p-2 rounded-lg shadow-lg z-10 flex-wrap justify-center w-[140px]">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  className={`w-6 h-6 m-1 rounded-full ${
                    color === c ? 'ring-2 ring-offset-1 ring-gray-400' : ''
                  }`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>
          
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24"
          />
          
          <button
            onClick={clearCanvas}
            className="p-2 rounded-full bg-red-500 text-white"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;