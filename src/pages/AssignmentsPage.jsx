import {
  ClockCircleOutlined,
  FileTextOutlined,
  PlusOutlined
} from '@ant-design/icons';
import {
  App,
  Button,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table
} from 'antd';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import AssignmentService from '../services/assignmentService';
import ClassroomService from '../services/classroomService';

const { Option } = Select;
const { TextArea } = Input;

export default function AssignmentsPage() {
  const { message } = App.useApp();
  const { user } = useAuth();
  const userId = user?.id;
  const userRole = user?.role?.replace('ROLE_', '');
  const isTeacher = userRole === 'TEACHER';
  const isStudent = userRole === 'STUDENT';

  const [assignments, setAssignments] = useState([]);
  const [submissions, setSubmissions] = useState({});
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [classroomLoading, setClassroomLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Fetch classrooms for teacher
  useEffect(() => {
    if (isTeacher) {
      const fetchClassrooms = async () => {
        try {
          setClassroomLoading(true);
          const data = await ClassroomService.getClassroomsByCurrentTeacher();
          // Extra safety: ensure data is array and has valid structure
          const validClassrooms = Array.isArray(data) ? data.filter(cls => cls && cls.id) : [];
          setClassrooms(validClassrooms);
        } catch (error) {
          console.error('Error fetching classrooms:', error);
          setClassrooms([]); // Ensure always an array
          message.error('Không thể tải danh sách lớp học.');
        } finally {
          setClassroomLoading(false);
        }
      };
      
      fetchClassrooms();
    }
  }, [isTeacher, message]);

  // Fetch assignments
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let data = [];
        if (isTeacher) {
          data = await AssignmentService.getCurrentTeacherAssignments();
        } else if (isStudent) {
          data = await AssignmentService.getUpcomingAssignments(userId);
        }
        // Ensure data is always an array with valid structure
        const validAssignments = Array.isArray(data) ? data.filter(assignment => assignment && assignment.id) : [];
        setAssignments(validAssignments);
      } catch (error) {
        console.error('Error fetching assignments:', error);
        setAssignments([]); // Ensure always an array
        message.error('Lỗi khi tải danh sách bài tập.');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) {
      fetchData();
    }
  }, [isTeacher, isStudent, userId, message]);

  const handleCreate = async (values) => {
    try {
      const payload = {
        ...values,
        dueDate: values.dueDate.toISOString(),
        points: values.points || 10
      };
      await AssignmentService.createAssignment(payload);
      message.success('Tạo bài tập thành công!');
      setIsModalVisible(false);
      form.resetFields();
      
      // Refresh assignments after creating new one
      if (isTeacher) {
        const updatedAssignments = await AssignmentService.getCurrentTeacherAssignments();
        setAssignments(Array.isArray(updatedAssignments) ? updatedAssignments : []);
      }
    } catch (error) {
      console.error('Error creating assignment:', error);
      message.error('Không thể tạo bài tập.');
    }
  };

  const columns = [
    {
      title: 'Tên bài tập',
      dataIndex: 'title',
      key: 'title',
      render: (text) => (
        <Space>
          <FileTextOutlined />
          <strong>{text || 'Chưa có tiêu đề'}</strong>
        </Space>
      )
    },
    {
      title: 'Hạn nộp',
      dataIndex: 'dueDate',
      key: 'dueDate',
      render: (date) => {
        if (!date) return 'Không có hạn';
        const dueDate = new Date(date);
        const isOverdue = new Date() > dueDate;
        return (
          <Space>
            <ClockCircleOutlined style={{ color: isOverdue ? '#ff4d4f' : '#1890ff' }} />
            <span style={{ color: isOverdue ? '#ff4d4f' : 'inherit' }}>
              {dueDate.toLocaleDateString('vi-VN')}
            </span>
          </Space>
        );
      }
    },
    {
      title: 'Điểm',
      dataIndex: 'points',
      key: 'points',
      render: (points) => `${points || 10} điểm`
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          {isStudent && (
            <Button type="primary" size="small">
              Nộp bài
            </Button>
          )}
          {isTeacher && (
            <>
              <Button size="small">Chấm bài</Button>
              <Button size="small">Sửa</Button>
            </>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Quản lý bài tập</h2>
        {isTeacher && (
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setIsModalVisible(true)}
            disabled={classroomLoading}
          >
            Tạo bài tập
          </Button>
        )}
      </div>

      <Table
        columns={columns}
        dataSource={assignments}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: loading ? 'Đang tải...' : 'Không có bài tập nào'
        }}
      />

      {/* Modal tạo bài tập */}
      <Modal
        title="Tạo bài tập mới"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="title" label="Tiêu đề" rules={[{ required: true, message: 'Vui lòng nhập tiêu đề' }]}>
            <Input placeholder="Nhập tiêu đề bài tập" />
          </Form.Item>

          <Form.Item name="description" label="Mô tả" rules={[{ required: true, message: 'Vui lòng nhập mô tả' }]}>
            <TextArea rows={4} placeholder="Nhập mô tả bài tập" />
          </Form.Item>

          <Form.Item name="classroomId" label="Lớp học" rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}>
            <Select 
              placeholder="Chọn lớp học"
              loading={classroomLoading}
              notFoundContent={classroomLoading ? 'Đang tải...' : 'Không có lớp học nào'}
            >
              {/* Extra safety check with optional chaining */}
              {classrooms?.map((cls) => (
                <Option key={cls?.id} value={cls?.id}>
                  {cls?.name || `Lớp ${cls?.id}` || 'Lớp không tên'}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="dueDate" label="Hạn nộp" rules={[{ required: true, message: 'Vui lòng chọn hạn nộp' }]}>
            <DatePicker 
              showTime 
              format="YYYY-MM-DD HH:mm:ss" 
              style={{ width: '100%' }}
              placeholder="Chọn ngày và giờ"
            />
          </Form.Item>

          <Form.Item name="points" label="Điểm tối đa" initialValue={10}>
            <InputNumber min={1} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
              Tạo bài tập
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}