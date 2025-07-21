import {
  BookOutlined,
  CalendarOutlined,
  ReloadOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Row,
  Spin,
  Statistic,
  Typography,
  message
} from 'antd';
import { useEffect, useState } from 'react';
import teacherService from '../../services/teacherService';

const { Title } = Typography;

const TeacherTeachingHistory = () => {
  const [teachingHistory, setTeachingHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTeachingHistory = async () => {
    try {
      setLoading(true);
      const response = await teacherService.getTeachingHistory();
      console.log('Teaching history response:', response);
      setTeachingHistory(response.data || response);
    } catch (error) {
      console.error('Error fetching teaching history:', error);
      message.error('Không thể tải lịch sử giảng dạy');
      setTeachingHistory(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachingHistory();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Đang tải lịch sử giảng dạy...</p>
      </div>
    );
  }

  if (!teachingHistory) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Title level={4}>Không có dữ liệu lịch sử giảng dạy</Title>
        <Button 
          type="primary" 
          icon={<ReloadOutlined />}
          onClick={fetchTeachingHistory}
        >
          Thử lại
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <Title level={2}>
          <BookOutlined className="mr-2" />
          Lịch Sử Giảng Dạy
        </Title>
        <Button 
          icon={<ReloadOutlined />}
          onClick={fetchTeachingHistory}
          loading={loading}
        >
          Làm mới
        </Button>
      </div>

      <Row gutter={[16, 16]}>
        {/* Statistics Cards */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số lớp"
              value={teachingHistory.totalClasses || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng số học sinh"
              value={teachingHistory.totalStudents || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Năm kinh nghiệm"
              value={teachingHistory.yearsOfExperience || 0}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Lớp hiện tại"
              value={teachingHistory.currentClasses || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>

        {/* Detailed Information */}
        <Col span={24}>
          <Card title="Thông tin chi tiết">
            <Descriptions bordered column={2}>
              <Descriptions.Item label="Tên giáo viên">
                {teachingHistory.teacherName || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {teachingHistory.email || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày bắt đầu">
                {teachingHistory.startDate ? new Date(teachingHistory.startDate).toLocaleDateString('vi-VN') : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {teachingHistory.status || 'Đang hoạt động'}
              </Descriptions.Item>
              <Descriptions.Item label="Chuyên môn">
                {teachingHistory.specialization || 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Cấp độ">
                {teachingHistory.level || 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {/* Classroom History */}
        {teachingHistory.classrooms && teachingHistory.classrooms.length > 0 && (
          <Col span={24}>
            <Card title="Lịch sử các lớp đã dạy">
              <Row gutter={[16, 16]}>
                {teachingHistory.classrooms.map((classroom, index) => (
                  <Col xs={24} sm={12} md={8} key={index}>
                    <Card size="small">
                      <Descriptions size="small" column={1}>
                        <Descriptions.Item label="Tên lớp">
                          {classroom.name || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số học sinh">
                          {classroom.studentCount || 0}
                        </Descriptions.Item>
                        <Descriptions.Item label="Năm học">
                          {classroom.academicYear || 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          {classroom.status || 'N/A'}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default TeacherTeachingHistory;
