import React from 'react';
import { Card, Select, Avatar, Typography, Row, Col, Tag } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Option } = Select;
const { Text } = Typography;

/**
 * Child Switcher Component
 * Based on PARENT_ROLE_SPEC.md - Allow parents to switch between multiple children
 * Features: Quick child selection, visual child info, responsive design
 */
const ChildSwitcher = ({ children, selectedChildId, onChildChange }) => {
  const selectedChild = children.find(child => child.id === selectedChildId);

  return (
    <Card 
      size="small"
      style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        borderRadius: '12px'
      }}
      bodyStyle={{ padding: '16px' }}
    >
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={12} md={8}>
          <div style={{ color: 'white' }}>
            <Text style={{ color: 'white', fontSize: '16px', fontWeight: 'bold' }}>
              Chọn con em:
            </Text>
            <Select
              value={selectedChildId}
              onChange={onChildChange}
              style={{ 
                width: '100%', 
                marginTop: '8px'
              }}
              size="large"
              placeholder="Chọn học sinh"
            >
              {children.map(child => (
                <Option key={child.id} value={child.id}>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      size="small" 
                      icon={<UserOutlined />} 
                      src={child.avatar}
                      style={{ marginRight: '8px' }}
                    />
                    {child.name}
                  </div>
                </Option>
              ))}
            </Select>
          </div>
        </Col>

        {selectedChild && (
          <Col xs={24} sm={12} md={16}>
            <Row gutter={[16, 8]} align="middle">
              <Col xs={24} md={12}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar 
                    size="large" 
                    icon={<UserOutlined />} 
                    src={selectedChild.avatar}
                    style={{ 
                      marginRight: '12px',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}
                  />
                  <div>
                    <Text style={{ 
                      color: 'white', 
                      fontSize: '18px', 
                      fontWeight: 'bold',
                      display: 'block'
                    }}>
                      {selectedChild.name}
                    </Text>
                    <Tag 
                      color="rgba(255,255,255,0.2)" 
                      style={{ 
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '12px'
                      }}
                    >
                      {selectedChild.grade}
                    </Tag>
                  </div>
                </div>
              </Col>

              <Col xs={24} md={12}>
                <div style={{ color: 'rgba(255,255,255,0.9)' }}>
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: '12px',
                    display: 'block'
                  }}>
                    Giáo viên chủ nhiệm:
                  </Text>
                  <Text style={{ 
                    color: 'white', 
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    {selectedChild.teacherName}
                  </Text>
                </div>
              </Col>
            </Row>
          </Col>
        )}
      </Row>

      {children.length > 1 && (
        <Row style={{ marginTop: '12px' }}>
          <Col span={24}>
            <div style={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: '8px',
              justifyContent: 'flex-end'
            }}>
              <Text style={{ 
                color: 'rgba(255,255,255,0.7)', 
                fontSize: '12px'
              }}>
                Quản lý {children.length} học sinh
              </Text>
            </div>
          </Col>
        </Row>
      )}
    </Card>
  );
};

export default ChildSwitcher;