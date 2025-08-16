import { Button, Card, Form, Input, Select, Typography, message } from 'antd';
import { managerService } from '../../services/managerService';

const { TextArea } = Input;
const { Title } = Typography;

const CreateAnnouncement = () => {
  const [form] = Form.useForm();

  const handleSubmit = async (values) => {
    try {
      await managerService.createAnnouncement(values);
      message.success('Thông báo đã được tạo thành công!');
      form.resetFields();
    } catch (error) {
      console.error('Error creating announcement:', error);
      message.error('Có lỗi xảy ra khi tạo thông báo!');
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
            <Select.Option value="ALL">Tất cả</Select.Option>
            <Select.Option value="STUDENTS">Học sinh</Select.Option>
            <Select.Option value="TEACHERS">Giáo viên</Select.Option>
            <Select.Option value="ACCOUNTANTS">Kế toán viên</Select.Option>
            <Select.Option value="PARENTS">Phụ huynh</Select.Option>
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
