import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Typography, Space, Spin, Alert } from 'antd';
import { StarOutlined, BookOutlined, TeamOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import { getTeacherEvaluationStatistics } from '../../services/teacherEvaluationService';

const { Title, Text } = Typography;

/**
 * Teacher Evaluation Statistics Component
 * Displays comprehensive statistics for a teacher's evaluations
 */
const TeacherEvaluationStatistics = ({ teacherId, teacherName }) => {
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (teacherId) {
      fetchStatistics();
    }
  }, [teacherId]);

  const fetchStatistics = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getTeacherEvaluationStatistics(teacherId);
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (score) => {
    if (score >= 4) return '#52c41a'; // green
    if (score >= 3) return '#faad14'; // yellow
    return '#ff4d4f'; // red
  };

  const getPerformanceLevel = (score) => {
    if (score >= 4.5) return 'Xuất sắc';
    if (score >= 4) return 'Tốt';
    if (score >= 3) return 'Trung bình';
    if (score >= 2) return 'Cần cải thiện';
    return 'Yếu';
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải thống kê...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert
        message="Lỗi tải dữ liệu"
        description={error}
        type="error"
        showIcon
      />
    );
  }

  if (!statistics || statistics.evaluationCount === 0) {
    return (
      <Card>
        <Alert
          message="Chưa có dữ liệu đánh giá"
          description={`${teacherName || 'Giảng viên này'} chưa có đánh giá nào.`}
          type="info"
          showIcon
        />
      </Card>
    );
  }

  const criteriaData = [
    {
      title: 'Chất lượng giảng dạy',
      score: statistics.averageTeachingQualityScore,
      icon: <BookOutlined />,
      color: getProgressColor(statistics.averageTeachingQualityScore)
    },
    {
      title: 'Tương tác học sinh',
      score: statistics.averageStudentInteractionScore,
      icon: <TeamOutlined />,
      color: getProgressColor(statistics.averageStudentInteractionScore)
    },
    {
      title: 'Tính đúng giờ',
      score: statistics.averagePunctualityScore,
      icon: <ClockCircleOutlined />,
      color: getProgressColor(statistics.averagePunctualityScore)
    }
  ];

  return (
    <div>
      <Card 
        title={
          <Space>
            <TrophyOutlined />
            <span>Thống kê đánh giá: {statistics.teacherName}</span>
          </Space>
        }
        style={{ marginBottom: 24 }}
      >
        <Row gutter={[24, 24]}>
          {/* Overall Statistics */}
          <Col xs={24} md={8}>
            <Card className="stat-card" style={{ textAlign: 'center', height: '100%' }}>
              <Statistic
                title="Điểm Tổng Trung Bình"
                value={statistics.averageOverallScore?.toFixed(2) || 0}
                suffix="/ 5"
                prefix={<StarOutlined style={{ color: '#faad14' }} />}
                valueStyle={{ 
                  color: getProgressColor(statistics.averageOverallScore),
                  fontSize: '2.5em',
                  fontWeight: 'bold'
                }}
              />
              <Text type="secondary" style={{ fontSize: '16px', marginTop: 8, display: 'block' }}>
                {getPerformanceLevel(statistics.averageOverallScore)}
              </Text>
              <Progress
                percent={(statistics.averageOverallScore / 5) * 100}
                strokeColor={getProgressColor(statistics.averageOverallScore)}
                showInfo={false}
                style={{ marginTop: 16 }}
              />
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className="stat-card" style={{ textAlign: 'center', height: '100%' }}>
              <Statistic
                title="Tổng số đánh giá"
                value={statistics.evaluationCount}
                prefix={<StarOutlined style={{ color: '#1890ff' }} />}
                valueStyle={{ color: '#1890ff', fontSize: '2.5em', fontWeight: 'bold' }}
              />
              <Text type="secondary" style={{ fontSize: '14px', marginTop: 8, display: 'block' }}>
                Từ các trợ giảng
              </Text>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className="stat-card" style={{ textAlign: 'center', height: '100%' }}>
              <div style={{ padding: '20px 0' }}>
                <Title level={4} style={{ margin: 0, color: getProgressColor(statistics.averageOverallScore) }}>
                  {getPerformanceLevel(statistics.averageOverallScore)}
                </Title>
                <Text type="secondary">Mức độ đánh giá</Text>
                <div style={{ marginTop: 16 }}>
                  <Progress
                    type="circle"
                    percent={(statistics.averageOverallScore / 5) * 100}
                    strokeColor={getProgressColor(statistics.averageOverallScore)}
                    width={80}
                    format={() => `${statistics.averageOverallScore?.toFixed(1)}`}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Detailed Criteria */}
      <Card 
        title={
          <Space>
            <StarOutlined />
            <span>Chi tiết theo tiêu chí</span>
          </Space>
        }
      >
        <Row gutter={[24, 24]}>
          {criteriaData.map((criteria, index) => (
            <Col key={index} xs={24} md={8}>
              <Card className="criteria-card" style={{ height: '100%' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2em', color: criteria.color, marginBottom: 8 }}>
                    {criteria.icon}
                  </div>
                  <Title level={4} style={{ margin: '8px 0' }}>
                    {criteria.title}
                  </Title>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ 
                      fontSize: '2em', 
                      fontWeight: 'bold',
                      color: criteria.color 
                    }}>
                      {criteria.score?.toFixed(2) || 0}
                    </span>
                    <span style={{ fontSize: '1.2em', color: '#666' }}> / 5</span>
                  </div>
                  <Progress
                    percent={(criteria.score / 5) * 100}
                    strokeColor={criteria.color}
                    showInfo={false}
                    strokeWidth={8}
                  />
                  <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                    {getPerformanceLevel(criteria.score)}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default TeacherEvaluationStatistics;