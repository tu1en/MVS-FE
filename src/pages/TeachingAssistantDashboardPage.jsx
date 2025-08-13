import {
    BarChartOutlined,
    BookOutlined,
    ClockCircleOutlined,
    MessageOutlined,
    StarOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import { Alert, Button, Card, Col, Divider, List, Row, Space, Statistic, Tag, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { TeacherEvaluationDashboard } from '../components/TeacherEvaluation';
import api from '../services/api';

const { Title, Text, Paragraph } = Typography;

/**
 * Main Dashboard Page for Teaching Assistants
 * Shows overview, quick actions, and embedded teacher evaluation system
 */
const TeachingAssistantDashboardPage = () => {
  const [stats, setStats] = useState({
    totalEvaluations: 0,
    teachersEvaluated: 0,
    averageRating: 0,
    thisWeekEvaluations: 0
  });

  const [loading, setLoading] = useState(true);
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [classesByTeacher, setClassesByTeacher] = useState({});

  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      try {
        // 1) Lấy các đánh giá của tôi (để suy ra GV đã hỗ trợ)
        const { getMyEvaluations } = await import('../services/teacherEvaluationService');
        const myEvals = await getMyEvaluations();
        if (isCancelled) return;
        const totalEvaluations = Array.isArray(myEvals) ? myEvals.length : 0;
        const idToName = Array.isArray(myEvals)
          ? myEvals.reduce((acc, e) => { if (e.teacherId) acc[e.teacherId] = e.teacherName || acc[e.teacherId]; return acc; }, {})
          : {};
        const uniqueTeacherIds = Array.isArray(myEvals) ? Array.from(new Set(myEvals.map(e => e.teacherId))) : [];
        const teachersEvaluated = uniqueTeacherIds.length;
        const avg = Array.isArray(myEvals) && myEvals.length
          ? (myEvals.reduce((sum, e) => sum + ((e.averageScore) ?? ((e.teachingQualityScore||0)+(e.studentInteractionScore||0)+(e.punctualityScore||0))/3), 0) / myEvals.length)
          : 0;
        setStats({
          totalEvaluations,
          teachersEvaluated,
          averageRating: Number(avg.toFixed(1)),
          thisWeekEvaluations: totalEvaluations // placeholder hợp lệ
        });

        // 2) Lấy thông tin lớp của các GV đó để TA có thể xem đang hỗ trợ lớp nào
        if (uniqueTeacherIds.length > 0) {
          const results = await Promise.all(uniqueTeacherIds.map(async (teacherId) => {
            try {
              const classes = await api.GetClassroomsByTeacher(teacherId);
              return { teacherId, classes };
            } catch (e) {
              return { teacherId, classes: [] };
            }
          }));

          const map = {};
          results.forEach(({ teacherId, classes }) => { map[teacherId] = classes || []; });
          setClassesByTeacher(map);

          // 3) Hiển thị danh sách GV từ dữ liệu lớp (lấy tên hợp lý);
          const teacherSummaries = uniqueTeacherIds.map(id => {
            const oneClass = (map[id] && map[id][0]) || null;
            return {
              id,
              name: idToName[id] || oneClass?.teacherName || `Giảng viên ${id}`,
              classCount: Array.isArray(map[id]) ? map[id].length : 0
            };
          });
          setAssignedTeachers(teacherSummaries);
        } else {
          setAssignedTeachers([]);
          setClassesByTeacher({});
        }
      } catch (e) {
        console.warn('TeachingAssistantDashboardPage: fallback stats due to API error', e);
        setStats({ totalEvaluations: 0, teachersEvaluated: 0, averageRating: 0, thisWeekEvaluations: 0 });
        setAssignedTeachers([]);
        setClassesByTeacher({});
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    load();
    return () => { isCancelled = true; };
  }, []);

  const quickActions = [
    {
      title: 'Đánh Giá Giảng Viên Mới',
      description: 'Tạo đánh giá cho một giảng viên',
      icon: <StarOutlined />,
      action: () => {
        // Scroll to evaluation form
        document.getElementById('evaluation-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: 'Xem Lịch Sử Đánh Giá',
      description: 'Xem các đánh giá đã thực hiện',
      icon: <ClockCircleOutlined />,
      action: () => {
        // Scroll to evaluation list
        document.getElementById('evaluation-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: 'Thống Kê Tổng Quan',
      description: 'Xem báo cáo chi tiết',
      icon: <BarChartOutlined />,
      action: () => {
        // Scroll to statistics
        document.getElementById('evaluation-section')?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Đánh giá giảng viên Nguyễn Văn Minh',
      time: '2 giờ trước',
      rating: 4.5
    },
    {
      id: 2,
      action: 'Đánh giá giảng viên Trần Văn Đức',
      time: '1 ngày trước',
      rating: 4.0
    },
    {
      id: 3,
      action: 'Đánh giá giảng viên Phạm Thị Lan',
      time: '2 ngày trước',
      rating: 4.8
    }
  ];

  if (loading) {
    return (
      <div style={{ padding: '24px' }}>
        <Card loading={true} style={{ minHeight: '400px' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: 24, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none' }}>
        <div style={{ color: 'white' }}>
          <Title level={2} style={{ color: 'white', margin: 0 }}>
            <Space>
              <UserOutlined />
              Bảng Điều Khiển Trợ Giảng
            </Space>
          </Title>
          <Paragraph style={{ color: 'rgba(255,255,255,0.8)', fontSize: '16px', marginBottom: 0, marginTop: 8 }}>
            Chào mừng bạn đến với hệ thống đánh giá giảng viên. Hãy bắt đầu đánh giá để cải thiện chất lượng giảng dạy.
          </Paragraph>
        </div>
      </Card>

      {/* Statistics Overview */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Tổng Số Đánh Giá"
              value={stats.totalEvaluations}
              prefix={<BookOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Giảng Viên Đã Đánh Giá"
              value={stats.teachersEvaluated}
              prefix={<TeamOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Điểm Trung Bình"
              value={stats.averageRating}
              precision={1}
              prefix={<StarOutlined style={{ color: '#faad14' }} />}
              suffix="/ 5"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Đánh Giá Tuần Này"
              value={stats.thisWeekEvaluations}
              prefix={<ClockCircleOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Quick Actions & Recent Activity */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} lg={12}>
          <Card title={
            <Space>
              <MessageOutlined />
              Thao Tác Nhanh
            </Space>
          }>
            <List
              dataSource={quickActions}
              renderItem={(action) => (
                <List.Item
                  actions={[
                    <Button type="primary" onClick={action.action}>
                      Thực hiện
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    avatar={action.icon}
                    title={action.title}
                    description={action.description}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={
            <Space>
              <ClockCircleOutlined />
              Hoạt Động Gần Đây
            </Space>
          }>
            <List
              dataSource={recentActivity}
              renderItem={(activity) => (
                <List.Item>
                  <List.Item.Meta
                    title={activity.action}
                    description={
                      <Space>
                        <Text type="secondary">{activity.time}</Text>
                        <Tag color="gold">
                          <StarOutlined /> {activity.rating}/5
                        </Tag>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Button type="link" onClick={() => document.getElementById('evaluation-section')?.scrollIntoView({ behavior: 'smooth' })}>
                Xem tất cả hoạt động
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Assigned Teachers and Classes for this TA */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Giảng viên và lớp mà bạn đang hỗ trợ">
            {assignedTeachers.length === 0 ? (
              <Alert type="info" showIcon message="Chưa có dữ liệu" description="Bạn chưa có đánh giá nào để xác định đang hỗ trợ giảng viên/lớp nào." />
            ) : (
              <List
                dataSource={assignedTeachers}
                renderItem={(t) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<span>{t.name} <Tag color="blue">{t.classCount} lớp</Tag></span>}
                      description={() => {
                        const list = classesByTeacher && Array.isArray(classesByTeacher[t.id]) ? classesByTeacher[t.id] : [];
                        if (list.length === 0) return 'Chưa có lớp';
                        return (
                          <div>
                            {list.map((c) => (
                              <Tag key={c.id} color="geekblue">{c.name}</Tag>
                            ))}
                          </div>
                        );
                      }}
                    />
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Tips & Guidelines */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Alert
            message="Hướng Dẫn Đánh Giá Giảng Viên"
            description={
              <div>
                <p><strong>Các tiêu chí đánh giá:</strong></p>
                <ul style={{ marginBottom: 0, paddingLeft: 20 }}>
                  <li><strong>Chất lượng giảng dạy:</strong> Đánh giá khả năng truyền đạt kiến thức, sự rõ ràng và dễ hiểu</li>
                  <li><strong>Tương tác với học sinh:</strong> Đánh giá khả năng giao tiếp và tạo không khí học tập tích cực</li>
                  <li><strong>Tính đúng giờ:</strong> Đánh giá việc tuân thủ thời gian và lịch trình giảng dạy</li>
                </ul>
              </div>
            }
            type="info"
            showIcon
          />
        </Col>
      </Row>

      <Divider />

      {/* Teacher Evaluation Section */}
      <div id="evaluation-section">
        <Title level={3} style={{ marginBottom: 16 }}>
          <Space>
            <BarChartOutlined />
            Hệ Thống Đánh Giá Giảng Viên
          </Space>
        </Title>
        
        <TeacherEvaluationDashboard 
          availableTeachers={[]}
          currentUser={null}
        />
      </div>
    </div>
  );
};

export default TeachingAssistantDashboardPage;