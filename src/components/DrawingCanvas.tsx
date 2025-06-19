import React, { useRef, useEffect, useState, useCallback } from 'react';
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

    // Set canvas size with device pixel ratio for better quality
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    
    context.scale(dpr, dpr);
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    // Set default styles
    context.lineJoin = 'round';
    context.lineCap = 'round';
    context.lineWidth = brushSize;
    context.strokeStyle = color;
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, rect.width, rect.height);

    setCtx(context);

    // Save initial state
    const initialState: DrawingState = {
      imageData: context.getImageData(0, 0, canvas.width, canvas.height),
      timestamp: Date.now()
    };
    setUndoStack([initialState]);
    setRedoStack([]);
  }, []);

  // Clear canvas when new turn starts
  useEffect(() => {
    if (!ctx || !canvasRef.current) return;
    
    const clearCanvasForNewTurn = () => {
      const canvas = canvasRef.current!;
      const rect = canvas.getBoundingClientRect();
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Reset undo/redo stacks
      const initialState: DrawingState = {
        imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
        timestamp: Date.now()
      };
      setUndoStack([initialState]);
      setRedoStack([]);
    };

    if (socket) {
      socket.on('turn-started', clearCanvasForNewTurn);
      return () => {
        socket.off('turn-started', clearCanvasForNewTurn);
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

    const handleDrawingData = (data: {
      from: Point;
      to: Point;
      color: string;
      brushSize: number;
      tool: 'brush' | 'eraser' | 'fill';
    }) => {
      console.log('🎨 Received drawing data from other player:', data);
      
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
    };

    const handleClearCanvas = () => {
      console.log('🧹 Received clear canvas from other player');
      if (!canvasRef.current) return;
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, rect.width, rect.height);
      
      // Reset undo/redo stacks for all players
      const initialState: DrawingState = {
        imageData: ctx.getImageData(0, 0, canvas.width, canvas.height),
        timestamp: Date.now()
      };
      setUndoStack([initialState]);
      setRedoStack([]);
    };

    const handleUndoCanvas = () => {
      console.log('↩️ Received undo from other player');
      // CRITICAL FIX: Apply undo to all players' canvases
      setUndoStack(prev => {
        if (prev.length <= 1) return prev;
        
        const currentState = prev[prev.length - 1];
        const previousState = prev[prev.length - 2];
        
        setRedoStack(redoPrev => [...redoPrev, currentState]);
        ctx.putImageData(previousState.imageData, 0, 0);
        
        return prev.slice(0, -1);
      });
    };

    const handleRedoCanvas = () => {
      console.log('↪️ Received redo from other player');
      // CRITICAL FIX: Apply redo to all players' canvases
      setRedoStack(prev => {
        if (prev.length === 0) return prev;
        
        const stateToRestore = prev[prev.length - 1];
        
        setUndoStack(undoPrev => [...undoPrev, stateToRestore]);
        ctx.putImageData(stateToRestore.imageData, 0, 0);
        
        return prev.slice(0, -1);
      });
    };

    socket.on('drawing-data', handleDrawingData);
    socket.on('clear-canvas', handleClearCanvas);
    socket.on('undo-canvas', handleUndoCanvas);
    socket.on('redo-canvas', handleRedoCanvas);

    return () => {
      socket.off('drawing-data', handleDrawingData);
      socket.off('clear-canvas', handleClearCanvas);
      socket.off('undo-canvas', handleUndoCanvas);
      socket.off('redo-canvas', handleRedoCanvas);
    };
  }, [socket, ctx]);

  const saveState = useCallback(() => {
    if (!ctx || !canvasRef.current) return;
    
    const newState: DrawingState = {
      imageData: ctx.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height),
      timestamp: Date.now()
    };
    
    setUndoStack(prev => {
      const newStack = [...prev, newState];
      return newStack.slice(-20); // Keep last 20 states
    });
    setRedoStack([]); // Clear redo stack when new action is performed
  }, [ctx]);

  // Flood fill algorithm for paint bucket
  const floodFill = useCallback((startX: number, startY: number, fillColor: string, broadcast: boolean = true) => {
    if (!ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
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
    
    const dpr = window.devicePixelRatio || 1;
    const x = Math.floor(startX * dpr);
    const y = Math.floor(startY * dpr);
    
    const startIndex = (y * canvas.width + x) * 4;
    const startR = data[startIndex];
    const startG = data[startIndex + 1];
    const startB = data[startIndex + 2];
    
    // Don't fill if clicking on the same color
    if (startR === fillRgb.r && startG === fillRgb.g && startB === fillRgb.b) return;
    
    const stack = [[x, y]];
    
    while (stack.length > 0) {
      const [currentX, currentY] = stack.pop()!;
      
      if (currentX < 0 || currentX >= canvas.width || currentY < 0 || currentY >= canvas.height) continue;
      
      const index = (currentY * canvas.width + currentX) * 4;
      
      if (data[index] !== startR || data[index + 1] !== startG || data[index + 2] !== startB) continue;
      
      data[index] = fillRgb.r;
      data[index + 1] = fillRgb.g;
      data[index + 2] = fillRgb.b;
      data[index + 3] = 255;
      
      stack.push([currentX + 1, currentY]);
      stack.push([currentX - 1, currentY]);
      stack.push([currentX, currentY + 1]);
      stack.push([currentX, currentY - 1]);
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    if (broadcast && socket && roomId && isDrawing) {
      console.log('🪣 Broadcasting fill action to other players');
      socket.emit('draw', {
        roomId,
        from: { x: startX, y: startY },
        to: { x: startX, y: startY },
        color: fillColor,
        brushSize: 0,
        tool: 'fill'
      });
    }
  }, [ctx, socket, roomId, isDrawing]);

  const getPointerPosition = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;
    
    if ('touches' in e) {
      // Touch event
      if (e.touches.length === 0) return { x: 0, y: 0 };
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
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    
    e.preventDefault();
    const point = getPointerPosition(e);
    
    if (tool === 'fill') {
      saveState();
      floodFill(point.x, point.y, color);
      return;
    }
    
    setDrawing(true);
    setLastPoint(point);
    saveState(); // Save state before starting to draw
  }, [isDrawing, ctx, tool, getPointerPosition, saveState, floodFill, color]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
      console.log('🎨 Broadcasting drawing data to other players');
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
  }, [drawing, isDrawing, ctx, lastPoint, tool, getPointerPosition, socket, roomId, color, brushSize]);

  const endDrawing = useCallback(() => {
    setDrawing(false);
    setLastPoint(null);
  }, []);

  const clearCanvas = useCallback((broadcast = true) => {
    if (!ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    saveState();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);
    
    if (broadcast && socket && roomId && isDrawing) {
      console.log('🧹 Broadcasting clear canvas to other players');
      socket.emit('clear', { roomId });
    }
  }, [ctx, saveState, socket, roomId, isDrawing]);

  const undo = useCallback(() => {
    if (!ctx || !canvasRef.current || undoStack.length <= 1) return;
    
    console.log('↩️ Performing undo operation');
    
    const currentState = undoStack[undoStack.length - 1];
    const previousState = undoStack[undoStack.length - 2];
    
    setRedoStack(prev => [...prev, currentState]);
    setUndoStack(prev => prev.slice(0, -1));
    
    ctx.putImageData(previousState.imageData, 0, 0);
    
    // Broadcast undo to other players
    if (socket && roomId && isDrawing) {
      console.log('↩️ Broadcasting undo to other players');
      socket.emit('undo', { roomId });
    }
  }, [ctx, undoStack, socket, roomId, isDrawing]);

  const redo = useCallback(() => {
    if (!ctx || !canvasRef.current || redoStack.length === 0) return;
    
    console.log('↪️ Performing redo operation');
    
    const stateToRestore = redoStack[redoStack.length - 1];
    
    setUndoStack(prev => [...prev, stateToRestore]);
    setRedoStack(prev => prev.slice(0, -1));
    
    ctx.putImageData(stateToRestore.imageData, 0, 0);
    
    // Broadcast redo to other players
    if (socket && roomId && isDrawing) {
      console.log('↪️ Broadcasting redo to other players');
      socket.emit('redo', { roomId });
    }
  }, [ctx, redoStack, socket, roomId, isDrawing]);

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
          style={{ touchAction: 'none' }}
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