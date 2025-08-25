import { UserOutlined } from '@ant-design/icons';
import { Avatar, Card, Col, Row, Select, Typography } from 'antd';
import React from 'react';

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
              disabled={children.length === 0}
            >
              {children.length > 0 ? (
                children.map(child => (
                  <Option key={child.id} value={child.id}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar 
                        size="small" 
                        icon={<UserOutlined />} 
                        src={child.avatar}
                        style={{ marginRight: '8px' }}
                      />
                      {child.name || child.fullName || child.studentName || `Học sinh ${child.id}`}
                    </div>
                  </Option>
                ))
              ) : (
                <Option value="" disabled>
                  Không có dữ liệu con em
                </Option>
              )}
            </Select>
          </div>
        </Col>


      </Row>

      {/* <Row style={{ marginTop: '12px' }}>
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
              {children.length === 0 ? 'Chưa có dữ liệu con em' : 
               children.length === 1 ? 'Quản lý 1 học sinh' : 
               `Quản lý ${children.length} học sinh`}
            </Text>
          </div>
        </Col>
      </Row> */}
    </Card>
  );
};

export default ChildSwitcher;