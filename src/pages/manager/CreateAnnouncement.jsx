import React from 'react';
import { Form, Input, Select, Button, Card, Typography } from 'antd';
import { toast } from 'react-toastify';
import AnnouncementService from '../../services/announcementService';

const { TextArea } = Input;
const { Title } = Typography;

const CreateAnnouncement = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      // Lấy userId từ localStorage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast.error('Không xác định được người tạo. Vui lòng đăng nhập lại.');
        window.location.href = '/login';
        return;
      }
      // Gửi kèm createdBy
      const payload = { ...values, createdBy: parseInt(userId, 10) };
      await AnnouncementService.createAnnouncement(payload);
      toast.success('Thông báo đã được tạo thành công!');
      form.resetFields();
    } catch (error) {
      // Robust error handling for 401 and other errors
      if (error.response && error.response.status === 401) {
        toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      } else {
        toast.error('Có lỗi xảy ra khi tạo thông báo!');
      }
    }
  };



  return (
    <Card className="max-w-3xl mx-auto mt-8">
      <Title level={2} className="text-center mb-6">Tạo Thông Báo Mới</Title>
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Form.Item
          name="title"
          label="Tiêu đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
        >
          <Input placeholder="Nhập tiêu đề thông báo" />
        </Form.Item>

        <Form.Item
          name="content"
          label="Nội dung"
          rules={[{ required: true, message: 'Vui lòng nhập nội dung thông báo!' }]}
        >
          <TextArea
            rows={6}
            placeholder="Nhập nội dung chi tiết của thông báo"
          />
        </Form.Item>

        <Form.Item
          name="targetAudience"
          label="Đối tượng nhận thông báo"
          rules={[{ required: true, message: 'Vui lòng chọn đối tượng nhận thông báo!' }]}
        >
          <Select placeholder="Chọn đối tượng nhận thông báo">
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="students">Sinh viên</Select.Option>
            <Select.Option value="teachers">Giáo viên</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item className="text-right">
          <Button type="primary" htmlType="submit">
            Đăng Thông Báo
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateAnnouncement;
