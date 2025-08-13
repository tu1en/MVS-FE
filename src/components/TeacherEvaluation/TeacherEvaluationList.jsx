import React, { useState, useEffect } from 'react';
import { List, Card, Rate, Typography, Tag, Spin, Empty, Space, Button, Modal, Divider } from 'antd';
import { UserOutlined, CalendarOutlined, CommentOutlined, StarOutlined, EyeOutlined } from '@ant-design/icons';
import { getTeacherEvaluations } from '../../services/teacherEvaluationService';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;

/**
 * Teacher Evaluation List Component
 * Displays a list of evaluations for a specific teacher
 */
const TeacherEvaluationList = ({ teacherId, teacherName }) => {
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

  useEffect(() => {
    if (teacherId) {
      fetchEvaluations();
    }
  }, [teacherId]);

  const fetchEvaluations = async () => {
    try {
      setLoading(true);
      const data = await getTeacherEvaluations(teacherId);
      setEvaluations(data);
    } catch (error) {
      console.error('Error fetching evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const showEvaluationDetail = (evaluation) => {
    setSelectedEvaluation(evaluation);
    setDetailModalVisible(true);
  };

  const getScoreColor = (score) => {
    if (score >= 4) return '#52c41a'; // green
    if (score >= 3) return '#faad14'; // yellow
    return '#ff4d4f'; // red
  };

  const getScoreText = (score) => {
    if (score >= 4) return 'Tốt';
    if (score >= 3) return 'Trung bình';
    return 'Cần cải thiện';
  };

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải đánh giá...</p>
        </div>
      </Card>
    );
  }

  if (evaluations.length === 0) {
    return (
      <Card>
        <Empty 
          description={`Chưa có đánh giá nào cho ${teacherName || 'giảng viên này'}`}
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        />
      </Card>
    );
  }

  return (
    <>
      <Card 
        title={
          <Space>
            <StarOutlined />
            <span>Đánh Giá Giảng Viên: {teacherName}</span>
            <Tag color="blue">{evaluations.length} đánh giá</Tag>
          </Space>
        }
      >
        <List
          itemLayout="vertical"
          dataSource={evaluations}
          renderItem={(evaluation) => (
            <List.Item
              key={evaluation.id}
              actions={[
                <Button 
                  type="link" 
                  icon={<EyeOutlined />}
                  onClick={() => showEvaluationDetail(evaluation)}
                >
                  Xem chi tiết
                </Button>
              ]}
            >
              <List.Item.Meta
                title={
                  <Space>
                    <UserOutlined />
                    <span>Đánh giá bởi: {evaluation.evaluatorName}</span>
                    <Tag color={getScoreColor(evaluation.overallScore)}>
                      {evaluation.overallScore}/5 - {getScoreText(evaluation.overallScore)}
                    </Tag>
                  </Space>
                }
                description={
                  <Space>
                    <CalendarOutlined />
                    <Text type="secondary">
                      {dayjs(evaluation.evaluationDate).format('DD/MM/YYYY HH:mm')}
                    </Text>
                  </Space>
                }
              />
              
              <div style={{ marginTop: 12 }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div>
                    <Text strong>Điểm chi tiết:</Text>
                    <Space style={{ marginLeft: 16 }}>
                      <span>Giảng dạy: <Rate disabled defaultValue={evaluation.teachingQualityScore} style={{ fontSize: 16 }} /></span>
                      <span>Tương tác: <Rate disabled defaultValue={evaluation.studentInteractionScore} style={{ fontSize: 16 }} /></span>
                      <span>Đúng giờ: <Rate disabled defaultValue={evaluation.punctualityScore} style={{ fontSize: 16 }} /></span>
                    </Space>
                  </div>
                  
                  {evaluation.comments && (
                    <div>
                      <Text type="secondary">
                        <CommentOutlined /> {evaluation.comments.length > 100 
                          ? `${evaluation.comments.substring(0, 100)}...`
                          : evaluation.comments
                        }
                      </Text>
                    </div>
                  )}
                </Space>
              </div>
            </List.Item>
          )}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết đánh giá - ${selectedEvaluation?.evaluatorName}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedEvaluation && (
          <div>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <Text strong>Thông tin cơ bản:</Text>
                <div style={{ marginTop: 8, paddingLeft: 16 }}>
                  <p><Text>Giảng viên:</Text> <Text strong>{selectedEvaluation.teacherName}</Text></p>
                  <p><Text>Người đánh giá:</Text> <Text strong>{selectedEvaluation.evaluatorName}</Text></p>
                  <p><Text>Thời gian:</Text> <Text strong>{dayjs(selectedEvaluation.evaluationDate).format('DD/MM/YYYY HH:mm')}</Text></p>
                  <p><Text>Điểm tổng:</Text> 
                    <Tag color={getScoreColor(selectedEvaluation.overallScore)} style={{ marginLeft: 8 }}>
                      {selectedEvaluation.overallScore}/5 - {getScoreText(selectedEvaluation.overallScore)}
                    </Tag>
                  </p>
                </div>
              </div>

              <Divider />

              <div>
                <Text strong>Điểm chi tiết:</Text>
                <div style={{ marginTop: 12, paddingLeft: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <Text>Chất lượng giảng dạy:</Text>
                      <div style={{ marginTop: 4 }}>
                        <Rate disabled defaultValue={selectedEvaluation.teachingQualityScore} />
                        <Text style={{ marginLeft: 8 }}>({selectedEvaluation.teachingQualityScore}/5)</Text>
                      </div>
                    </div>
                    <div>
                      <Text>Tương tác với học sinh:</Text>
                      <div style={{ marginTop: 4 }}>
                        <Rate disabled defaultValue={selectedEvaluation.studentInteractionScore} />
                        <Text style={{ marginLeft: 8 }}>({selectedEvaluation.studentInteractionScore}/5)</Text>
                      </div>
                    </div>
                    <div>
                      <Text>Tính đúng giờ:</Text>
                      <div style={{ marginTop: 4 }}>
                        <Rate disabled defaultValue={selectedEvaluation.punctualityScore} />
                        <Text style={{ marginLeft: 8 }}>({selectedEvaluation.punctualityScore}/5)</Text>
                      </div>
                    </div>
                  </Space>
                </div>
              </div>

              {selectedEvaluation.comments && (
                <>
                  <Divider />
                  <div>
                    <Text strong>Nhận xét:</Text>
                    <Paragraph style={{ marginTop: 8, paddingLeft: 16, fontStyle: 'italic' }}>
                      "{selectedEvaluation.comments}"
                    </Paragraph>
                  </div>
                </>
              )}
            </Space>
          </div>
        )}
      </Modal>
    </>
  );
};

export default TeacherEvaluationList;