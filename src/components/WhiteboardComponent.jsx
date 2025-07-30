import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Button, 
  Space, 
  Popover, 
  Slider, 
  Typography, 
  Row, 
  Col,
  Tooltip,
  Card,
  Divider
} from 'antd';
import {
  EditOutlined,
  ClearOutlined,
  UndoOutlined,
  RedoOutlined,
  BgColorsOutlined,
  LineOutlined,
  SaveOutlined,
  DownloadOutlined,
  ExpandOutlined
} from '@ant-design/icons';

const { Text } = Typography;

/**
 * Whiteboard Component - Bảng vẽ tương tác realtime
 * Hỗ trợ vẽ, xóa, undo/redo, sync realtime giữa participants
 */
const WhiteboardComponent = ({ roomId, sendMessage, userRole }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState('pen');
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 400 });
  const [drawingHistory, setDrawingHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isExpanded, setIsExpanded] = useState(false);

  // Drawing data buffer for realtime sync
  const drawingBuffer = useRef([]);
  const lastSyncTime = useRef(Date.now());

  // Predefined colors
  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
    '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
  ];

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (canvas && container) {
      // Set canvas size based on container
      const rect = container.getBoundingClientRect();
      const newWidth = isExpanded ? rect.width : Math.min(rect.width, 800);
      const newHeight = isExpanded ? rect.height : Math.min(rect.height, 400);
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      setCanvasSize({ width: newWidth, height: newHeight });
      
      // Initialize context
      const ctx = canvas.getContext('2d');
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, newWidth, newHeight);
      
      // Save initial state
      saveToHistory();
    }
  }, [isExpanded]);

  // Listen for resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      if (canvas && container) {
        const rect = container.getBoundingClientRect();
        const newWidth = isExpanded ? rect.width : Math.min(rect.width, 800);
        const newHeight = isExpanded ? rect.height : Math.min(rect.height, 400);
        
        if (newWidth !== canvasSize.width || newHeight !== canvasSize.height) {
          setCanvasSize({ width: newWidth, height: newHeight });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasSize, isExpanded]);

  // Listen for whiteboard sync messages
  useEffect(() => {
    const handleWhiteboardMessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === 'whiteboard-draw' && data.roomId === roomId) {
          drawRemoteStroke(data.drawingData);
        } else if (data.type === 'whiteboard-clear' && data.roomId === roomId) {
          clearCanvas(false); // Don't broadcast when receiving
        }
      } catch (error) {
        console.error('Error parsing whiteboard message:', error);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('websocket-message', handleWhiteboardMessage);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('websocket-message', handleWhiteboardMessage);
      }
    };
  }, [roomId]);

  /**
   * Save canvas state to history
   */
  const saveToHistory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL();
    const newHistory = drawingHistory.slice(0, historyIndex + 1);
    newHistory.push(imageData);
    
    // Limit history size
    if (newHistory.length > 50) {
      newHistory.shift();
    } else {
      setHistoryIndex(prev => prev + 1);
    }
    
    setDrawingHistory(newHistory);
  };

  /**
   * Get mouse/touch position relative to canvas
   */
  const getCanvasPosition = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.clientX || (e.touches && e.touches[0]?.clientX);
    const clientY = e.clientY || (e.touches && e.touches[0]?.clientY);
    
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  };

  /**
   * Start drawing
   */
  const startDrawing = (e) => {
    if (userRole === 'STUDENT' && currentTool !== 'pen') {
      // Students can only use pen tool
      return;
    }

    setIsDrawing(true);
    const pos = getCanvasPosition(e);
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    
    // Initialize drawing data for sync
    drawingBuffer.current = [{
      x: pos.x,
      y: pos.y,
      tool: currentTool,
      color: strokeColor,
      width: strokeWidth,
      type: 'start'
    }];
  };

  /**
   * Continue drawing
   */
  const draw = (e) => {
    if (!isDrawing) return;
    
    const pos = getCanvasPosition(e);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    ctx.globalCompositeOperation = currentTool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = currentTool === 'eraser' ? '#ffffff' : strokeColor;
    ctx.lineWidth = currentTool === 'eraser' ? strokeWidth * 2 : strokeWidth;
    
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    
    // Add to drawing buffer
    drawingBuffer.current.push({
      x: pos.x,
      y: pos.y,
      tool: currentTool,
      color: strokeColor,
      width: strokeWidth,
      type: 'draw'
    });
    
    // Sync with other participants (throttled)
    const now = Date.now();
    if (now - lastSyncTime.current > 50) { // Sync every 50ms
      syncDrawing();
      lastSyncTime.current = now;
    }
  };

  /**
   * Stop drawing
   */
  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    // Final sync
    if (drawingBuffer.current.length > 0) {
      drawingBuffer.current.push({ type: 'end' });
      syncDrawing();
      drawingBuffer.current = [];
    }
    
    // Save to history
    setTimeout(() => saveToHistory(), 100);
  };

  /**
   * Sync drawing data with other participants
   */
  const syncDrawing = () => {
    if (drawingBuffer.current.length === 0 || !sendMessage) return;

    const drawingData = {
      type: 'whiteboard-draw',
      roomId: roomId,
      drawingData: [...drawingBuffer.current],
      timestamp: Date.now()
    };

    sendMessage(drawingData);
    drawingBuffer.current = [];
  };

  /**
   * Draw remote stroke from other participants
   */
  const drawRemoteStroke = (drawingData) => {
    const canvas = canvasRef.current;
    if (!canvas || !drawingData) return;

    const ctx = canvas.getContext('2d');
    
    drawingData.forEach((point, index) => {
      if (point.type === 'start') {
        ctx.beginPath();
        ctx.moveTo(point.x, point.y);
        ctx.globalCompositeOperation = point.tool === 'eraser' ? 'destination-out' : 'source-over';
        ctx.strokeStyle = point.tool === 'eraser' ? '#ffffff' : point.color;
        ctx.lineWidth = point.tool === 'eraser' ? point.width * 2 : point.width;
      } else if (point.type === 'draw') {
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
      }
    });
  };

  /**
   * Clear canvas
   */
  const clearCanvas = (broadcast = true) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    if (broadcast && sendMessage) {
      sendMessage({
        type: 'whiteboard-clear',
        roomId: roomId,
        timestamp: Date.now()
      });
    }
    
    // Save to history
    setTimeout(() => saveToHistory(), 100);
  };

  /**
   * Undo last action
   */
  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(prev => prev - 1);
      loadFromHistory(historyIndex - 1);
    }
  };

  /**
   * Redo last action
   */
  const redo = () => {
    if (historyIndex < drawingHistory.length - 1) {
      setHistoryIndex(prev => prev + 1);
      loadFromHistory(historyIndex + 1);
    }
  };

  /**
   * Load canvas state from history
   */
  const loadFromHistory = (index) => {
    if (index < 0 || index >= drawingHistory.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    
    img.src = drawingHistory[index];
  };

  /**
   * Save canvas as image
   */
  const saveCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement('a');
    link.download = `whiteboard_${roomId}_${new Date().getTime()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  /**
   * Color picker content
   */
  const colorPickerContent = (
    <div style={{ width: '200px' }}>
      <Row gutter={[4, 4]}>
        {colors.map(color => (
          <Col span={4} key={color}>
            <Button
              style={{ 
                width: '100%',
                height: '32px',
                backgroundColor: color,
                border: strokeColor === color ? '2px solid #1890ff' : '1px solid #d9d9d9'
              }}
              onClick={() => setStrokeColor(color)}
            />
          </Col>
        ))}
      </Row>
      
      <Divider style={{ margin: '8px 0' }} />
      
      <div>
        <Text strong>Tùy chỉnh màu:</Text>
        <input
          type="color"
          value={strokeColor}
          onChange={(e) => setStrokeColor(e.target.value)}
          style={{ 
            width: '100%',
            height: '32px',
            border: 'none',
            marginTop: '4px'
          }}
        />
      </div>
    </div>
  );

  /**
   * Stroke width content
   */
  const strokeWidthContent = (
    <div style={{ width: '150px' }}>
      <Text strong>Độ dày nét: {strokeWidth}px</Text>
      <Slider
        min={1}
        max={20}
        value={strokeWidth}
        onChange={setStrokeWidth}
        style={{ marginTop: '8px' }}
      />
      <div style={{ marginTop: '8px' }}>
        <div
          style={{
            width: '100%',
            height: `${strokeWidth}px`,
            backgroundColor: strokeColor,
            borderRadius: strokeWidth / 2
          }}
        />
      </div>
    </div>
  );

  return (
    <div 
      ref={containerRef}
      style={{ 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#f5f5f5'
      }}
    >
      {/* Toolbar */}
      <div style={{ 
        padding: '8px 12px',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px'
      }}>
        <Space wrap>
          {/* Drawing Tools */}
          <Button
            type={currentTool === 'pen' ? 'primary' : 'default'}
            icon={<EditOutlined />}
            size="small"
            onClick={() => setCurrentTool('pen')}
          >
            Bút
          </Button>
          
          {userRole === 'TEACHER' && (
            <Button
              type={currentTool === 'eraser' ? 'primary' : 'default'}
              icon={<ClearOutlined />}
              size="small"
              onClick={() => setCurrentTool('eraser')}
            >
              Tẩy
            </Button>
          )}
          
          {/* Color Picker */}
          <Popover
            content={colorPickerContent}
            title="Chọn màu"
            trigger="click"
            placement="bottom"
          >
            <Button
              icon={<BgColorsOutlined />}
              size="small"
              style={{
                borderColor: strokeColor,
                color: strokeColor
              }}
            >
              Màu
            </Button>
          </Popover>
          
          {/* Stroke Width */}
          <Popover
            content={strokeWidthContent}
            title="Độ dày nét"
            trigger="click"
            placement="bottom"
          >
            <Button
              icon={<LineOutlined />}
              size="small"
            >
              {strokeWidth}px
            </Button>
          </Popover>
        </Space>

        <Space wrap>
          {/* History Controls */}
          <Tooltip title="Hoàn tác">
            <Button
              icon={<UndoOutlined />}
              size="small"
              onClick={undo}
              disabled={historyIndex <= 0}
            />
          </Tooltip>
          
          <Tooltip title="Làm lại">
            <Button
              icon={<RedoOutlined />}
              size="small"
              onClick={redo}
              disabled={historyIndex >= drawingHistory.length - 1}
            />
          </Tooltip>
          
          {userRole === 'TEACHER' && (
            <Tooltip title="Xóa tất cả">
              <Button
                icon={<ClearOutlined />}
                size="small"
                danger
                onClick={() => clearCanvas(true)}
              />
            </Tooltip>
          )}
          
          {/* Save */}
          <Tooltip title="Lưu ảnh">
            <Button
              icon={<SaveOutlined />}
              size="small"
              onClick={saveCanvas}
            />
          </Tooltip>
          
          {/* Expand */}
          <Tooltip title={isExpanded ? "Thu nhỏ" : "Phóng to"}>
            <Button
              icon={<ExpandOutlined />}
              size="small"
              onClick={() => setIsExpanded(!isExpanded)}
            />
          </Tooltip>
        </Space>
      </div>

      {/* Canvas */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '8px',
        overflow: isExpanded ? 'hidden' : 'auto'
      }}>
        <Card
          style={{ 
            padding: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            width: isExpanded ? '100%' : 'auto',
            height: isExpanded ? '100%' : 'auto'
          }}
          bodyStyle={{ padding: 0 }}
        >
          <canvas
            ref={canvasRef}
            width={canvasSize.width}
            height={canvasSize.height}
            style={{
              display: 'block',
              cursor: currentTool === 'pen' ? 'crosshair' : 
                     currentTool === 'eraser' ? 'not-allowed' : 'default',
              touchAction: 'none',
              width: isExpanded ? '100%' : 'auto',
              height: isExpanded ? '100%' : 'auto'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
        </Card>
      </div>

      {/* Status Bar */}
      <div style={{ 
        padding: '4px 12px',
        background: '#fafafa',
        borderTop: '1px solid #f0f0f0',
        fontSize: '11px',
        color: '#666',
        display: 'flex',
        justifyContent: 'space-between'
      }}>
        <span>
          Công cụ: {currentTool === 'pen' ? 'Bút vẽ' : 'Tẩy'} | 
          Màu: {strokeColor} | 
          Độ dày: {strokeWidth}px
        </span>
        <span>
          Kích thước: {canvasSize.width}×{canvasSize.height}
        </span>
      </div>
    </div>
  );
};

export default WhiteboardComponent;