import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { Paintbrush, Eraser, PaintBucket, Palette, Undo2, Redo2, RefreshCw, X } from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

interface CanvasState {
  imageData: ImageData;
  timestamp: number;
}

interface DrawingCanvasProps {
  isDrawing: boolean;
  roomId: string;
  gameStarted: boolean;
  currentWord: string;
  isChoosingWord: boolean;
  drawingPlayerName: string;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  isDrawing, 
  roomId, 
  gameStarted, 
  currentWord,
  isChoosingWord,
  drawingPlayerName
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { socket } = useSocket();
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState<'brush' | 'eraser' | 'fill'>('brush');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [customColor, setCustomColor] = useState('#000000');
  
  // Enhanced undo/redo system
  const [undoStack, setUndoStack] = useState<CanvasState[]>([]);
  const [redoStack, setRedoStack] = useState<CanvasState[]>([]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      // Set drawing properties
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
    };

    resizeCanvas();
    setCtx(context);

    // Save initial state
    const initialState: CanvasState = {
      imageData: context.getImageData(0, 0, canvas.width, canvas.height),
      timestamp: Date.now()
    };
    setUndoStack([initialState]);

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Update drawing properties when tool/color/size changes
  useEffect(() => {
    if (!ctx) return;
    
    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = brushSize;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
    }
  }, [ctx, tool, color, brushSize]);

  // Socket event listeners for drawing synchronization
  useEffect(() => {
    if (!socket || !ctx || !canvasRef.current) return;

    const handleDrawingData = (data: {
      from: Point;
      to: Point;
      color: string;
      brushSize: number;
      tool: string;
    }) => {
      console.log('🎨 Received drawing data from other player:', data);
      
      const prevCompositeOperation = ctx.globalCompositeOperation;
      const prevStrokeStyle = ctx.strokeStyle;
      const prevLineWidth = ctx.lineWidth;

      if (data.tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
      } else if (data.tool === 'fill') {
        floodFill(data.from.x, data.from.y, data.color, false);
        return;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = data.color;
      }
      
      ctx.lineWidth = data.brushSize;
      ctx.beginPath();
      ctx.moveTo(data.from.x, data.from.y);
      ctx.lineTo(data.to.x, data.to.y);
      ctx.stroke();

      // Restore previous settings
      ctx.globalCompositeOperation = prevCompositeOperation;
      ctx.strokeStyle = prevStrokeStyle;
      ctx.lineWidth = prevLineWidth;
    };

    const handleClearCanvas = () => {
      console.log('🧹 Received clear canvas from other player');
      clearCanvas(false);
    };

    const handleUndoCanvas = (data: { imageData: number[] }) => {
      console.log('↩️ Received undo from other player');
      if (!canvasRef.current) return;
      
      try {
        const canvas = canvasRef.current;
        const imageData = new ImageData(
          new Uint8ClampedArray(data.imageData),
          canvas.width,
          canvas.height
        );
        ctx.putImageData(imageData, 0, 0);
        console.log('✅ Undo applied successfully for other player');
      } catch (error) {
        console.error('❌ Error applying undo from other player:', error);
      }
    };

    const handleRedoCanvas = (data: { imageData: number[] }) => {
      console.log('↪️ Received redo from other player');
      if (!canvasRef.current) return;
      
      try {
        const canvas = canvasRef.current;
        const imageData = new ImageData(
          new Uint8ClampedArray(data.imageData),
          canvas.width,
          canvas.height
        );
        ctx.putImageData(imageData, 0, 0);
        console.log('✅ Redo applied successfully for other player');
      } catch (error) {
        console.error('❌ Error applying redo from other player:', error);
      }
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
    
    const canvas = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const newState: CanvasState = {
      imageData,
      timestamp: Date.now()
    };
    
    setUndoStack(prev => {
      const newStack = [...prev, newState];
      // Limit stack size to prevent memory issues
      return newStack.length > 50 ? newStack.slice(-50) : newStack;
    });
    
    // Clear redo stack when new action is performed
    setRedoStack([]);
  }, [ctx]);

  const floodFill = useCallback((startX: number, startY: number, fillColor: string, broadcast = true) => {
    if (!ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    const startPos = (Math.floor(startY) * canvas.width + Math.floor(startX)) * 4;
    const startR = data[startPos];
    const startG = data[startPos + 1];
    const startB = data[startPos + 2];
    const startA = data[startPos + 3];
    
    // Convert fill color to RGB
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d')!;
    tempCtx.fillStyle = fillColor;
    tempCtx.fillRect(0, 0, 1, 1);
    const fillData = tempCtx.getImageData(0, 0, 1, 1).data;
    const fillR = fillData[0];
    const fillG = fillData[1];
    const fillB = fillData[2];
    
    // Don't fill if colors are the same
    if (startR === fillR && startG === fillG && startB === fillB) return;
    
    const stack: [number, number][] = [[Math.floor(startX), Math.floor(startY)]];
    
    while (stack.length > 0) {
      const [currentX, currentY] = stack.pop()!;
      
      if (currentX < 0 || currentX >= canvas.width || currentY < 0 || currentY >= canvas.height) continue;
      
      const currentPos = (currentY * canvas.width + currentX) * 4;
      
      if (data[currentPos] !== startR || data[currentPos + 1] !== startG || 
          data[currentPos + 2] !== startB || data[currentPos + 3] !== startA) continue;
      
      data[currentPos] = fillR;
      data[currentPos + 1] = fillG;
      data[currentPos + 2] = fillB;
      data[currentPos + 3] = 255;
      
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
      if (e.touches.length === 0) return { x: 0, y: 0 };
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
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
    saveState();
  }, [isDrawing, ctx, tool, getPointerPosition, saveState, floodFill, color]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!drawing || !isDrawing || !ctx || !lastPoint || tool === 'fill') return;
    
    e.preventDefault();
    const currentPoint = getPointerPosition(e);
    
    ctx.beginPath();
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(currentPoint.x, currentPoint.y);
    ctx.stroke();
    
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
  }, [drawing, isDrawing, ctx, lastPoint, tool, getPointerPosition, socket, roomId, color, brushSize]);

  const endDrawing = useCallback(() => {
    setDrawing(false);
    setLastPoint(null);
  }, []);

  const clearCanvas = useCallback((broadcast = true) => {
    if (!ctx || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    saveState();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (broadcast && socket && roomId && isDrawing) {
      console.log('🧹 Broadcasting clear canvas to other players');
      socket.emit('clear', { roomId });
    }
  }, [ctx, saveState, socket, roomId, isDrawing]);

  const performUndo = useCallback((broadcast = true) => {
    if (!ctx || !canvasRef.current || undoStack.length <= 1) return;
    
    console.log('↩️ Performing undo operation');
    
    const currentState = undoStack[undoStack.length - 1];
    const previousState = undoStack[undoStack.length - 2];
    
    setRedoStack(prev => [...prev, currentState]);
    setUndoStack(prev => prev.slice(0, -1));
    
    ctx.putImageData(previousState.imageData, 0, 0);
    
    if (broadcast && socket && roomId && isDrawing) {
      console.log('↩️ Broadcasting undo to other players');
      const imageDataArray = Array.from(previousState.imageData.data);
      socket.emit('undo', { 
        roomId,
        imageData: imageDataArray
      });
    }
  }, [ctx, undoStack, socket, roomId, isDrawing]);

  const performRedo = useCallback((broadcast = true) => {
    if (!ctx || !canvasRef.current || redoStack.length === 0) return;
    
    console.log('↪️ Performing redo operation');
    
    const stateToRestore = redoStack[redoStack.length - 1];
    
    setUndoStack(prev => [...prev, stateToRestore]);
    setRedoStack(prev => prev.slice(0, -1));
    
    ctx.putImageData(stateToRestore.imageData, 0, 0);
    
    if (broadcast && socket && roomId && isDrawing) {
      console.log('↪️ Broadcasting redo to other players');
      const imageDataArray = Array.from(stateToRestore.imageData.data);
      socket.emit('redo', { 
        roomId,
        imageData: imageDataArray
      });
    }
  }, [ctx, redoStack, socket, roomId, isDrawing]);

  // Enhanced color palette with more colors
  const colorOptions = [
    // Basic colors
    '#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FF9900', '#9900FF', '#99FF00', '#FF0099',
    
    // Additional vibrant colors
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    
    // Dark colors
    '#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1',
    '#E74C3C', '#E67E22', '#F39C12', '#F1C40F', '#2ECC71', '#27AE60',
    
    // Pastel colors
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9', '#BAE1FF', '#E6BAFF',
    '#FFB3E6', '#C9BAFF', '#BAFFFF', '#FFBABA', '#D4BAFF', '#BAFFE6',
    
    // Professional colors
    '#8E44AD', '#9B59B6', '#3498DB', '#2980B9', '#1ABC9C', '#16A085',
    '#E8F8F5', '#D5F4E6', '#FDEAA7', '#F8D7DA', '#D1ECF1', '#D6EAF8'
  ];

  // Show appropriate overlay based on game state
  const renderOverlay = () => {
    // Only show overlay if game hasn't started yet
    if (!gameStarted) {
      return (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 pointer-events-none">
          <div className="text-center">
            <p className="text-gray-600 font-medium text-lg">
              Waiting for the game to start...
            </p>
          </div>
        </div>
      );
    }

    // No overlay during any game phase - let players see the canvas clearly
    return null;
  };

  const handleColorSelect = (selectedColor: string) => {
    setColor(selectedColor);
    setCustomColor(selectedColor);
    setShowColorPicker(false);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCustomColor(newColor);
    setColor(newColor);
  };

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
        
        {renderOverlay()}
      </div>
      
      {isDrawing && (
        <div className="flex items-center justify-center space-x-3 pt-3 pb-2 bg-gray-50 rounded-b-lg flex-wrap">
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
          
          <div className="relative">
            <button 
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors flex items-center justify-center"
              title="Colors"
            >
              <Palette size={18} style={{ color }}/>
            </button>
            
            {showColorPicker && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-white p-4 rounded-lg shadow-lg z-10 border max-w-xs">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-gray-700">Color Palette</h3>
                  <button
                    onClick={() => setShowColorPicker(false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <X size={16} />
                  </button>
                </div>
                
                {/* Custom Color Picker */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-600 mb-2">Custom Color</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={handleCustomColorChange}
                      className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                      title="Pick custom color"
                    />
                    <input
                      type="text"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                        if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
                          setColor(e.target.value);
                        }
                      }}
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-purple-500"
                      placeholder="#000000"
                      maxLength={7}
                    />
                  </div>
                </div>
                
                {/* Preset Colors */}
                <div className="grid grid-cols-8 gap-1 max-h-32 overflow-y-auto">
                  {colorOptions.map((c) => (
                    <button
                      key={c}
                      className={`w-6 h-6 rounded border-2 transition-transform hover:scale-110 ${
                        color === c ? 'border-gray-600 scale-110' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: c }}
                      onClick={() => handleColorSelect(c)}
                      title={c}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
          
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
          
          <button
            onClick={() => performUndo()}
            disabled={undoStack.length <= 1}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            title="Undo"
          >
            <Undo2 size={18} />
          </button>
          
          <button
            onClick={() => performRedo()}
            disabled={redoStack.length === 0}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            title="Redo"
          >
            <Redo2 size={18} />
          </button>
          
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