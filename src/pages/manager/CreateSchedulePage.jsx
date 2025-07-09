import { Button, Card, DatePicker, Form, Input, message, Select, TimePicker } from 'antd';
import { useEffect, useState } from 'react';
import { managerService } from '../../services/managerService';

const { Option } = Select;

function CreateSchedulePage() {
  const [form] = Form.useForm();
  const [teachers, setTeachers] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTeachers();
    fetchClasses();
  }, []);

  const fetchTeachers = async () => {
    try {
      const data = await managerService.getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      message.error('Không thể tải danh sách giáo viên');
    }
  };

  const fetchClasses = async () => {
    try {
      const data = await managerService.getClassrooms();
      setClasses(data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      message.error('Không thể tải danh sách lớp học');
    }
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const scheduleData = {
        classId: values.classId,
        subject: values.subject,
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        location: values.location,
        teacherId: parseInt(values.teacherId),
        materialsOption: values.materialsOption
      };

      await managerService.createSchedule(scheduleData);
      message.success('Tạo lịch học mới thành công!');
      form.resetFields();
    } catch (error) {
      console.error('Error creating schedule:', error);
      message.error('Không thể tạo lịch học. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '100vh', background: '#f5f5f5', padding: '32px 0' }}>      <Card
        title={<span style={{ fontSize: 22, fontWeight: 600 }}>Tạo lịch học mới</span>}
        variant="borderless"
        style={{ maxWidth: 700, width: '100%', boxShadow: '0 2px 12px #00000014', borderRadius: 12 }}
        styles={{ body: { padding: 32 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ gap: 16, display: 'flex', flexDirection: 'column' }}
        >
          <Form.Item
            name="classId"
            label="Tên lớp"
            rules={[{ required: true, message: 'Vui lòng chọn lớp!' }]}
          >
            <Select placeholder="Chọn lớp">
              {classes.map(cls => (
                <Option key={cls.id} value={cls.id}>{cls.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Môn học"
            rules={[{ required: true, message: 'Vui lòng nhập tên môn học!' }]}
          >
            <Input placeholder="Nhập tên môn học (e.g., Toán)" />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày học"
            rules={[{ required: true, message: 'Vui lòng chọn ngày học!' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Chọn thời điểm" />
          </Form.Item>

          <Form.Item
            name="startTime"
            label="Thời gian bắt đầu"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu!' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="Chọn thời gian" />
          </Form.Item>

          <Form.Item
            name="endTime"
            label="Thời gian kết thúc"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian kết thúc!' }]}
          >
            <TimePicker style={{ width: '100%' }} format="HH:mm" placeholder="Chọn thời gian" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Địa điểm"
            rules={[{ required: true, message: 'Vui lòng nhập địa điểm!' }]}
          >
            <Input placeholder="Nhập địa điểm (e.g., Phòng A101)" />
          </Form.Item>

          <Form.Item
            name="materialsOption"
            label="Tài liệu / Link Meet"
            initialValue="no"
          >
            <Select>
              <Option value="no">Không có</Option>
              <Option value="yes">Có tài liệu</Option>
              <Option value="meet">Có link Meet</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="teacherId"
            label="ID giáo viên"
            rules={[{ required: true, message: 'Vui lòng chọn giáo viên!' }]}
          >
            <Select placeholder="Chọn giáo viên">
              {teachers.map(teacher => (
                <Option key={teacher.id} value={teacher.id.toString()}>{teacher.name} (ID: {teacher.id})</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%', height: 44, fontSize: 16, fontWeight: 500 }}>
              Tạo Lịch Học
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default CreateSchedulePage;
