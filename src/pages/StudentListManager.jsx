import {
  DownloadOutlined,
  EyeOutlined,
  MailOutlined,
  PhoneOutlined,
  SendOutlined,
  TrophyOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  Input,
  Menu,
  message,
  Modal,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag
} from 'antd';
import { useEffect, useState } from 'react';
import CourseService from '../services/courseService';
import StudentService from '../services/studentService';

const { Option } = Select;
const { Search } = Input;

const StudentListManager = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);
  const [classes, setClasses] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchStudents();
    }
  }, [selectedClass, searchText, filterStatus]);

  const fetchClasses = async () => {
    try {
      // Use CourseService to get teacher's courses
      const data = await CourseService.getMyMyCourses();
      setClasses(data);
      if (data.length > 0) {
        setSelectedClass(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
      message.error('Không thể tải danh sách lớp học');
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      // Use StudentService to get students by class/course
      const data = await StudentService.getStudentsByClass(selectedClass, {
        search: searchText,
        status: filterStatus
      });
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
      message.error('Không thể tải danh sách sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const viewStudentDetails = async (studentId) => {
    try {
      // Use StudentService to get student details
      const data = await StudentService.getStudentDetails(studentId);
      setSelectedStudent(data);
      setModalVisible(true);
    } catch (error) {
      console.error('Error fetching student details:', error);
      message.error('Không thể tải thông tin sinh viên');
    }
  };

  const sendMessageToStudent = (student) => {
    Modal.confirm({
      title: `Gửi tin nhắn cho ${student.fullName}`,
      content: (
        <Input.TextArea 
          rows={4} 
          placeholder="Nhập nội dung tin nhắn..."
          id="messageContent"
        />
      ),
      onOk: async () => {
        const content = document.getElementById('messageContent').value;
        if (content.trim()) {
          try {
            // Use StudentService to send message
            await StudentService.sendMessageToStudent(student.id, {
              content: content,
              type: 'TEACHER_TO_STUDENT'
            });
            message.success('Đã gửi tin nhắn thành công');
          } catch (error) {
            console.error('Error sending message:', error);
            message.error('Không thể gửi tin nhắn');
          }
        }
      }
    });
  };

  const exportStudentList = async () => {
    try {
      // Use StudentService to export student list
      const blob = await StudentService.exportStudentList({
        classId: selectedClass
      }, 'xlsx');
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `danh-sach-sinh-vien-${selectedClass}.xlsx`;
      a.click();
      window.URL.revokeObjectURL(url);
      message.success('Đã xuất danh sách thành công');
    } catch (error) {
      message.error('Không thể xuất danh sách');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return 'green';
      case 'INACTIVE': return 'red';
      case 'SUSPENDED': return 'orange';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'ACTIVE': return 'Đang học';
      case 'INACTIVE': return 'Nghỉ học';
      case 'SUSPENDED': return 'Tạm dừng';
      default: return 'Không xác định';
    }
  };

  const getActionMenu = (student) => (
    <Menu>
      <Menu.Item 
        key="view" 
        icon={<EyeOutlined />}
        onClick={() => viewStudentDetails(student.id)}
      >
        Xem chi tiết
      </Menu.Item>
      <Menu.Item 
        key="message" 
        icon={<SendOutlined />}
        onClick={() => sendMessageToStudent(student)}
      >
        Gửi tin nhắn
      </Menu.Item>
      <Menu.Item 
        key="performance" 
        icon={<TrophyOutlined />}
        onClick={() => window.open(`/student-performance/${student.id}`, '_blank')}
      >
        Xem học lực
      </Menu.Item>
    </Menu>
  );

  const columns = [
    {
      title: 'Sinh viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <Space>
          <Avatar 
            src={record.avatar} 
            icon={<UserOutlined />}
            size="large"
          />
          <div>
            <div style={{ fontWeight: 'bold' }}>{text}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>
              MSSV: {record.studentCode}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Liên hệ',
      key: 'contact',
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: '4px' }}>
            <MailOutlined style={{ marginRight: '4px' }} />
            {record.email}
          </div>
          <div>
            <PhoneOutlined style={{ marginRight: '4px' }} />
            {record.phone || 'Chưa cập nhật'}
          </div>
        </div>
      ),
    },
    {
      title: 'Điểm danh',
      key: 'attendance',
      render: (_, record) => (
        <div>
          <Progress 
            percent={record.attendanceRate || 0} 
            size="small"
            format={percent => `${percent}%`}
          />
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.presentCount || 0}/{record.totalSessions || 0} buổi
          </div>
        </div>
      ),
    },
    {
      title: 'Điểm TB',
      key: 'gpa',
      render: (_, record) => (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '16px', fontWeight: 'bold', color: record.gpa >= 8 ? '#52c41a' : record.gpa >= 6.5 ? '#faad14' : '#f5222d' }}>
            {record.gpa?.toFixed(2) || 'N/A'}
          </div>
          <div style={{ fontSize: '12px', color: '#666' }}>
            {record.totalAssignments || 0} bài tập
          </div>
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Dropdown overlay={getActionMenu(record)} trigger={['click']}>
          <Button type="primary" size="small">
            Thao tác
          </Button>
        </Dropdown>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header Controls */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={6}>
            <Select
              style={{ width: '100%' }}
              placeholder="Chọn lớp học"
              value={selectedClass}
              onChange={setSelectedClass}
              loading={!classes.length}
            >
              {classes.map(cls => (
                <Option key={cls.id} value={cls.id}>
                  {cls.name} ({cls.studentCount} SV)
                </Option>
              ))}
            </Select>
          </Col>
          <Col span={6}>
            <Search
              placeholder="Tìm kiếm sinh viên..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={fetchStudents}
              enterButton
            />
          </Col>
          <Col span={4}>
            <Select
              style={{ width: '100%' }}
              value={filterStatus}
              onChange={setFilterStatus}
            >
              <Option value="all">Tất cả</Option>
              <Option value="ACTIVE">Đang học</Option>
              <Option value="INACTIVE">Nghỉ học</Option>
              <Option value="SUSPENDED">Tạm dừng</Option>
            </Select>
          </Col>
          <Col span={8}>
            <Space>
              <Button 
                type="primary" 
                icon={<DownloadOutlined />}
                onClick={exportStudentList}
              >
                Xuất Excel
              </Button>
              <Button 
                icon={<SendOutlined />}
                onClick={() => {
                  // Send notification to all students
                  Modal.info({
                    title: 'Gửi thông báo đến tất cả sinh viên',
                    content: 'Tính năng sẽ được phát triển...'
                  });
                }}
              >
                Gửi thông báo
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Statistics */}
      {selectedClass && (
        <Row gutter={16} style={{ marginBottom: '24px' }}>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Tổng sinh viên" 
                value={students.length}
                prefix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Đang học" 
                value={students.filter(s => s.status === 'ACTIVE').length}
                valueStyle={{ color: '#3f8600' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Điểm danh TB" 
                value={students.length ? (students.reduce((sum, s) => sum + (s.attendanceRate || 0), 0) / students.length).toFixed(1) : 0}
                suffix="%"
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic 
                title="Điểm TB lớp" 
                value={students.length ? (students.reduce((sum, s) => sum + (s.gpa || 0), 0) / students.length).toFixed(2) : 0}
                valueStyle={{ color: '#722ed1' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      {/* Student Table */}
      <Card 
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
            Danh sách sinh viên
          </div>
        }
      >
        <Table
          columns={columns}
          dataSource={students}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} sinh viên`,
          }}
        />
      </Card>

      {/* Student Detail Modal */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <Avatar 
              src={selectedStudent?.avatar} 
              icon={<UserOutlined />}
              style={{ marginRight: '8px' }}
            />
            Thông tin chi tiết sinh viên
          </div>
        }
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={[
          <Button key="message" type="primary" icon={<SendOutlined />}
            onClick={() => {
              setModalVisible(false);
              sendMessageToStudent(selectedStudent);
            }}>
            Gửi tin nhắn
          </Button>,
          <Button key="close" onClick={() => setModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={800}
      >
        {selectedStudent && (
          <Descriptions bordered column={2}>
            <Descriptions.Item label="Họ và tên" span={2}>
              {selectedStudent.fullName}
            </Descriptions.Item>
            <Descriptions.Item label="MSSV">
              {selectedStudent.studentCode}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={getStatusColor(selectedStudent.status)}>
                {getStatusText(selectedStudent.status)}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              <a href={`mailto:${selectedStudent.email}`}>
                {selectedStudent.email}
              </a>
            </Descriptions.Item>
            <Descriptions.Item label="Số điện thoại">
              {selectedStudent.phone || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ" span={2}>
              {selectedStudent.address || 'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày sinh">
              {selectedStudent.dateOfBirth ? 
                new Date(selectedStudent.dateOfBirth).toLocaleDateString('vi-VN') : 
                'Chưa cập nhật'}
            </Descriptions.Item>
            <Descriptions.Item label="Giới tính">
              {selectedStudent.gender === 'MALE' ? 'Nam' : 
               selectedStudent.gender === 'FEMALE' ? 'Nữ' : 'Chưa xác định'}
            </Descriptions.Item>
            <Descriptions.Item label="Điểm trung bình">
              <span style={{ 
                fontSize: '16px', 
                fontWeight: 'bold',
                color: selectedStudent.gpa >= 8 ? '#52c41a' : 
                       selectedStudent.gpa >= 6.5 ? '#faad14' : '#f5222d'
              }}>
                {selectedStudent.gpa?.toFixed(2) || 'N/A'}
              </span>
            </Descriptions.Item>
            <Descriptions.Item label="Tỷ lệ điểm danh">
              <Progress 
                percent={selectedStudent.attendanceRate || 0}
                size="small"
                format={percent => `${percent}%`}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Tổng bài tập">
              {selectedStudent.totalAssignments || 0}
            </Descriptions.Item>
            <Descriptions.Item label="Bài tập đã nộp">
              {selectedStudent.submittedAssignments || 0}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default StudentListManager;
