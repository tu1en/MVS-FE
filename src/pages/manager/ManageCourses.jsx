import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Modal, Space, Table } from 'antd';
import { useEffect, useState } from 'react';
import { managerService } from '../../services/managerService';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCourse, setEditingCourse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await managerService.getClassrooms();
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      message.error('Không thể tải danh sách khóa học');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tên Khóa Học',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Mô Tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Giáo Viên',
      dataIndex: 'teacher',
      key: 'teacher',
    },
    {
      title: 'Thời Lượng',
      dataIndex: 'duration',
      key: 'duration',
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="primary"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (course) => {
    setEditingCourse(course);
    form.setFieldsValue(course);
    setIsModalVisible(true);
  };

  const handleDelete = async (course) => {
    Modal.confirm({
      title: 'Xác nhận xóa khóa học',
      content: 'Bạn có chắc chắn muốn xóa khóa học "' + course.name + '"?',
      onOk: async () => {
        try {
          await managerService.deleteClassroom(course.id);
          message.success('Xóa khóa học thành công');
          fetchCourses();
        } catch (error) {
          console.error('Error deleting course:', error);
          message.error('Không thể xóa khóa học');
        }
      }
    });
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingCourse) {
        // Update existing course
        await managerService.updateClassroom(editingCourse.id, values);
        message.success('Cập nhật khóa học thành công');
      } else {
        // Add new course
        await managerService.createClassroom(values);
        message.success('Thêm khóa học thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingCourse(null);
      fetchCourses();
    } catch (error) {
      console.error('Error saving course:', error);
      message.error('Không thể lưu thông tin khóa học');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setEditingCourse(null);
  };

  const handleAddNew = () => {
    setEditingCourse(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  return (
    <Card title="Quản Lý Khóa Học" className="shadow-md">
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={handleAddNew}
        style={{ marginBottom: 16 }}
      >
        Thêm Khóa Học Mới
      </Button>

      <Table columns={columns} dataSource={courses} rowKey="id" loading={loading} />

      <Modal
        title={editingCourse ? 'Sửa Khóa Học' : 'Thêm Khóa Học Mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Tên Khóa Học"
            rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Mô Tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="teacher"
            label="Giáo Viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên giáo viên' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="duration"
            label="Thời Lượng"
            rules={[{ required: true, message: 'Vui lòng nhập thời lượng' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default ManageCourses;
