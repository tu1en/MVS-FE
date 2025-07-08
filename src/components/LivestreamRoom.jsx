import { JitsiMeeting } from '@jitsi/react-sdk';
import { Alert, Button, Form, Input, message, Modal, Spin } from 'antd';
import React, { useEffect, useState } from 'react';
import livestreamService from '../services/livestreamService';

const LivestreamRoom = ({ lectureId, isTeacher }) => {
  const [roomDetails, setRoomDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRecordingModal, setShowRecordingModal] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState('');
  const [savingRecording, setSavingRecording] = useState(false);
  const [form] = Form.useForm();

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

  const handleApiReady = (api) => {
    // Xử lý sự kiện từ Jitsi Meet API
    api.on('videoConferenceLeft', () => {
      // Người dùng rời khỏi phòng
      if (isTeacher && roomDetails) {
        // Giáo viên kết thúc phiên học
        livestreamService.endLivestream(roomDetails.id)
          .then(() => {
            // Hiển thị form để thêm liên kết ghi âm
            setShowRecordingModal(true);
          })
          .catch(err => {
            console.error('Error ending livestream session:', err);
          });
      }
    });

    // Thêm lớp CSS cho container Jitsi
    const iframe = api.getIFrame();
    if (iframe) {
      iframe.style.height = '600px';
      iframe.style.width = '100%';
      iframe.style.border = 'none';
    }
  };
  
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

  return (
    <>
      <div className="livestream-container">
        <JitsiMeeting
          domain="meet.jit.si"
          roomName={roomDetails.roomName}
          jwt={roomDetails.jwt}
          configOverwrite={{
            startWithAudioMuted: !isTeacher,
            startWithVideoMuted: !isTeacher,
            prejoinPageEnabled: false,
            disableDeepLinking: true,
            toolbarButtons: [
              'microphone', 'camera', 'desktop', 'chat',
              'raisehand', 'participants-pane', 'tileview',
              ...(isTeacher ? ['livestreaming', 'recording'] : [])
            ]
          }}
          interfaceConfigOverwrite={{
            SHOW_JITSI_WATERMARK: false,
            APP_NAME: 'Classroom Livestream',
            NATIVE_APP_NAME: 'Classroom Livestream',
            DEFAULT_BACKGROUND: '#ffffff',
            DISABLE_VIDEO_BACKGROUND: true,
          }}
          userInfo={{
            displayName: localStorage.getItem('username') || 'Học viên',
            email: localStorage.getItem('email') || ''
          }}
          onApiReady={handleApiReady}
          getIFrameRef={(node) => {
            if (node) {
              node.style.height = '600px';
              node.style.width = '100%';
              node.style.border = 'none';
            }
          }}
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