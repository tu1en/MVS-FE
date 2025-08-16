import React from 'react';
import { Card, Row, Col, Button } from 'antd';
import { MessageOutlined, BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const ParentCommunication = () => {
  const navigate = useNavigate();

  const communicationItems = [
    {
      id: 'messages',
      title: 'Hỏi Đáp & Tin Nhắn',
      description: 'Trao đổi với giáo viên và nhà trường',
      icon: <MessageOutlined style={{ fontSize: '24px', color: '#1890ff' }} />,
      path: '/parent/messages',
      color: '#1890ff'
    },
    {
      id: 'announcements',
      title: 'Thông Báo',
      description: 'Xem thông báo từ nhà trường',
      icon: <BellOutlined style={{ fontSize: '24px', color: '#52c41a' }} />,
      path: '/parent/announcements',
      color: '#52c41a'
    }
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <Card 
      title={
        <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
          💬 Giao Tiếp
        </span>
      }
      style={{ marginBottom: '24px' }}
      bodyStyle={{ padding: '16px' }}
    >
      <Row gutter={[16, 16]}>
        {communicationItems.map((item) => (
          <Col xs={24} sm={12} key={item.id}>
            <Card
              hoverable
              onClick={() => handleNavigate(item.path)}
              style={{
                borderColor: item.color,
                borderWidth: '2px',
                height: '120px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              bodyStyle={{
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%'
              }}
              className="communication-card"
            >
              <div style={{ textAlign: 'center' }}>
                <div style={{ marginBottom: '8px' }}>
                  {item.icon}
                </div>
                <div style={{ 
                  fontSize: '16px', 
                  fontWeight: 'bold', 
                  color: item.color,
                  marginBottom: '4px'
                }}>
                  {item.title}
                </div>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  textAlign: 'center'
                }}>
                  {item.description}
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

    </Card>
  );
};

export default ParentCommunication;
