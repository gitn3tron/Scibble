import React, { useRef, useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import { Paintbrush, Eraser, RefreshCw, Palette, Undo2, Redo2, PaintBucket } from 'lucide-react';

interface DrawingCanvasProps {
  isDrawing: boolean;
  roomId: string;
}

interface Point {
  x: number;
  y: number;
}

interface DrawingState {
  imageData: ImageData;
  timestamp: number;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ isDrawing, roomId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socket } = useSocket();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'fill'>('brush');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [undoStack, setUndoStack] = useState<DrawingState[]>([]);
  const [redoStack, setRedoStack] = useState<DrawingState[]>([]);

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
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);

    setCtx(context);

    // Save initial state
    const initialState: DrawingState = {
      imageData: context.getImageData(0, 0, canvas.width, canvas.height),
      timestamp: Date.now()
    };
    setUndoStack([initialState]);

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

  // Clear canvas when new round starts
  useEffect(() => {
    if (!ctx || !canvasRef.current) return;
    
    const clearCanvasForNewRound = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      
      // Reset undo/redo stacks
      const initialState: DrawingState = {
        imageData: ctx.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height),
        timestamp: Date.now()
      };
      setUndoStack([initialState]);
      setRedoStack([]);
    };

    if (socket) {
      socket.on('round-started', clearCanvasForNewRound);
      socket.on('clear-canvas', clearCanvasForNewRound);
      return () => {
        socket.off('round-started', clearCanvasForNewRound);
        socket.off('clear-canvas', clearCanvasForNewRound);
      };
    }
  }, [socket, ctx]);

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
      tool: 'brush' | 'eraser' | 'fill';
    }) => {
      if (data.tool === 'fill') {
        floodFill(data.from.x, data.from.y, data.color, false);
      } else {
        ctx.lineWidth = data.brushSize;
        ctx.strokeStyle = data.tool === 'eraser' ? '#ffffff' : data.color;
        
        ctx.beginPath();
        ctx.moveTo(data.from.x, data.from.y);
        ctx.lineTo(data.to.x, data.to.y);
        ctx.stroke();
      }
    });

    return () => {
      socket.off('drawing-data');
    };
  }, [socket, ctx]);

  const saveState = () => {
    if (!ctx || !canvasRef.current) return;
    
    const newState: DrawingState = {
      imageData: ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
      timestamp: Date.now()
    };
    
    setUndoStack(prev => [...prev.slice(-19), newState]); // Keep last 20 states
    setRedoStack([]); // Clear redo stack when new action is performed
  };

  // Flood fill algorithm for paint bucket
  const floodFill = (startX: number, startY: number, fillColor: string, broadcast: boolean = true) => {
    if (!ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Convert hex color to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    const fillRgb = hexToRgb(fillColor);
    if (!fillRgb) return;
    
    const startIndex = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    
    // Don't fill if clicking on the same color
    if (startR === fillRgb.r && startG === fillRgb.g && startB === fillRgb.b) return;
    
    const stack = [[Math.floor(startX), Math.floor(startY)]];
    
    while (stack.length > 0) {
      const [x, y] = stack.pop()!;
      
      if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;
      
      const index = (y * canvas.width + x) * 4;
      
      if (data[index] !== startR || data[index + 1] !== startG || data[index + 2] !== startB) continue;
      
      data[index] = fillRgb.r;
      data[index + 1] = fillRgb.g;
      data[index + 2] = fillRgb.b;
      data[index + 3] = 255;
      
      stack.push([x + 1, y]);
      stack.push([x - 1, y]);
      stack.push([x, y + 1]);
      stack.push([x, y - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    if (broadcast && socket && roomId && isDrawing) {
      socket.emit('draw', {
        roomId,
        from: { x: startX, y: startY },
        to: { x: startX, y: startY },
        color: fillColor,
        brushSize: 0,
        tool: 'fill'
      });
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    const point = getPointerPosition(e);
    
    if (tool === 'fill') {
      saveState();
      floodFill(point.x, point.y, color);
      return;
    }
    
    setDrawing(true);
    setLastPoint(point);
    saveState(); // Save state before starting to draw
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing || !isDrawing || !ctx || !lastPoint || tool === 'fill') return;
    
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

  const clearCanvas = (broadcast = true) => {
    if (!ctx || !canvasRef.current) return;
    
    saveState();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    if (broadcast && socket && roomId && isDrawing) {
      socket.emit('clear', { roomId });
    }
  };

  const undo = () => {
    if (!ctx || !canvasRef.current || undoStack.length <= 1) return;
    
    const currentState = undoStack[undoStack.length - 1];
    const previousState = undoStack[undoStack.length - 2];
    
    setRedoStack(prev => [...prev, currentState]);
    setUndoStack(prev => prev.slice(0, -1));
    
    ctx.putImageData(previousState.imageData, 0, 0);
  };

  const redo = () => {
    if (!ctx || !canvasRef.current || redoStack.length === 0) return;
    
    const stateToRestore = redoStack[redoStack.length - 1];
    
    setUndoStack(prev => [...prev, stateToRestore]);
    setRedoStack(prev => prev.slice(0, -1));
    
    ctx.putImageData(stateToRestore.imageData, 0, 0);
  };

  const colorOptions = [
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FF9900', '#9900FF', '#99FF00', '#FF0099'
  ];

  return (
    <div className="w-full h-full flex flex-col">
      <div className="relative flex-grow border border-gray-300 bg-white rounded-lg overflow-hidden">
        <canvas
          ref={canvasRef}
          className={`absolute top-0 left-0 w-full h-full ${
            tool === 'fill' ? 'cursor-crosshair' : 'cursor-crosshair'
          }`}
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
        <div className="flex items-center justify-center space-x-3 pt-3 pb-2 bg-gray-50 rounded-b-lg flex-wrap">
          {/* Tool Selection */}
          <button
            onClick={() => setTool('brush')}
            className={`p-2 rounded-full transition-colors ${
              tool === 'brush' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            title="Brush"
          >
            <Paintbrush size={18} />
          </button>
          
          <button
            onClick={() => setTool('eraser')}
            className={`p-2 rounded-full transition-colors ${
              tool === 'eraser' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            title="Eraser"
          >
            <Eraser size={18} />
          </button>
          
          <button
            onClick={() => setTool('fill')}
            className={`p-2 rounded-full transition-colors ${
              tool === 'fill' ? 'bg-purple-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
            title="Fill"
          >
            <PaintBucket size={18} />
          </button>
          
          {/* Color Picker */}
          <div className="relative">
            <button 
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
              title="Colors"
            >
              <Palette size={18} style={{ color }}/>
            </button>
            
            {showColorPicker && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white p-3 rounded-lg shadow-lg z-10 border">
                <div className="grid grid-cols-4 gap-2 w-32">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      className={`w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 ${
                        color === c ? 'border-gray-400 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => {
                        setColor(c);
                        setShowColorPicker(false);
                      }}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Brush Size */}
          {tool !== 'fill' && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Size:</span>
              <input
                type="range"
                min="1"
                max="20"
                value={brushSize}
                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                className="w-20"
                title={`Brush size: ${brushSize}px`}
              />
              <span className="text-sm text-gray-600 w-6">{brushSize}</span>
            </div>
          )}
          
          {/* Undo/Redo */}
          <button
            onClick={undo}
            disabled={undoStack.length <= 1}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
          
          {/* Clear Canvas */}
          <button
            onClick={() => clearCanvas()}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white transition-colors"
            title="Clear canvas"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DrawingCanvas;