import React, { useRef, useEffect } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined, FileOutlined } from '@ant-design/icons';
import './WysiwygEditor.css';
import FileUploadService from '../../services/fileUploadService';

const WysiwygEditor = ({ 
  value, 
  onChange, 
  placeholder = "Nhập nội dung...",
  height = "300px",
  allowFileUpload = false,
  onFileUpload = null,
  className = ""
}) => {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current && onChange) {
      const content = editorRef.current.innerHTML;
      onChange(content);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const formatText = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  const insertImage = (url) => {
    const img = `<img src="${url}" style="max-width: 100%; height: auto;" alt="Inserted image" />`;
    document.execCommand('insertHTML', false, img);
    handleInput();
  };

  const handleFileUploadChange = (info) => {
    if (info.file.status === 'uploading') {
      return;
    }
    
    if (info.file.status === 'done') {
      const fileData = info.file.response;
      if (fileData && fileData.url) {
        if (info.file.type && info.file.type.startsWith('image/')) {
          insertImage(fileData.url);
        } else {
          const link = `<a href="${fileData.url}" target="_blank" rel="noopener noreferrer" class="file-attachment"><span class="file-icon"><FileOutlined /></span>${fileData.name || info.file.name}</a>`;
          document.execCommand('insertHTML', false, link);
          handleInput();
        }
      }
      if (onFileUpload) {
        onFileUpload(fileData);
      }
    }
    
    if (info.file.status === 'error') {
      message.error('Tải file lên thất bại!');
    }
  };

  const buttonStyle = {
    border: '1px solid #d9d9d9',
    background: 'white',
    padding: '4px 8px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '14px'
  };

  return (
    <div className={`wysiwyg-editor ${className}`}>
      {/* Toolbar */}
      <div className="wysiwyg-toolbar">
        <button
          type="button"
          style={buttonStyle}
          onClick={() => formatText('bold')}
          title="Đậm (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => formatText('italic')}
          title="Nghiêng (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => formatText('underline')}
          title="Gạch chân (Ctrl+U)"
        >
          <u>U</u>
        </button>
        
        <div className="toolbar-divider" />
        
        <button
          type="button"
          style={buttonStyle}
          onClick={() => formatText('insertUnorderedList')}
          title="Danh sách không đánh số"
        >
          •
        </button>
        <button
          type="button"
          style={buttonStyle}
          onClick={() => formatText('insertOrderedList')}
          title="Danh sách đánh số"
        >
          1.
        </button>
        
        <div className="toolbar-divider" />
        
        <select
          onChange={(e) => formatText('formatBlock', e.target.value)}
          style={{ ...buttonStyle, padding: '4px' }}
          defaultValue=""
        >
          <option value="">Định dạng</option>
          <option value="h1">Tiêu đề 1</option>
          <option value="h2">Tiêu đề 2</option>
          <option value="h3">Tiêu đề 3</option>
          <option value="p">Đoạn văn</option>
        </select>

        {allowFileUpload && (
          <>
            <div className="toolbar-divider" />
            <Upload
              name="file"
              customRequest={(options) => FileUploadService.uploadFile(options, 'wysiwyg-editor')}
              onChange={handleFileUploadChange}
              showUploadList={false}
              accept="image/*,.pdf,.doc,.docx,.txt"
            >
              <Button 
                type="link" 
                size="small" 
                icon={<UploadOutlined />}
                style={{ padding: '0 4px' }}
                title="Tải lên hình ảnh/file"
              >
                File
              </Button>
            </Upload>
          </>
        )}
      </div>

      {/* Editor Content */}
      <div
        ref={editorRef}
        contentEditable
        className="wysiwyg-content"
        style={{ minHeight: height }}
        onInput={handleInput}
        onPaste={handlePaste}
        data-placeholder={placeholder}
        dangerouslySetInnerHTML={{ __html: value || '' }}
        suppressContentEditableWarning={true}
      />
    </div>
  );
};

export default WysiwygEditor;