import {
    Button,
    Form,
    Input,
    message,
    Modal,
    Select,
    Spin
} from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';

const { TextArea } = Input;
const { Option } = Select;

/**
 * Modal component for creating a new course
 */
const CourseCreationModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchClassrooms();
    }
  }, [visible]);

  const fetchClassrooms = async () => {
    try {
      setLoadingClassrooms(true);
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');

      const response = await axios.get('http://localhost:8088/api/classrooms', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Available classrooms:', response.data);
      setClassrooms(response.data || []);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      message.error('Không thể tải danh sách lớp học');
    } finally {
      setLoadingClassrooms(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!values.classroomId) {
        message.error('Vui lòng chọn một lớp học');
        setLoading(false);
        return;
      }
      
      // Course data structure
      const courseData = {
        name: values.name,
        description: values.description,
        subject: values.subject,
        section: values.section || values.name,
        teacherId: parseInt(localStorage.getItem('userId')) || 0,
        classroomId: parseInt(values.classroomId)
      };
      
      console.log('Creating course with data:', courseData);
      
      // Using fetch instead of axios for better error handling
      const response = await fetch(`http://localhost:8088/api/classrooms`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(courseData)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`API error (${response.status}): ${errorData}`);
      }
      
      const responseData = await response.json();
      console.log('Course created successfully:', responseData);
      message.success('Đã tạo khóa học thành công');
      form.resetFields();
      onSuccess && onSuccess(responseData);
    } catch (error) {
      console.error('Error creating course:', error);
      // Format error message safely
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi không xác định';
      message.error(`Không thể tạo khóa học: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Tạo khóa học mới"
      visible={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Tên khóa học"
          rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}
        >
          <Input placeholder="Ví dụ: Lập trình Java cơ bản" />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Môn học"
          rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
        >
          <Input placeholder="Ví dụ: Công nghệ phần mềm" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học' }]}
        >
          <TextArea rows={4} placeholder="Mô tả ngắn về nội dung khóa học" />
        </Form.Item>

        <Form.Item
          name="section"
          label="Lớp học phần"
          rules={[{ required: true, message: 'Vui lòng nhập lớp học phần' }]}
        >
          <Input placeholder="Ví dụ: SE1905" />
        </Form.Item>

        <Form.Item
          name="classroomId"
          label="Chọn lớp học"
          rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}
        >
          <Select
            placeholder="Chọn lớp học"
            loading={loadingClassrooms}
            notFoundContent={loadingClassrooms ? <Spin size="small" /> : 'Không tìm thấy lớp học nào'}
          >
            {classrooms.map(classroom => (
              <Option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
          <Button style={{ marginRight: 8 }} onClick={onCancel}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Tạo khóa học
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CourseCreationModal;
