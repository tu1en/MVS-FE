import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, HistoryOutlined, MessageOutlined, PlusOutlined, TeamOutlined, UserOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { App, Button, Card, Col, DatePicker, Form, Input, Modal, Row, Select, Space, Spin, Table, Tabs, Tag, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout, { DashboardColors, DashboardIcons } from '../../components/common/DashboardLayout';
import { ROLE } from '../../constants/constants';
import { useAuth } from '../../context/AuthContext';
import absenceService from '../../services/absenceService';
import teacherService from '../../services/teacherService';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

export default function TeacherDashboard() {
  const { message: antdMessage } = App.useApp();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({
    classStats: { totalClasses: 0, totalStudents: 0 },
    assignmentStats: { pendingGrading: 0 },
    attendanceStats: { averageAttendance: 0 },
    weeklyShifts: 0,
    monthlyHours: 0,
    attendanceScore: 0,
  });
  const [myShifts, setMyShifts] = useState([]);
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [leaveRequestModal, setLeaveRequestModal] = useState(false);
  const [leaveForm] = Form.useForm();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    if (!token || role !== ROLE.TEACHER) {
      antdMessage.error('Bạn không có quyền truy cập trang này');
      navigate('/login');
      return;
    }

    loadDashboardData();
  }, [navigate, antdMessage, user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Lấy dữ liệu dashboard stats
      let statsData = {};
      try {
        const statsResponse = await teacherService.getDashboardStats();
        statsData = statsResponse.data || statsResponse || {};
      } catch (statsError) {
        console.error('Lỗi khi tải stats:', statsError);
        // Sử dụng dữ liệu mặc định nếu API thất bại
        statsData = {
          classStats: { totalClasses: 0, totalStudents: 0 },
          assignmentStats: { pendingGrading: 0 },
          attendanceStats: { averageAttendance: 0 },
          weeklyShifts: 0,
          monthlyHours: 0,
          attendanceScore: 0,
        };
      }

      // Lấy dữ liệu leave requests
      let leaveRequestsData = [];
      try {
        const leaveRequestsResponse = await absenceService.getMyLeaveRequests();
        leaveRequestsData = leaveRequestsResponse.data || [];
      } catch (leaveError) {
        console.error('Lỗi khi tải leave requests:', leaveError);
        // Sử dụng dữ liệu rỗng nếu API thất bại
        leaveRequestsData = [];
      }

      setDashboardStats(statsData);
      setMyLeaveRequests(leaveRequestsData);
      
      // Mock data for shifts and attendance (sẽ được thay thế bằng API thực tế sau)
      setMyShifts([
        {
          id: 1,
          date: '2024-01-15',
          startTime: '08:00',
          endTime: '12:00',
          status: 'scheduled',
          location: 'Phòng A101'
        },
        {
          id: 2,
          date: '2024-01-16',
          startTime: '14:00',
          endTime: '18:00',
          status: 'completed',
          location: 'Phòng B202'
        }
      ]);

      setAttendanceHistory([
        {
          id: 1,
          date: '2024-01-14',
          checkIn: '07:58',
          checkOut: '12:05',
          status: 'on_time',
          workingHours: 4.12
        },
        {
          id: 2,
          date: '2024-01-13',
          checkIn: '08:15',
          checkOut: '12:00',
          status: 'late',
          workingHours: 3.75
        }
      ]);

    } catch (error) {
      console.error('Lỗi tổng thể khi tải dữ liệu dashboard:', error);
      antdMessage.error('Có lỗi xảy ra khi tải dữ liệu. Một số tính năng có thể bị hạn chế.');
    } finally {
      setLoading(false);
    }
  };

  // Statistics for dashboard
  const stats = [
    {
      title: 'Tổng số lớp',
      value: dashboardStats.classStats?.totalClasses || 0,
      icon: DashboardIcons.users,
      color: DashboardColors.primary
    },
    {
      title: 'Tổng học sinh',
      value: dashboardStats.classStats?.totalStudents || 0,
      icon: DashboardIcons.students,
      color: DashboardColors.success
    },
    {
      title: 'Chờ chấm điểm',
      value: dashboardStats.assignmentStats?.pendingGrading || 0,
      icon: DashboardIcons.assignments,
      color: DashboardColors.warning
    },
    {
      title: 'Chuyên cần TB',
      value: dashboardStats.attendanceStats?.averageAttendance || 0,
      suffix: '%',
      icon: DashboardIcons.attendance,
      color: (dashboardStats.attendanceStats?.averageAttendance || 0) >= 80 ? DashboardColors.success : DashboardColors.danger
    },
    {
      title: 'Ca làm việc tuần này',
      value: dashboardStats.weeklyShifts || 0,
      icon: DashboardIcons.calendar,
      color: DashboardColors.info
    },
    {
      title: 'Giờ làm việc tháng này',
      value: dashboardStats.monthlyHours || 0,
      suffix: 'giờ',
      icon: DashboardIcons.clock,
      color: DashboardColors.secondary
    },
    {
      title: 'Đơn xin nghỉ',
      value: myLeaveRequests.length,
      icon: DashboardIcons.document,
      color: DashboardColors.danger
    },
    {
      title: 'Điểm chấm công',
      value: dashboardStats.attendanceScore || 0,
      suffix: '%',
      icon: DashboardIcons.success,
      color: DashboardColors.success
    }
  ];

  // Columns for shifts table
  const shiftsColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => `${record.startTime} - ${record.endTime}`
    },
    {
      title: 'Địa điểm',
      dataIndex: 'location',
      key: 'location'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'completed' ? 'green' : 
          status === 'scheduled' ? 'blue' : 
          status === 'cancelled' ? 'red' : 'orange'
        }>
          {status === 'completed' ? 'Hoàn thành' : 
           status === 'scheduled' ? 'Đã lên lịch' : 
           status === 'cancelled' ? 'Đã hủy' : 'Đang diễn ra'}
        </Tag>
      )
    }
  ];

  // Columns for leave requests table
  const leaveRequestsColumns = [
    {
      title: 'Loại đơn',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color="blue">
          {type === 'SICK_LEAVE' ? 'Nghỉ ốm' : 
           type === 'ANNUAL_LEAVE' ? 'Nghỉ phép' : 
           type === 'PERSONAL_LEAVE' ? 'Nghỉ cá nhân' : type}
        </Tag>
      )
    },
    {
      title: 'Từ ngày',
      dataIndex: 'startDate',
      key: 'startDate'
    },
    {
      title: 'Đến ngày',
      dataIndex: 'endDate',
      key: 'endDate'
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'APPROVED' ? 'green' : 
          status === 'REJECTED' ? 'red' : 'orange'
        }>
          {status === 'APPROVED' ? 'Đã duyệt' : 
           status === 'REJECTED' ? 'Từ chối' : 'Chờ duyệt'}
        </Tag>
      )
    },
    {
      title: 'Lý do',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true
    }
  ];

  // Columns for attendance history
  const attendanceColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Giờ vào',
      dataIndex: 'checkIn',
      key: 'checkIn'
    },
    {
      title: 'Giờ ra',
      dataIndex: 'checkOut',
      key: 'checkOut'
    },
    {
      title: 'Giờ làm việc',
      dataIndex: 'workingHours',
      key: 'workingHours',
      render: (hours) => `${hours} giờ`
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={
          status === 'on_time' ? 'green' : 
          status === 'late' ? 'orange' : 
          status === 'early_leave' ? 'red' : 'blue'
        }>
          {status === 'on_time' ? 'Đúng giờ' : 
           status === 'late' ? 'Đi muộn' : 
           status === 'early_leave' ? 'Về sớm' : 'Bình thường'}
        </Tag>
      )
    }
  ];

  const handleSubmitLeaveRequest = async (values) => {
    try {
      const requestData = {
        type: values.type,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        reason: values.reason
      };

      await absenceService.submitLeaveRequest(requestData);
      antdMessage.success('Đã gửi đơn xin nghỉ thành công');
      setLeaveRequestModal(false);
      leaveForm.resetFields();
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Lỗi khi gửi đơn xin nghỉ:', error);
      antdMessage.error('Không thể gửi đơn xin nghỉ');
    }
  };

  const dashboardActions = (
    <Space>
      <Button 
        type="primary" 
        icon={<PlusOutlined />}
        onClick={() => setLeaveRequestModal(true)}
      >
        Gửi đơn xin nghỉ
      </Button>
      <Button 
        icon={<CalendarOutlined />}
        onClick={() => navigate('/teacher/schedule')}
      >
        Xem lịch giảng dạy
      </Button>
      <Button
          type="primary"
          size="middle"
          icon={<VideoCameraOutlined />}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold'
          }}
          onClick={() => navigate("/teacher/live-classroom/room-123")}
        >
          🚀 Vào Lớp Trực Tuyến
        </Button>
    </Space>
  );

  // ✅ Fixed: Sử dụng thuộc tính items thay vì TabPane để tránh warning deprecated
  const tabItems = [
    {
      key: 'overview',
      label: (
        <span>
          <UserOutlined />
          Tổng quan
        </span>
      ),
      children: (
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <span>
                  <CalendarOutlined style={{ marginRight: 8 }} />
                  Ca làm việc sắp tới
                </span>
              }
              extra={
                <Button 
                  type="link" 
                  onClick={() => setActiveTab('shifts')}
                >
                  Xem tất cả
                </Button>
              }
            >
              <Table
                dataSource={myShifts.slice(0, 5)}
                columns={shiftsColumns}
                pagination={false}
                size="small"
                loading={loading}
                locale={{ emptyText: 'Không có ca làm việc nào' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title={
                <span>
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  Đơn xin nghỉ của tôi
                </span>
              }
              extra={
                <Button 
                  type="link"
                  onClick={() => setActiveTab('leave-requests')}
                >
                  Xem tất cả
                </Button>
              }
            >
              <Table
                dataSource={myLeaveRequests.slice(0, 3)}
                columns={leaveRequestsColumns}
                pagination={false}
                size="small"
                loading={loading}
                locale={{ emptyText: 'Chưa có đơn xin nghỉ nào' }}
              />
            </Card>
          </Col>
        </Row>
      )
    },
    {
      key: 'shifts',
      label: (
        <span>
          <ClockCircleOutlined />
          Ca làm việc
        </span>
      ),
      children: (
        <Card>
          <Table
            dataSource={myShifts}
            columns={shiftsColumns}
            loading={loading}
            locale={{ emptyText: 'Không có ca làm việc nào' }}
          />
        </Card>
      )
    },
    {
      key: 'leave-requests',
      label: (
        <span>
          <FileTextOutlined />
          Đơn xin nghỉ
        </span>
      ),
      children: (
        <Card>
          <Table
            dataSource={myLeaveRequests}
            columns={leaveRequestsColumns}
            loading={loading}
            locale={{ emptyText: 'Chưa có đơn xin nghỉ nào' }}
          />
        </Card>
      )
    },
    {
      key: 'attendance',
      label: (
        <span>
          <HistoryOutlined />
          Lịch sử chấm công
        </span>
      ),
      children: (
        <Card>
          <Table
            dataSource={attendanceHistory}
            columns={attendanceColumns}
            loading={loading}
            locale={{ emptyText: 'Chưa có dữ liệu chấm công' }}
          />
        </Card>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Dashboard Giảng viên"
      subtitle={`Chào mừng ${user?.fullName || user?.username || ''}, hôm nay là ${new Date().toLocaleDateString('vi-VN')}`}
      stats={stats}
      actions={dashboardActions}
      loading={loading}
    >
      {/* Navigation Cards */}
      <Row gutter={[24, 24]} className="mb-8">
        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate("/teacher/courses")}>
            <div className="text-center">
              <TeamOutlined className="text-4xl text-blue-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Quản lý lớp học</h2>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate("/teacher/assignments")}>
            <div className="text-center">
              <FileTextOutlined className="text-4xl text-purple-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Quản lý bài tập</h2>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate("/teacher/schedule")}>
            <div className="text-center">
              <CalendarOutlined className="text-4xl text-teal-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Lịch giảng dạy</h2>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate("/teacher/messages")}>
            <div className="text-center">
              <MessageOutlined className="text-4xl text-cyan-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Nhắn tin</h2>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => navigate("/teacher/leave-requests")}>
            <div className="text-center">
              <CheckCircleOutlined className="text-4xl text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Đơn nghỉ phép</h2>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card hoverable onClick={() => setActiveTab('attendance')}>
            <div className="text-center">
              <HistoryOutlined className="text-4xl text-green-500 mb-4" />
              <h2 className="text-xl font-semibold mb-4">Lịch sử chấm công</h2>
            </div>
          </Card>
        </Col>
      </Row>

      {/* ✅ Fixed: Sử dụng thuộc tính items thay vì TabPane */}
      <Tabs 
        activeKey={activeTab} 
        onChange={setActiveTab} 
        type="card"
        items={tabItems}
      />

      {/* Leave Request Modal */}
      <Modal
        title="Gửi đơn xin nghỉ"
        open={leaveRequestModal}
        onCancel={() => {
          setLeaveRequestModal(false);
          leaveForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={leaveForm}
          layout="vertical"
          onFinish={handleSubmitLeaveRequest}
        >
          <Form.Item
            name="type"
            label="Loại đơn xin nghỉ"
            rules={[{ required: true, message: 'Vui lòng chọn loại đơn' }]}
          >
            <Select placeholder="Chọn loại đơn">
              <Option value="SICK_LEAVE">Nghỉ ốm</Option>
              <Option value="ANNUAL_LEAVE">Nghỉ phép</Option>
              <Option value="PERSONAL_LEAVE">Nghỉ cá nhân</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời gian nghỉ"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian nghỉ' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="reason"
            label="Lý do"
            rules={[{ required: true, message: 'Vui lòng nhập lý do' }]}
          >
            <TextArea rows={4} placeholder="Nhập lý do xin nghỉ..." />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Gửi đơn
              </Button>
              <Button onClick={() => {
                setLeaveRequestModal(false);
                leaveForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </DashboardLayout>
  );
}