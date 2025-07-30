import React, { useState, useEffect } from 'react';
import {
  Modal,
  List,
  Switch,
  Avatar,
  Typography,
  Space,
  Button,
  Badge,
  Divider,
  Card,
  Row,
  Col,
  Tooltip,
  message,
  Popconfirm,
  Tag,
  Empty
} from 'antd';
import {
  VideoCameraOutlined,
  AudioOutlined,
  DesktopOutlined,
  EditOutlined,
  MessageOutlined,
  UserOutlined,
  CrownOutlined,
  CloseCircleOutlined,
  CheckCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

/**
 * Permission Panel - Quản lý quyền của participants (Teacher only)
 * Cho phép Teacher control mic, camera, screen share, chat, whiteboard permissions
 */
const PermissionPanel = ({ 
  visible, 
  onClose, 
  participants = [], 
  roomId, 
  sendMessage 
}) => {
  const [participantPermissions, setParticipantPermissions] = useState({});
  const [globalPermissions, setGlobalPermissions] = useState({
    allowCamera: true,
    allowMicrophone: true,
    allowScreenShare: false,
    allowChat: true,
    allowWhiteboard: false,
    allowFileUpload: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize permissions for all participants
    const initialPermissions = {};
    participants.forEach(participant => {
      if (participant.role !== 'TEACHER') {
        initialPermissions[participant.id] = {
          camera: true,
          microphone: true,
          screenShare: false,
          chat: true,
          whiteboard: false,
          fileUpload: false,
          isActive: true,
          joinTime: new Date(),
          violations: 0
        };
      }
    });
    setParticipantPermissions(initialPermissions);
  }, [participants]);

  /**
   * Update individual participant permission
   */
  const updateParticipantPermission = (participantId, permission, value) => {
    setParticipantPermissions(prev => ({
      ...prev,
      [participantId]: {
        ...prev[participantId],
        [permission]: value
      }
    }));

    // Send permission update to participant
    const permissionMessage = {
      type: 'permission-update',
      roomId: roomId,
      targetUserId: participantId,
      permission: permission,
      value: value,
      timestamp: new Date().toISOString()
    };

    if (sendMessage) {
      sendMessage(permissionMessage);
    }

    // Show notification
    const participant = participants.find(p => p.id === participantId);
    const permissionName = getPermissionDisplayName(permission);
    message.info(
      `${value ? 'Đã cho phép' : 'Đã tắt'} ${permissionName} cho ${participant?.name || 'Người dùng'}`
    );
  };

  /**
   * Update global permissions (apply to all participants)
   */
  const updateGlobalPermission = (permission, value) => {
    setGlobalPermissions(prev => ({
      ...prev,
      [permission]: value
    }));

    // Apply to all current participants
    const updatedPermissions = { ...participantPermissions };
    Object.keys(updatedPermissions).forEach(participantId => {
      updatedPermissions[participantId] = {
        ...updatedPermissions[participantId],
        [permission]: value
      };
    });
    setParticipantPermissions(updatedPermissions);

    // Broadcast global permission change
    const globalMessage = {
      type: 'global-permission-update',
      roomId: roomId,
      permission: permission,
      value: value,
      timestamp: new Date().toISOString()
    };

    if (sendMessage) {
      sendMessage(globalMessage);
    }

    const permissionName = getPermissionDisplayName(permission);
    message.success(
      `Đã ${value ? 'bật' : 'tắt'} ${permissionName} cho tất cả học sinh`
    );
  };

  /**
   * Kick participant from room
   */
  const kickParticipant = (participantId) => {
    const participant = participants.find(p => p.id === participantId);
    
    // Send kick message
    const kickMessage = {
      type: 'participant-kicked',
      roomId: roomId,
      targetUserId: participantId,
      reason: 'Kicked by teacher',
      timestamp: new Date().toISOString()
    };

    if (sendMessage) {
      sendMessage(kickMessage);
    }

    // Remove from local state
    setParticipantPermissions(prev => {
      const updated = { ...prev };
      delete updated[participantId];
      return updated;
    });

    message.warning(`Đã mời ${participant?.name || 'Người dùng'} rời khỏi phòng`);
  };

  /**
   * Mute all participants
   */
  const muteAll = () => {
    const updatedPermissions = { ...participantPermissions };
    Object.keys(updatedPermissions).forEach(participantId => {
      updatedPermissions[participantId].microphone = false;
    });
    setParticipantPermissions(updatedPermissions);

    // Broadcast mute all
    const muteAllMessage = {
      type: 'mute-all',
      roomId: roomId,
      timestamp: new Date().toISOString()
    };

    if (sendMessage) {
      sendMessage(muteAllMessage);
    }

    message.success('Đã tắt mic cho tất cả học sinh');
  };

  /**
   * Allow all participants to unmute
   */
  const allowUnmuteAll = () => {
    const updatedPermissions = { ...participantPermissions };
    Object.keys(updatedPermissions).forEach(participantId => {
      updatedPermissions[participantId].microphone = true;
    });
    setParticipantPermissions(updatedPermissions);

    // Broadcast allow unmute all
    const allowUnmuteMessage = {
      type: 'allow-unmute-all',
      roomId: roomId,
      timestamp: new Date().toISOString()
    };

    if (sendMessage) {
      sendMessage(allowUnmuteMessage);
    }

    message.success('Đã cho phép bật mic cho tất cả học sinh');
  };

  /**
   * Get permission display name
   */
  const getPermissionDisplayName = (permission) => {
    const names = {
      camera: 'Camera',
      microphone: 'Microphone',
      screenShare: 'Chia sẻ màn hình',
      chat: 'Chat',
      whiteboard: 'Bảng vẽ',
      fileUpload: 'Upload file'
    };
    return names[permission] || permission;
  };

  /**
   * Get permission icon
   */
  const getPermissionIcon = (permission) => {
    const icons = {
      camera: <VideoCameraOutlined />,
      microphone: <AudioOutlined />,
      screenShare: <DesktopOutlined />,
      chat: <MessageOutlined />,
      whiteboard: <EditOutlined />,
      fileUpload: <UserOutlined />
    };
    return icons[permission] || <UserOutlined />;
  };

  /**
   * Get participant status color
   */
  const getParticipantStatusColor = (participant) => {
    const permissions = participantPermissions[participant.id];
    if (!permissions?.isActive) return 'default';
    if (permissions.violations > 2) return 'red';
    if (permissions.violations > 0) return 'orange';
    return 'green';
  };

  /**
   * Render participant card
   */
  const renderParticipantCard = (participant) => {
    const permissions = participantPermissions[participant.id] || {};
    
    return (
      <Card
        key={participant.id}
        size="small"
        style={{ marginBottom: '8px' }}
        title={
          <Space>
            <Avatar 
              size="small" 
              src={participant.avatar}
              icon={<UserOutlined />}
            />
            <Text strong>{participant.name}</Text>
            <Tag color={participant.role === 'TEACHER' ? 'gold' : 'blue'}>
              {participant.role}
            </Tag>
            <Badge 
              status={getParticipantStatusColor(participant)} 
              text={permissions.isActive ? 'Online' : 'Offline'}
            />
          </Space>
        }
        extra={
          participant.role !== 'TEACHER' && (
            <Space>
              <Popconfirm
                title="Bạn có chắc chắn muốn mời người này rời phòng?"
                onConfirm={() => kickParticipant(participant.id)}
                okText="Có"
                cancelText="Không"
              >
                <Button 
                  type="text" 
                  danger 
                  size="small"
                  icon={<CloseCircleOutlined />}
                >
                  Kick
                </Button>
              </Popconfirm>
            </Space>
          )
        }
      >
        {participant.role !== 'TEACHER' && (
          <Row gutter={[8, 8]}>
            <Col span={12}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size="small">
                  <VideoCameraOutlined />
                  <Text style={{ fontSize: '12px' }}>Camera</Text>
                </Space>
                <Switch
                  size="small"
                  checked={permissions.camera}
                  onChange={(checked) => updateParticipantPermission(participant.id, 'camera', checked)}
                />
              </Space>
            </Col>
            
            <Col span={12}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size="small">
                  <AudioOutlined />
                  <Text style={{ fontSize: '12px' }}>Mic</Text>
                </Space>
                <Switch
                  size="small"
                  checked={permissions.microphone}
                  onChange={(checked) => updateParticipantPermission(participant.id, 'microphone', checked)}
                />
              </Space>
            </Col>
            
            <Col span={12}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size="small">
                  <DesktopOutlined />
                  <Text style={{ fontSize: '12px' }}>Screen</Text>
                </Space>
                <Switch
                  size="small"
                  checked={permissions.screenShare}
                  onChange={(checked) => updateParticipantPermission(participant.id, 'screenShare', checked)}
                />
              </Space>
            </Col>
            
            <Col span={12}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size="small">
                  <MessageOutlined />
                  <Text style={{ fontSize: '12px' }}>Chat</Text>
                </Space>
                <Switch
                  size="small"
                  checked={permissions.chat}
                  onChange={(checked) => updateParticipantPermission(participant.id, 'chat', checked)}
                />
              </Space>
            </Col>
            
            <Col span={12}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size="small">
                  <EditOutlined />
                  <Text style={{ fontSize: '12px' }}>Whiteboard</Text>
                </Space>
                <Switch
                  size="small"
                  checked={permissions.whiteboard}
                  onChange={(checked) => updateParticipantPermission(participant.id, 'whiteboard', checked)}
                />
              </Space>
            </Col>
            
            <Col span={12}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size="small">
                  <UserOutlined />
                  <Text style={{ fontSize: '12px' }}>Upload</Text>
                </Space>
                <Switch
                  size="small"
                  checked={permissions.fileUpload}
                  onChange={(checked) => updateParticipantPermission(participant.id, 'fileUpload', checked)}
                />
              </Space>
            </Col>
          </Row>
        )}
      </Card>
    );
  };

  const studentParticipants = participants.filter(p => p.role === 'STUDENT');
  const teacherParticipants = participants.filter(p => p.role === 'TEACHER');

  return (
    <Modal
      title={
        <Space>
          <CrownOutlined />
          <span>Quản lý quyền - Room {roomId}</span>
          <Badge count={participants.length} style={{ backgroundColor: '#52c41a' }} />
        </Space>
      }
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={700}
      style={{ top: 20 }}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      {/* Global Controls */}
      <Card 
        title="Điều khiển toàn phòng"
        size="small"
        style={{ marginBottom: '16px' }}
      >
        <Row gutter={[16, 8]}>
          <Col span={24}>
            <Space style={{ width: '100%', justifyContent: 'space-between' }}>
              <Button 
                type="primary" 
                danger
                onClick={muteAll}
                icon={<AudioOutlined />}
              >
                Tắt mic tất cả
              </Button>
              <Button 
                type="primary"
                onClick={allowUnmuteAll}
                icon={<CheckCircleOutlined />}
              >
                Cho phép bật mic
              </Button>
            </Space>
          </Col>
        </Row>
        
        <Divider style={{ margin: '12px 0' }} />
        
        <Title level={5} style={{ margin: '8px 0' }}>Quyền mặc định cho học sinh mới:</Title>
        <Row gutter={[8, 8]}>
          {Object.entries(globalPermissions).map(([permission, value]) => (
            <Col span={8} key={permission}>
              <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                <Space size="small">
                  {getPermissionIcon(permission)}
                  <Text style={{ fontSize: '12px' }}>
                    {getPermissionDisplayName(permission)}
                  </Text>
                </Space>
                <Switch
                  size="small"
                  checked={value}
                  onChange={(checked) => updateGlobalPermission(permission, checked)}
                />
              </Space>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Teachers */}
      {teacherParticipants.length > 0 && (
        <>
          <Title level={5}>
            <CrownOutlined style={{ color: '#faad14' }} />
            Giáo viên ({teacherParticipants.length})
          </Title>
          {teacherParticipants.map(renderParticipantCard)}
          <Divider />
        </>
      )}

      {/* Students */}
      <Title level={5}>
        <UserOutlined />
        Học sinh ({studentParticipants.length})
      </Title>
      
      {studentParticipants.length === 0 ? (
        <Empty 
          description="Chưa có học sinh nào tham gia"
          style={{ margin: '20px 0' }}
        />
      ) : (
        studentParticipants.map(renderParticipantCard)
      )}

      {/* Statistics */}
      <Divider />
      <Card size="small" title="Thống kê phòng học">
        <Row gutter={[16, 8]}>
          <Col span={8}>
            <Text type="secondary">Tổng người tham gia:</Text>
            <br />
            <Text strong style={{ fontSize: '16px' }}>{participants.length}</Text>
          </Col>
          <Col span={8}>
            <Text type="secondary">Học sinh:</Text>
            <br />
            <Text strong style={{ fontSize: '16px' }}>{studentParticipants.length}</Text>
          </Col>
          <Col span={8}>
            <Text type="secondary">Giáo viên:</Text>
            <br />
            <Text strong style={{ fontSize: '16px' }}>{teacherParticipants.length}</Text>
          </Col>
        </Row>
      </Card>
    </Modal>
  );
};

export default PermissionPanel;