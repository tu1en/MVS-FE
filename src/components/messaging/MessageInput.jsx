import React, { useState, useRef, useEffect } from 'react';
import { Input, Button, Space, Upload, Tooltip, message } from 'antd';
import { SendOutlined, PaperClipOutlined, SmileOutlined } from '@ant-design/icons';

const { TextArea } = Input;

/**
 * Unified MessageInput component for both student and teacher messaging interfaces
 * Provides consistent message input functionality with optional features
 */
const MessageInput = ({
  value = '',
  onChange,
  onSend,
  placeholder = 'Nhập tin nhắn...',
  disabled = false,
  loading = false,
  maxLength = 1000,
  showCharCount = true,
  showAttachment = false,
  showEmoji = false,
  autoFocus = false,
  rows = 1,
  maxRows = 4,
  className = '',
  style = {},
  onAttachmentUpload,
  onKeyPress
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isComposing, setIsComposing] = useState(false);
  const textAreaRef = useRef(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (autoFocus && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [autoFocus]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
  };

  const handleSend = () => {
    if (!inputValue.trim() || loading || disabled) {
      return;
    }

    onSend?.(inputValue.trim());
    setInputValue('');
    onChange?.('');
    
    // Focus back to input after sending
    setTimeout(() => {
      if (textAreaRef.current) {
        textAreaRef.current.focus();
      }
    }, 100);
  };

  const handleKeyPress = (e) => {
    // Call custom onKeyPress handler if provided
    onKeyPress?.(e);

    // Handle Enter key for sending (Shift+Enter for new line)
    if (e.key === 'Enter' && !e.shiftKey && !isComposing) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const handleAttachmentChange = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'done') {
      message.success(`${info.file.name} đã tải lên thành công`);
      onAttachmentUpload?.(info.file);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} tải lên thất bại`);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      const isValidSize = file.size / 1024 / 1024 < 10; // 10MB limit
      if (!isValidSize) {
        message.error('Kích thước file phải nhỏ hơn 10MB!');
        return false;
      }
      return true;
    },
    onChange: handleAttachmentChange
  };

  const canSend = inputValue.trim().length > 0 && !loading && !disabled;

  return (
    <div 
      className={`message-input-container ${className}`}
      style={{
        padding: '12px 16px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fafafa',
        ...style
      }}
    >
      <Space.Compact style={{ width: '100%' }}>
        {/* Optional attachment button */}
        {showAttachment && (
          <Upload {...uploadProps}>
            <Tooltip title="Đính kèm file">
              <Button 
                icon={<PaperClipOutlined />}
                disabled={disabled || loading}
                style={{ 
                  height: 'auto',
                  minHeight: '32px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              />
            </Tooltip>
          </Upload>
        )}

        {/* Message input */}
        <TextArea
          ref={textAreaRef}
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
          placeholder={placeholder}
          disabled={disabled}
          maxLength={maxLength}
          showCount={showCharCount}
          autoSize={{ 
            minRows: rows, 
            maxRows: maxRows 
          }}
          style={{
            resize: 'none',
            borderRadius: showAttachment || showEmoji ? '0' : '6px 0 0 6px'
          }}
        />

        {/* Optional emoji button */}
        {showEmoji && (
          <Tooltip title="Chọn emoji">
            <Button 
              icon={<SmileOutlined />}
              disabled={disabled || loading}
              style={{ 
                height: 'auto',
                minHeight: '32px',
                display: 'flex',
                alignItems: 'center'
              }}
              onClick={() => {
                // Placeholder for emoji picker functionality
                message.info('Tính năng emoji sẽ được thêm trong phiên bản tới');
              }}
            />
          </Tooltip>
        )}

        {/* Send button */}
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={!canSend}
          loading={loading}
          style={{
            height: 'auto',
            minHeight: '32px',
            display: 'flex',
            alignItems: 'center',
            borderRadius: '0 6px 6px 0'
          }}
        >
          Gửi
        </Button>
      </Space.Compact>

      {/* Character count display */}
      {showCharCount && maxLength && (
        <div style={{ 
          textAlign: 'right', 
          marginTop: '4px',
          fontSize: '12px',
          color: inputValue.length > maxLength * 0.8 ? '#ff4d4f' : '#8c8c8c'
        }}>
          {inputValue.length}/{maxLength}
        </div>
      )}

      {/* Send hint */}
      <div style={{ 
        textAlign: 'right', 
        marginTop: '4px',
        fontSize: '11px',
        color: '#bfbfbf'
      }}>
        Enter để gửi, Shift+Enter để xuống dòng
      </div>
    </div>
  );
};

export default MessageInput;
