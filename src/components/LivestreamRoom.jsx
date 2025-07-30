import { Alert, Button, Form, Input, message, Modal, Spin, Tabs } from 'antd';
import React, { useEffect, useState } from 'react';
import livestreamService from '../services/livestreamService';
import VideoConference from './VideoConference';
import LivestreamBroadcaster from './LivestreamBroadcaster';
import LivestreamViewer from './LivestreamViewer';
import RecordingManager from './RecordingManager';

const LivestreamRoom = ({ lectureId, isTeacher }) => {
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('livestream');
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [savingRecording, setSavingRecording] = useState(false);
  const [form] = Form.useForm();

  // Get user info
  const userId = localStorage.getItem('userId');
  const userName = localStorage.getItem('username') || (isTeacher ? 'Giáo viên' : 'Học viên');

  useEffect(() => {
    const fetchOrCreateRoom = async () => {
      try {
        let data;
        if (isTeacher) {
          // Giáo viên tạo phòng mới
          data = await livestreamService.createLivestream({ lectureId });
        } else {
          // Sinh viên tham gia phòng đã tạo
          data = await livestreamService.getActiveLivestreamForLecture(lectureId);
        }

        if (!data) {
          setError('Không có buổi học trực tuyến nào đang diễn ra.');
          setLoading(false);
          return;
        }
        
        setRoomDetails(data);
      } catch (err) {
        console.error('Error fetching livestream data:', err);
        setError(err.message || 'Có lỗi xảy ra khi kết nối đến phòng học');
      } finally {
        setLoading(false);
      }
    };

    fetchOrCreateRoom();
  }, [lectureId, isTeacher]);

  const handleRecordingSubmit = async () => {
    if (!recordingUrl) {
      message.error('Vui lòng nhập liên kết ghi âm');
      return;
    }
    
    try {
      setSavingRecording(true);
      await livestreamService.updateRecordingUrl(roomDetails.id, recordingUrl);
      message.success('Đã lưu liên kết ghi âm thành công');
      setShowRecordingModal(false);
    } catch (err) {
      console.error('Error saving recording URL:', err);
      message.error('Không thể lưu liên kết ghi âm');
    } finally {
      setSavingRecording(false);
    }
  };

  const handleLivestreamEnd = () => {
    setShowRecordingModal(true);
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
      <Spin size="large" tip="Đang chuẩn bị phòng học trực tuyến..." />
    </div>
  );
  
  if (error) return (
    <Alert
      message="Không thể tham gia phòng học"
      description={error}
      type="error"
      showIcon
    />
  );
  
  if (!roomDetails) return null;

  // Tab items
  const tabItems = [
    {
      key: 'livestream',
      label: isTeacher ? 'Phát trực tiếp' : 'Xem livestream',
      children: isTeacher ? (
        <LivestreamBroadcaster
          lectureId={lectureId}
          userId={userId}
          userName={userName}
          onEnd={handleLivestreamEnd}
        />
      ) : (
        <LivestreamViewer
          streamId={`lecture-${lectureId}`}
          userId={userId}
          userName={userName}
          streamInfo={{
            title: roomDetails.title || 'Buổi học trực tuyến',
            description: roomDetails.description
          }}
        />
      )
    },
    {
      key: 'conference',
      label: 'Video Conference',
      children: (
        <VideoConference
          roomId={`conference-${lectureId}`}
          userId={userId}
          isTeacher={isTeacher}
        />
      )
    },
    {
      key: 'recordings',
      label: 'Bản ghi',
      children: (
        <RecordingManager
          lectureId={lectureId}
          isTeacher={isTeacher}
        />
      )
    }
  ];

  return (
    <>
      <div className="livestream-container">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
          size="large"
          style={{ height: '100vh' }}
        />
      </div>
      
      <Modal
        title="Lưu bản ghi buổi học"
        open={showRecordingModal}
        onCancel={() => setShowRecordingModal(false)}
        footer={[
          <Button key="cancel" onClick={() => setShowRecordingModal(false)}>
            Để sau
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={savingRecording} 
            onClick={handleRecordingSubmit}
          >
            Lưu liên kết
          </Button>
        ]}
      >
        <p>Nếu bạn đã ghi lại buổi học, vui lòng nhập liên kết video để sinh viên có thể xem lại:</p>
        <Input
          placeholder="https://youtu.be/xxxxxxxx"
          value={recordingUrl}
          onChange={(e) => setRecordingUrl(e.target.value)}
          style={{ marginTop: 16 }}
        />
        <p style={{ marginTop: 8, fontSize: '0.9em', color: '#888' }}>
          Bạn có thể sử dụng liên kết từ YouTube, Google Drive hoặc bất kỳ dịch vụ video nào khác.
        </p>
      </Modal>
    </>
  );
};

export default LivestreamRoom;
