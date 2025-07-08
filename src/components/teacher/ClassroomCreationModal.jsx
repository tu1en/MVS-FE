import {
    Button,
    Form,
    Input,
    message,
    Modal,
    Select,
    Spin
} from 'antd';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext'; // Import useAuth
import classroomService from '../../services/classroomService';
import courseService from '../../services/courseService'; // Import courseService

const { TextArea } = Input;
const { Option } = Select;

/**
 * Modal component for creating a new classroom.
 */
const ClassroomCreationModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const { user } = useAuth(); // Get user from AuthContext

  useEffect(() => {
    if (visible) {
      setLoading(true);
      courseService.getAllCourses()
        .then(response => {
          setCourses(response.data);
        })
        .catch(error => {
          message.error("Không thể tải danh sách khóa học.");
          console.error("Failed to fetch courses:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [visible]);


  const handleSubmit = async (values) => {
    if (!user || !user.id) {
        message.error("Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.");
        return;
    }
    
    try {
      setLoading(true);

      const classroomData = {
        name: values.name,
        description: values.description,
        teacherId: user.id, // Use logged-in user's ID
        courseId: values.courseId, // Add courseId from form
      };
      
      console.log('Creating classroom with data:', classroomData);
      
      const responseData = await classroomService.createClassroom(classroomData);
      
      console.log('Classroom created successfully:', responseData);
      message.success('Tạo lớp học thành công!');
      form.resetFields();
      onSuccess && onSuccess(responseData);
    } catch (error) {
      console.error('Error creating classroom:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi không xác định';
      message.error(`Không thể tạo lớp học: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={user && user.role === 'ROLE_TEACHER' ? "Đề Xuất Mở Lớp Học" : "Tạo Lớp Học Mới"}
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={() => form.submit()}>
          {user && user.role === 'ROLE_TEACHER' ? 'Gửi Đề Xuất' : 'Tạo Lớp Học'}
        </Button>,
      ]}
      destroyOnClose
      width={700}
    >
      <Spin spinning={loading}>
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Tên Lớp Học"
            rules={[{ required: true, message: 'Vui lòng nhập tên lớp học' }]}
          >
            <Input placeholder="Ví dụ: Lập trình Java cơ bản" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả lớp học' }]}
          >
            <TextArea rows={4} placeholder="Mô tả ngắn về nội dung lớp học" />
          </Form.Item>

          <Form.Item
            name="courseId"
            label="Thuộc Khóa Học"
            rules={[{ required: true, message: 'Vui lòng chọn khóa học' }]}
          >
            <Select placeholder="Chọn khóa học có sẵn">
              {courses.map(course => (
                <Option key={course.id} value={course.id}>
                  {course.name}
                </Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Giáo viên phụ trách"
          >
            <Input value={user ? user.fullName || user.username : ''} disabled />
          </Form.Item>

        </Form>
      </Spin>
    </Modal>
  );
};

export default ClassroomCreationModal; 