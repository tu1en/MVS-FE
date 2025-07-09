import { CalendarOutlined, DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, Modal, Popconfirm, Select, Space, Table, Tag, TimePicker, message } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { managerService } from '../../services/managerService';

const { Option } = Select;

const ManageSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSchedules();
    fetchTeachers();
    fetchClassrooms();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const data = await managerService.getSchedules();
      setSchedules(data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
      message.error('Không thể tải danh sách lịch học');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const data = await managerService.getTeachers();
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      message.error('Không thể tải danh sách giáo viên');
    }
  };

  const fetchClassrooms = async () => {
    try {
      const data = await managerService.getClassrooms();
      setClassrooms(data);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      message.error('Không thể tải danh sách lớp học');
    }
  };

  const handleDelete = async (scheduleId) => {
    try {
      await managerService.deleteSchedule(scheduleId);
      message.success('Xóa lịch học thành công');
      fetchSchedules();
    } catch (error) {
      console.error('Error deleting schedule:', error);
      message.error('Không thể xóa lịch học');
    }
  };

  const handleAddSchedule = () => {
    setEditingSchedule(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule);
    form.setFieldsValue({
      ...schedule,
      date: schedule.date ? moment(schedule.date) : null,
      startTime: schedule.startTime ? moment(schedule.startTime, 'HH:mm') : null,
      endTime: schedule.endTime ? moment(schedule.endTime, 'HH:mm') : null,
      teacherId: schedule.teacher?.id || schedule.teacherId,
      classroomId: schedule.classroom?.id || schedule.classroomId
    });
    setIsModalVisible(true);
  };

  const handleSubmit = async (values) => {
    try {
      const scheduleData = {
        ...values,
        date: values.date ? values.date.format('YYYY-MM-DD') : null,
        startTime: values.startTime ? values.startTime.format('HH:mm') : null,
        endTime: values.endTime ? values.endTime.format('HH:mm') : null
      };

      if (editingSchedule) {
        await managerService.updateSchedule(editingSchedule.id, scheduleData);
        message.success('Cập nhật lịch học thành công');
      } else {
        await managerService.createSchedule(scheduleData);
        message.success('Tạo lịch học thành công');
      }
      setIsModalVisible(false);
      form.resetFields();
      fetchSchedules();
    } catch (error) {
      console.error('Error saving schedule:', error);
      message.error('Không thể lưu lịch học');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Tên lịch học',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Giáo viên',
      dataIndex: 'teacher',
      key: 'teacher',
      render: (teacher, record) => teacher?.fullName || teacher?.username || record.teacherName || 'Chưa phân công'
    },
    {
      title: 'Lớp học',
      dataIndex: 'classroom',
      key: 'classroom',
      render: (classroom, record) => classroom?.name || record.classroomName || 'Chưa phân công'
    },
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => date ? moment(date).format('DD/MM/YYYY') : ''
    },
    {
      title: 'Giờ bắt đầu',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time) => time || ''
    },
    {
      title: 'Giờ kết thúc',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time) => time || ''
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusConfig = {
          'SCHEDULED': { color: 'blue', text: 'Đã lên lịch' },
          'ONGOING': { color: 'green', text: 'Đang diễn ra' },
          'COMPLETED': { color: 'gray', text: 'Đã hoàn thành' },
          'CANCELLED': { color: 'red', text: 'Đã hủy' }
        };
        const config = statusConfig[status] || { color: 'default', text: status || 'Chưa xác định' };
        return <Tag color={config.color}>{config.text}</Tag>;
      }
    },
    {
      title: 'Hành động',
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEditSchedule(record)}
          />
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa lịch học này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0 }}>
            <CalendarOutlined style={{ marginRight: 8 }} />
            Quản lý lịch học
          </h2>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddSchedule}>
            Thêm lịch học
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={schedules}
          loading={loading}
          rowKey="id"
          pagination={{
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lịch học`
          }}
        />

        <Modal
          title={editingSchedule ? 'Chỉnh sửa lịch học' : 'Thêm lịch học mới'}
          open={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              label="Tên lịch học"
              name="title"
              rules={[{ required: true, message: 'Vui lòng nhập tên lịch học!' }]}
            >
              <Input placeholder="Nhập tên lịch học" />
            </Form.Item>

            <Form.Item
              label="Mô tả"
              name="description"
            >
              <Input.TextArea placeholder="Nhập mô tả" rows={3} />
            </Form.Item>

            <Form.Item
              label="Giáo viên"
              name="teacherId"
              rules={[{ required: true, message: 'Vui lòng chọn giáo viên!' }]}
            >
              <Select placeholder="Chọn giáo viên">
                {teachers.map(teacher => (
                  <Option key={teacher.id} value={teacher.id}>
                    {teacher.fullName || teacher.username}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Lớp học"
              name="classroomId"
              rules={[{ required: true, message: 'Vui lòng chọn lớp học!' }]}
            >
              <Select placeholder="Chọn lớp học">
                {classrooms.map(classroom => (
                  <Option key={classroom.id} value={classroom.id}>
                    {classroom.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Ngày"
              name="date"
              rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}
            >
              <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
            </Form.Item>

            <Space style={{ width: '100%' }}>
              <Form.Item
                label="Giờ bắt đầu"
                name="startTime"
                rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
              >
                <TimePicker format="HH:mm" />
              </Form.Item>

              <Form.Item
                label="Giờ kết thúc"
                name="endTime"
                rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
              >
                <TimePicker format="HH:mm" />
              </Form.Item>
            </Space>

            <Form.Item
              label="Trạng thái"
              name="status"
            >
              <Select placeholder="Chọn trạng thái">
                <Option value="SCHEDULED">Đã lên lịch</Option>
                <Option value="ONGOING">Đang diễn ra</Option>
                <Option value="COMPLETED">Đã hoàn thành</Option>
                <Option value="CANCELLED">Đã hủy</Option>
              </Select>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={() => setIsModalVisible(false)}>
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingSchedule ? 'Cập nhật' : 'Thêm mới'}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default ManageSchedule;
