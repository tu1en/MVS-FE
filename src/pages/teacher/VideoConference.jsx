import { ArrowLeftOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { Alert, Button, Card, Input, Space, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import VideoConference from '../../components/VideoConference';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;

const VideoConferencePage = () => {
  const { roomId: urlRoomId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [roomId, setRoomId] = useState(urlRoomId || '');
  const [isJoined, setIsJoined] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      // Simulate joining delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsJoined(true);
    } catch (error) {
      console.error('Failed to join room:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLeaveRoom = () => {
    setIsJoined(false);
    setRoomId('');
    navigate('/teacher/dashboard');
  };

  useEffect(() => {
    if (urlRoomId) {
      setRoomId(urlRoomId);
      handleJoinRoom();
    }
  }, [urlRoomId]);

  if (isJoined) {
    return (
      <VideoConference
        roomId={roomId}
        userId={user?.id || 'teacher-' + Date.now()}
        userName={user?.name || 'Teacher'}
        isTeacher={true}
        onLeave={handleLeaveRoom}
      />
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="mb-4">
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/teacher/dashboard')}
          className="mb-4"
        >
          Quay lại Dashboard
        </Button>
      </div>

      <Card className="shadow-lg">
        <div className="text-center mb-6">
          <VideoCameraOutlined className="text-6xl text-blue-500 mb-4" />
          <Title level={2}>Video Conference</Title>
          <Text type="secondary">
            Tham gia hoặc tạo phòng họp video để giảng dạy trực tuyến
          </Text>
        </div>

        <Space direction="vertical" className="w-full" size="large">
          <div>
            <Text strong>Room ID:</Text>
            <Input
              placeholder="Nhập Room ID hoặc để trống để tạo phòng mới"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              size="large"
              className="mt-2"
            />
          </div>

          <Alert
            message="Hướng dẫn sử dụng"
            description={
              <ul className="list-disc list-inside mt-2">
                <li>Nhập Room ID để tham gia phòng có sẵn</li>
                <li>Để trống để tự động tạo phòng mới</li>
                <li>Chia sẻ Room ID với học sinh để họ tham gia</li>
                <li>Đảm bảo camera và microphone được cho phép</li>
              </ul>
            }
            type="info"
            showIcon
          />

          <Button
            type="primary"
            size="large"
            icon={<VideoCameraOutlined />}
            loading={isLoading}
            onClick={handleJoinRoom}
            className="w-full"
            disabled={!roomId.trim() && !user}
          >
            {isLoading ? 'Đang tham gia...' : 'Tham gia phòng họp'}
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default VideoConferencePage; 