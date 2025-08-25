import {
    BookOutlined,
    CalendarOutlined,
    FileTextOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Avatar,
    Button,
    Card,
    Col,
    Empty,
    Row,
    Table,
    Tag,
    Typography
} from 'antd';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text } = Typography;

/**
 * Children Component for Parents
 * Dedicated page to view and manage children information
 */
const Children = () => {
  const navigate = useNavigate();
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChildren();
  }, []);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get('/parent/children');
      const data = response.data;
      const childrenList = Array.isArray(data) ? data : (data?.data || []);
      setChildren(childrenList);
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên con',
      dataIndex: ['student', 'fullName'],
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar icon={<UserOutlined />} className="mr-2" />
          <div>
            <div className="font-semibold">{text || 'Không có tên'}</div>
            <div className="text-gray-500 text-sm">{record.relationType === 'FATHER' ? 'Con trai/gái' : 'Con'}</div>
          </div>
        </div>
      ),
    },

    {
      title: 'Vai trò',
      key: 'role',
      render: (_, record) => (
        <div>
          <Tag color="blue">Phụ huynh</Tag>
        </div>
      ),
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <div className="space-x-2">
          <Button 
            type="primary" 
            size="small"
            onClick={() => navigate(`/parent/children/${record.studentId}/attendance`)}
          >
            Xem điểm danh
          </Button>
          <Button 
            size="small"
            onClick={() => navigate(`/parent/schedule?child=${record.studentId}`)}
          >
            Lịch học
          </Button>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="p-6">
        <Title level={2}>Con em của tôi</Title>
        <Card loading={true} />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Title level={2}>Con em của tôi</Title>
      <Text className="text-gray-600 block mb-6">
        Theo dõi tiến độ học tập và điểm danh của các con
      </Text>

      {children.length === 0 ? (
        <Card>
          <Empty 
            description="Không tìm thấy thông tin con em"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Text className="text-gray-500">
              Hiện tại chưa có thông tin con em nào được liên kết với tài khoản của bạn.
              Vui lòng liên hệ với nhà trường để được hỗ trợ.
            </Text>
          </Empty>
        </Card>
      ) : (
        <>
          {/* Summary Statistics */}
          {/* <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Card>
                <Statistic 
                  title="Tổng số con" 
                  value={children.length} 
                  prefix={<UserOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic 
                  title="Quan hệ chính" 
                  value={children.filter(c => c.isPrimary).length} 
                  prefix={<TrophyOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card>
                <Statistic 
                  title="Người giám hộ" 
                  value={children.filter(c => c.legalGuardian).length} 
                  prefix={<FileTextOutlined />}
                />
              </Card>
            </Col>
          </Row> */}

          {/* Children Table */}
                     <Card title="Danh sách con em">
             <Table
               columns={columns}
               dataSource={children}
               rowKey="id"
               pagination={false}
             />
           </Card>

          {/* Quick Actions */}
          <Row gutter={[16, 16]} className="mt-6">
            <Col xs={24}>
              <Card title="Hành động nhanh">
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      type="primary" 
                      block 
                      icon={<CalendarOutlined />}
                      onClick={() => navigate('/parent/schedule')}
                    >
                      Xem lịch học tất cả con
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      block 
                      icon={<BookOutlined />}
                      onClick={() => navigate('/parent/attendance')}
                    >
                      Xem điểm danh tất cả con
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      block 
                      icon={<FileTextOutlined />}
                      onClick={() => navigate('/parent/leave-notice')}
                    >
                      Tạo thông báo nghỉ
                    </Button>
                  </Col>
                  <Col xs={24} sm={12} md={6}>
                    <Button 
                      block 
                      onClick={() => navigate('/parent/billing')}
                    >
                      Xem học phí
                    </Button>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </>
      )}
    </div>
  );
};

export default Children;