import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Card } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';

const ManageCourses = () => {
  const [courses, setCourses] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingCourse, setEditingCourse] = useState(null);

  // Temporary data for testing
  useEffect(() => {
    setCourses([
      {
        id: 1,
        name: 'Toán Đại Số',
        description: 'Khóa học toán đại số cơ bản',
        teacher: 'Nguyễn Văn A',
        duration: '3 tháng',
      },
      {
        id: 2,
        name: 'Vật Lý Cơ Bản',
        description: 'Khóa học vật lý dành cho học sinh THPT',
        teacher: 'Trần Thị B',
        duration: '4 tháng',
      },
    ]);
  }, []);

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

  const handleDelete = (course) => {
    Modal.confirm({
      title: 'Xác nhận xóa khóa học',
      content: 'Bạn có chắc chắn muốn xóa khóa học "' + course.name + '"?',
      onOk() {
        setCourses(courses.filter((item) => item.id !== course.id));
        message.success('Xóa khóa học thành công');
      },
    });
  };

  const handleModalOk = () => {
    form.validateFields().then((values) => {
      if (editingCourse) {
        // Update existing course
        setCourses(
          courses.map((course) =>
            course.id === editingCourse.id ? { ...course, ...values } : course
          )
        );
        message.success('Cập nhật khóa học thành công');
      } else {
        // Add new course
        const newCourse = {
          id: Math.max(...courses.map((c) => c.id)) + 1,
          ...values,
        };
        setCourses([...courses, newCourse]);
        message.success('Thêm khóa học thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingCourse(null);
    });
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

      <Table columns={columns} dataSource={courses} rowKey="id" />

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
