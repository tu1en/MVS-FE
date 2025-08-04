import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { 
  Card, 
  Form, 
  Input, 
  DatePicker, 
  Button, 
  message, 
  Row, 
  Col,
  Typography,
  Space,
  Alert,
  Upload
} from 'antd';
import { 
  FileTextOutlined, 
  CalendarOutlined, 
  SendOutlined,
  ClockCircleOutlined,
  UploadOutlined,
  PictureOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ExplanationService from '../../services/explanationService';


const { Title, Text } = Typography;
const { TextArea } = Input;

const TeacherExplanationRequest = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const user = useSelector(state => state.auth.user);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const explanationData = {
        submitterName: user?.name || user?.email || 'Unknown User',
        absenceDate: values.absenceDate.format('YYYY-MM-DD'),
        reason: values.reason,
        department: 'TEACHER'
      };

      console.log('User data:', user);
      console.log('Submitter name:', explanationData.submitterName);
      console.log('Complete explanation data being sent:', explanationData);

      await ExplanationService.submitExplanation(explanationData);
      
      message.success('Yêu cầu giải trình đã được gửi thành công!');
      form.resetFields();
      
    } catch (error) {
      console.error('Error submitting explanation:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Không thể gửi yêu cầu giải trình. Vui lòng thử lại.';
      message.error(`Lỗi: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const disabledDate = (current) => {
    // Disable future dates
    return current && current > dayjs().endOf('day');
  };

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12} xl={10}>
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                <Title level={4} style={{ margin: 0 }}>
                  Yêu Cầu Giải Trình Điểm Danh
                </Title>
              </Space>
            }
            bordered={false}
            style={{ 
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              borderRadius: '8px'
            }}
          >
            <Alert
              message="Thông tin quan trọng"
              description="Vui lòng điền đầy đủ thông tin về lý do đi muộn hoặc vắng mặt. Yêu cầu sẽ được gửi đến quản lý để xem xét và phê duyệt."
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
            >
              <Form.Item
                label={
                  <Space>
                    <CalendarOutlined />
                    <Text strong>Ngày vắng mặt/đi muộn</Text>
                  </Space>
                }
                name="absenceDate"
                rules={[
                  { required: true, message: 'Vui lòng chọn ngày vắng mặt/đi muộn!' }
                ]}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày"
                  disabledDate={disabledDate}
                />
              </Form.Item>

              <Form.Item
                label={
                  <Space>
                    <FileTextOutlined />
                    <Text strong>Lý do giải trình</Text>
                  </Space>
                }
                name="reason"
                rules={[
                  { required: true, message: 'Vui lòng nhập lý do giải trình!' },
                  { min: 10, message: 'Lý do giải trình phải có ít nhất 10 ký tự!' }
                ]}
              >
                <TextArea
                  rows={6}
                  placeholder="Vui lòng mô tả chi tiết lý do vắng mặt hoặc đi muộn của bạn..."
                  showCount
                  maxLength={500}
                />
              </Form.Item>



              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SendOutlined />}
                  size="large"
                  style={{ 
                    width: '100%',
                    height: '48px',
                    fontSize: '16px',
                    fontWeight: '500'
                  }}
                >
                  {loading ? 'Đang gửi...' : 'Gửi Yêu Cầu Giải Trình'}
                </Button>
              </Form.Item>
            </Form>

            <div style={{ 
              marginTop: '24px', 
              padding: '16px', 
              background: '#f9f9f9', 
              borderRadius: '6px',
              border: '1px solid #e8e8e8'
            }}>
              <Space direction="vertical" size="small">
                <Text type="secondary">
                  <ClockCircleOutlined /> <strong>Lưu ý:</strong>
                </Text>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  • Yêu cầu giải trình sẽ được gửi đến quản lý để xem xét
                </Text>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  • Vui lòng cung cấp thông tin chính xác và đầy đủ
                </Text>
                <Text type="secondary" style={{ fontSize: '13px' }}>
                  • Kết quả phê duyệt sẽ được thông báo qua hệ thống
                </Text>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TeacherExplanationRequest;
