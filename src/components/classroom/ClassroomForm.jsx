import React, { useState, useEffect } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Space,
  message,
  Select,
  Row,
  Col,
  Divider
} from 'antd';
import {
  SaveOutlined,
  ArrowLeftOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import classroomService from '../../services/classroomService';
import userService from '../../services/userService';

const { TextArea } = Input;
const { Option } = Select;

/**
 * Component form tạo/chỉnh sửa classroom
 */
const ClassroomForm = ({ mode = 'create' }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [loadingTeachers, setLoadingTeachers] = useState(false);

  const isEdit = mode === 'edit' || id;

  // Load teachers for selection
  const loadTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const response = await userService.getUsersByRole('TEACHER');
      setTeachers(response || []);
    } catch (error) {
      console.error('Error loading teachers:', error);
      message.error('Không thể tải danh sách giáo viên');
    } finally {
      setLoadingTeachers(false);
    }
  };

  // Load classroom data for editing
  const loadClassroom = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const classroom = await classroomService.getClassroomById(id);
      form.setFieldsValue({
        classroomName: classroom.classroomName,
        description: classroom.description,
        teacherId: classroom.teacherId,
      });
    } catch (error) {
      console.error('Error loading classroom:', error);
      message.error('Không thể tải thông tin lớp học');
      navigate('/classrooms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTeachers();
    if (isEdit) {
      loadClassroom();
    }
  }, [id, isEdit]);

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      if (isEdit) {
        await classroomService.updateClassroom(id, {
          name: values.classroomName,
          description: values.description,
        });
        message.success('Cập nhật lớp học thành công');
      } else {
        await classroomService.createClassroom(values);
        message.success('Tạo lớp học thành công');
      }
      
      navigate('/classrooms');
    } catch (error) {
      console.error('Error saving classroom:', error);
      message.error(
        isEdit ? 'Không thể cập nhật lớp học' : 'Không thể tạo lớp học'
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    navigate('/classrooms');
  };

  return (
    <Card
      title={
        <Space>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={handleCancel}
          />
          {isEdit ? 'Chỉnh Sửa Lớp Học' : 'Tạo Lớp Học Mới'}
        </Space>
      }
    >
      <Row justify="center">
        <Col xs={24} sm={20} md={16} lg={12}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              label="Tên Lớp Học"
              name="classroomName"
              rules={[
                {
                  required: true,
                  message: 'Vui lòng nhập tên lớp học',
                },
                {
                  min: 3,
                  max: 100,
                  message: 'Tên lớp học phải từ 3-100 ký tự',
                },
              ]}
            >
              <Input
                placeholder="Nhập tên lớp học..."
                showCount
                maxLength={100}
              />
            </Form.Item>

            <Form.Item
              label="Mô Tả"
              name="description"
              rules={[
                {
                  max: 500,
                  message: 'Mô tả không được vượt quá 500 ký tự',
                },
              ]}
            >
              <TextArea
                placeholder="Nhập mô tả lớp học..."
                rows={4}
                showCount
                maxLength={500}
              />
            </Form.Item>

            {!isEdit && (
              <Form.Item
                label="Giáo Viên"
                name="teacherId"
                rules={[
                  {
                    required: true,
                    message: 'Vui lòng chọn giáo viên',
                  },
                ]}
              >
                <Select
                  placeholder="Chọn giáo viên..."
                  loading={loadingTeachers}
                  showSearch
                  filterOption={(input, option) =>
                    option.children.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  {teachers.map((teacher) => (
                    <Option key={teacher.id} value={teacher.id}>
                      <Space>
                        <UserOutlined />
                        {teacher.fullName || teacher.username}
                        {teacher.email && (
                          <span style={{ color: '#666' }}>({teacher.email})</span>
                        )}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}

            <Divider />

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  icon={<SaveOutlined />}
                  size="large"
                >
                  {isEdit ? 'Cập Nhật' : 'Tạo Lớp Học'}
                </Button>
                <Button
                  type="default"
                  onClick={handleCancel}
                  size="large"
                >
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </Card>
  );
};

export default ClassroomForm;
