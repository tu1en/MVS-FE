import React, { useState } from 'react';
import { Form, Rate, Input, Button, Card, message, Space, Typography } from 'antd';
import { UserOutlined, BookOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { createTeacherEvaluation } from '../../services/teacherEvaluationService';

const { TextArea } = Input;
const { Title, Text } = Typography;

/**
 * Teacher Evaluation Form Component
 * Allows Teaching Assistants to evaluate teachers based on various criteria
 */
const TeacherEvaluationForm = ({ 
  teacherId, 
  teacherName, 
  classSessionId, 
  onSuccess, 
  onCancel 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const evaluationData = {
        teacherId,
        classSessionId,
        teachingQualityScore: values.teachingQualityScore,
        studentInteractionScore: values.studentInteractionScore,
        punctualityScore: values.punctualityScore,
        comments: values.comments
      };
      
      await createTeacherEvaluation(evaluationData);
      message.success('Đánh giá đã được gửi thành công!');
      form.resetFields();
      onSuccess?.();
    } catch (error) {
      console.error('Error creating evaluation:', error);
      if (error.message?.includes('already exists')) {
        message.error('Bạn đã đánh giá giảng viên này trong buổi học này rồi!');
      } else {
        message.error(error.message || 'Có lỗi xảy ra khi gửi đánh giá');
      }
    } finally {
      setLoading(false);
    }
  };

  const criteriaConfig = [
    {
      name: 'teachingQualityScore',
      label: 'Chất lượng giảng dạy',
      icon: <BookOutlined />,
      description: 'Đánh giá về khả năng truyền đạt kiến thức, phương pháp giảng dạy'
    },
    {
      name: 'studentInteractionScore',
      label: 'Tương tác với học sinh',
      icon: <TeamOutlined />,
      description: 'Đánh giá về cách giảng viên tương tác, thu hút sự chú ý của học sinh'
    },
    {
      name: 'punctualityScore',
      label: 'Tính đúng giờ',
      icon: <ClockCircleOutlined />,
      description: 'Đánh giá về việc bắt đầu và kết thúc buổi học đúng giờ'
    }
  ];

  return (
    <Card 
      title={
        <Space>
          <UserOutlined />
          <span>Đánh Giá Giảng Viên: {teacherName}</span>
        </Space>
      }
      className="teacher-evaluation-form"
      style={{ maxWidth: 800, margin: '0 auto' }}
    >
      <Form 
        form={form} 
        onFinish={handleSubmit} 
        layout="vertical"
        initialValues={{
          teachingQualityScore: 5,
          studentInteractionScore: 5,
          punctualityScore: 5
        }}
      >
        <div style={{ marginBottom: 24 }}>
          <Text type="secondary">
            Hãy đánh giá giảng viên dựa trên các tiêu chí sau đây. Thang điểm từ 1-5 sao.
          </Text>
        </div>

        {criteriaConfig.map((criteria) => (
          <Form.Item 
            key={criteria.name}
            name={criteria.name}
            label={
              <Space>
                {criteria.icon}
                <span>{criteria.label}</span>
              </Space>
            }
            extra={<Text type="secondary">{criteria.description}</Text>}
            rules={[{ required: true, message: 'Vui lòng chấm điểm' }]}
          >
            <Rate 
              style={{ fontSize: 24 }}
              tooltips={['Rất kém', 'Kém', 'Trung bình', 'Tốt', 'Rất tốt']}
            />
          </Form.Item>
        ))}
        
        <Form.Item 
          name="comments" 
          label={
            <Space>
              <BookOutlined />
              <span>Nhận xét chi tiết</span>
            </Space>
          }
          extra={<Text type="secondary">Chia sẻ nhận xét chi tiết về buổi học (tùy chọn)</Text>}
        >
          <TextArea 
            rows={4} 
            maxLength={1000} 
            placeholder="Nhập nhận xét của bạn về buổi học..."
            showCount
          />
        </Form.Item>
        
        <Form.Item>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
            >
              Gửi Đánh Giá
            </Button>
            {onCancel && (
              <Button 
                onClick={onCancel} 
                disabled={loading}
                size="large"
              >
                Hủy
              </Button>
            )}
          </Space>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default TeacherEvaluationForm;