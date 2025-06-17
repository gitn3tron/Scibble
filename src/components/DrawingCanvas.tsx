st startG = data[startIndex + 1];
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
      socket.emit('clear', { roomId });
    }
  }, [ctx, saveState, socket, roomId, isDrawing]);

  const undo = useCallback(() => {
    if (!ctx || !canvasRef.current || undoStack.length <= 1) return;
    
    const currentState = undoStack[undoStack.length - 1];
    const previousState = undoStack[undoStack.length - 2];
    
    setRedoStack(prev => [...prev, currentState]);
    setUndoStack(prev => prev.slice(0, -1));
    
    ctx.putImageData(previousState.imageData, 0, 0);
  }, [ctx, undoStack]);

  const redo = useCallback(() => {
    if (!ctx || !canvasRef.current || redoStack.length === 0) return;
    
    const stateToRestore = redoStack[redoStack.length - 1];
    
    setUndoStack(prev => [...prev, stateToRestore]);
    setRedoStack(prev => prev.slice(0, -1));
    
    ctx.putImageData(stateToRestore.imageData, 0, 0);
  }, [ctx, redoStack]);

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