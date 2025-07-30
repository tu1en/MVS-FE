import { LinkOutlined } from '@ant-design/icons';
import { Button, Modal, Typography } from 'antd';
import { useState } from 'react';

const MaterialViewModal = ({ visible, material, onClose }) => {
  const [iframeError, setIframeError] = useState(false);

  console.log("🎭 MaterialViewModal render:", { visible, material: !!material });

  if (!material) {
    console.log("❌ MaterialViewModal: No material provided");
    return null;
  }

  const handleIframeError = () => {
    setIframeError(true);
    console.log("⚠️ Iframe error occurred");
  };

  // Check if the material is a YouTube video
  const isYoutubeVideo = material.contentType === 'video/youtube';
  
  // Special handling for markdown text content from lecture description
  const isMarkdownContent = !material.contentType;

  console.log("🔍 Material analysis:", {
    isYoutubeVideo,
    isMarkdownContent,
    type: material.type,
    contentType: material.contentType,
    url: material.url || material.downloadUrl
  });

  const renderContent = () => {
    if (material.type === 'pdf') {
      return (
        <div style={{ textAlign: 'center' }}>
          {!iframeError ? (
            <iframe
              src={material.url || material.downloadUrl}
              title={material.name}
              width="100%"
              height="500px"
              style={{ border: 'none' }}
              onError={handleIframeError}
              onLoad={(e) => {
                try {
                  const iframeDoc = e.target.contentDocument || e.target.contentWindow?.document;
                  if (!iframeDoc || iframeDoc.title === 'Example Domain' || 
                      iframeDoc.body?.textContent?.includes('Example Domain')) {
                    handleIframeError();
                  }
                } catch (error) {
                  console.log('Cross-origin iframe access (expected for external PDFs)');
                }
              }}
            />
          ) : (
            <div style={{ padding: '32px' }}>
              <p style={{ marginBottom: '16px' }}>❌ Không thể hiển thị PDF trong cửa sổ này</p>
              <p style={{ marginBottom: '16px' }}>Tài liệu PDF không cho phép nhúng hoặc có hạn chế bảo mật.</p>
              <Button 
                type="primary" 
                size="large" 
                icon={<LinkOutlined />} 
                onClick={() => window.open(material.url || material.downloadUrl, '_blank')}
              >
                Mở PDF trong tab mới
              </Button>
            </div>
          )}
        </div>
      );
    }

    if (isYoutubeVideo) {
      return (
        <div style={{ textAlign: 'center' }}>
          <Typography.Text type="secondary" style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}>
            Nếu video không hiển thị, có thể do trình chặn quảng cáo. Vui lòng thử "Mở trong tab mới".
          </Typography.Text>
          <iframe
            key={material.id}
            width="100%"
            height="450px"
            style={{ border: 'none' }}
            allowFullScreen
            src={material.downloadUrl}
            title={material.name || "YouTube Video"}
            onError={() => {
              console.error('Không thể tải video YouTube');
            }}
          />
        </div>
      );
    }

    if (material.type === 'video' && !isYoutubeVideo) {
      return (
        <video
          src={material.url || material.downloadUrl}
          controls
          width="100%"
          height="auto"
          style={{ maxHeight: '500px' }}
          onError={() => {
            console.error('Không thể tải video');
          }}
        />
      );
    }

    if (material.type === 'link') {
      return (
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <p>📄 Tài liệu trực tuyến</p>
          <p style={{ marginBottom: '16px' }}>Nhấn để mở tài liệu trong tab mới:</p>
          <Button 
            type="primary" 
            size="large" 
            icon={<LinkOutlined />} 
            onClick={() => window.open(material.url || material.downloadUrl, '_blank')}
          >
            Mở liên kết
          </Button>
        </div>
      );
    }

    if (material.type === 'doc') {
      return (
        <div style={{ textAlign: 'center', padding: '32px' }}>
          <p>📄 Tài liệu văn bản</p>
          <p style={{ marginBottom: '16px' }}>Nhấn để mở hoặc tải xuống tài liệu:</p>
          <Button 
            type="primary" 
            size="large" 
            icon={<LinkOutlined />} 
            onClick={() => window.open(material.url || material.downloadUrl, '_blank')}
          >
            Mở tài liệu
          </Button>
        </div>
      );
    }

    // Default fallback
    return (
      <div style={{ textAlign: 'center', padding: '32px' }}>
        <p>📄 {material.name}</p>
        <p style={{ marginBottom: '16px' }}>Loại: {material.contentType || 'Không xác định'}</p>
        <Button 
          type="primary" 
          size="large" 
          icon={<LinkOutlined />} 
          onClick={() => window.open(material.url || material.downloadUrl, '_blank')}
        >
          Mở trong tab mới
        </Button>
      </div>
    );
  };

  return (
    <Modal
      title={material.name}
      open={visible}
      onCancel={() => {
        console.log("🚪 MaterialViewModal onCancel called");
        setIframeError(false);
        onClose();
      }}
      width={800}
      style={{ zIndex: 1000 }}
      maskStyle={{ zIndex: 999 }}
      footer={[
        <Button 
          key="open-new" 
          type="primary" 
          icon={<LinkOutlined />} 
          onClick={() => window.open(material.url || material.downloadUrl, '_blank')}
        >
          Mở trong tab mới
        </Button>,
        <Button 
          key="close" 
          onClick={() => {
            console.log("🚪 MaterialViewModal close button clicked");
            setIframeError(false);
            onClose();
          }}
        >
          Đóng
        </Button>
      ]}
    >
      {renderContent()}
    </Modal>
  );
};

export default MaterialViewModal;
