import React, { useState } from 'react';
import { 
  Modal, 
  Form, 
  Input, 
  Button, 
  message, 
  Typography, 
  Space, 
  Divider,
  Alert
} from 'antd';
import { ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import makeupAttendanceService from '../../services/makeupAttendanceService';
import moment from 'moment';

const { TextArea } = Input;
const { Title, Text } = Typography;

/**
 * Form component for creating makeup attendance requests
 */
const MakeupAttendanceRequestForm = ({ 
  visible, 
  onCancel, 
  onSuccess, 
  lecture, 
  classroom 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values) => {
    if (!lecture || !classroom) {
      message.error('Thiếu thông tin buổi học hoặc lớp học');
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        lectureId: lecture.id,
        classroomId: classroom.id,
        reason: values.reason
      };

      await makeupAttendanceService.createRequest(requestData);
      message.success('Yêu cầu điểm danh bù đã được gửi thành công!');
      form.resetFields();
      onSuccess && onSuccess();
    } catch (error) {
      console.error('Error creating makeup attendance request:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi gửi yêu cầu';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel && onCancel();
  };

  // Format lecture date and time for display
  const formatLectureInfo = () => {
    if (!lecture) return '';
    
    let dateStr = 'N/A';
    let timeStr = 'N/A';
    
    if (lecture.schedule?.date) {
      dateStr = moment(lecture.schedule.date).format('DD/MM/YYYY');
    } else if (lecture.lectureDate) {
      dateStr = moment(lecture.lectureDate).format('DD/MM/YYYY');
    }
    
    if (lecture.schedule?.startTime && lecture.schedule?.endTime) {
      timeStr = `${lecture.schedule.startTime} - ${lecture.schedule.endTime}`;
    }
    
    return `${dateStr} (${timeStr})`;
  };

  return (
    <Modal
      title={
        <Space>
          <ClockCircleOutlined style={{ color: '#ff7a00' }} />
          <span>Yêu cầu điểm danh bù</span>
        </Space>
      }
      open={visible}
      onCancel={handleCancel}
      footer={null}
      width={600}
      destroyOnClose
    >
      <Alert
        message="Lưu ý quan trọng"
        description="Yêu cầu điểm danh bù chỉ được sử dụng khi bạn quên thực hiện điểm danh trong thời hạn 24 giờ. Vui lòng cung cấp lý do cụ thể và chính đáng."
        type="warning"
        icon={<ExclamationCircleOutlined />}
        style={{ marginBottom: 20 }}
        showIcon
      />

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        requiredMark={false}
      >
        {/* Lecture Information */}
        <div style={{ 
          background: '#f5f5f5', 
          padding: '16px', 
          borderRadius: '6px', 
          marginBottom: '20px' 
        }}>
          <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
            Thông tin buổi học cần điểm danh bù
          </Title>
          
          <Space direction="vertical" size={4} style={{ width: '100%' }}>
            <div>
              <Text strong>Tên buổi học: </Text>
              <Text>{lecture?.title || 'N/A'}</Text>
            </div>
            
            <div>
              <Text strong>Lớp học: </Text>
              <Text>{classroom?.name || 'N/A'}</Text>
            </div>
            
            <div>
              <Text strong>Ngày và giờ học: </Text>
              <Text>{formatLectureInfo()}</Text>
            </div>
            
            {lecture?.description && (
              <div>
                <Text strong>Mô tả: </Text>
                <Text>{lecture.description}</Text>
              </div>
            )}
          </Space>
        </div>

        <Divider />

        {/* Reason Input */}
        <Form.Item
          name="reason"
          label={
            <span>
              <Text strong>Lý do quên điểm danh</Text>
              <Text type="danger"> *</Text>
            </span>
          }
          rules={[
            { 
              required: true, 
              message: 'Vui lòng nhập lý do quên điểm danh!' 
            },
            { 
              min: 10, 
              message: 'Lý do phải có ít nhất 10 ký tự!' 
            },
            { 
              max: 2000, 
              message: 'Lý do không được vượt quá 2000 ký tự!' 
            }
          ]}
          extra="Vui lòng mô tả chi tiết lý do tại sao bạn quên thực hiện điểm danh cho buổi học này."
        >
          <TextArea
            rows={6}
            placeholder="Ví dụ: Do có việc đột xuất phải xử lý khẩn cấp nên quên thực hiện điểm danh sau buổi học. Tôi xin lỗi về sự thiếu sót này và cam kết sẽ chú ý hơn trong các buổi học tiếp theo."
            showCount
            maxLength={2000}
          />
        </Form.Item>

        {/* Action Buttons */}
        <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
          <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
            <Button onClick={handleCancel}>
              Hủy bỏ
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<ClockCircleOutlined />}
            >
              Gửi yêu cầu
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MakeupAttendanceRequestForm;
