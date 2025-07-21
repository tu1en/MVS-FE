import {
    CalendarOutlined,
    ClockCircleOutlined,
    FileTextOutlined,
    HistoryOutlined,
    PlusOutlined,
    UserOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    Col,
    DatePicker,
    Form,
    Input,
    message,
    Modal,
    Row,
    Select,
    Space,
    Table,
    Tabs,
    Tag,
    Typography
} from 'antd';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import absenceService from '../../services/absenceService';
import teacherService from '../../services/teacherService';
import DashboardLayout, { DashboardColors, DashboardIcons } from '../common/DashboardLayout';

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;
const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * Dashboard dành cho Teacher
 * Hiển thị thông tin cá nhân và lịch làm việc
 */
const TeacherDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dashboardStats, setDashboardStats] = useState({});
  const [myShifts, setMyShifts] = useState([]);
  const [myLeaveRequests, setMyLeaveRequests] = useState([]);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [leaveRequestModal, setLeaveRequestModal] = useState(false);
  const [leaveForm] = Form.useForm();

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load teacher dashboard data
      const [statsResponse, leaveRequestsResponse] = await Promise.all([
        teacherService.getDashboardStats?.() || Promise.resolve({ data: {} }),
        absenceService.getMyLeaveRequests()
      ]);

      setDashboardStats(statsResponse.data || {});
      setMyLeaveRequests(leaveRequestsResponse.data || []);
      
      // Mock data for shifts and attendance (replace with actual API calls)
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
      console.error('Lỗi khi tải dữ liệu dashboard:', error);
      message.error('Không thể tải dữ liệu dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Statistics for dashboard
  const stats = [
    {
      title: 'Ca làm việc tuần này',
      value: dashboardStats.weeklyShifts || 0,
      icon: DashboardIcons.calendar,
      color: DashboardColors.primary
    },
    {
      title: 'Giờ làm việc tháng này',
      value: dashboardStats.monthlyHours || 0,
      suffix: 'giờ',
      icon: DashboardIcons.clock,
      color: DashboardColors.success
    },
    {
      title: 'Đơn xin nghỉ',
      value: myLeaveRequests.length,
      icon: DashboardIcons.document,
      color: DashboardColors.warning
    },
    {
      title: 'Điểm chấm công',
      value: dashboardStats.attendanceScore || 0,
      suffix: '%',
      icon: DashboardIcons.success,
      color: DashboardColors.info
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
      message.success('Đã gửi đơn xin nghỉ thành công');
      setLeaveRequestModal(false);
      leaveForm.resetFields();
      loadDashboardData(); // Reload data
    } catch (error) {
      console.error('Lỗi khi gửi đơn xin nghỉ:', error);
      message.error('Không thể gửi đơn xin nghỉ');
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
        onClick={() => window.location.href = '/teacher/schedule'}
      >
        Xem lịch làm việc
      </Button>
    </Space>
  );

  return (
    <DashboardLayout
      title="Dashboard Giảng viên"
      subtitle={`Chào mừng ${user?.fullName || user?.username}, hôm nay là ${new Date().toLocaleDateString('vi-VN')}`}
      stats={stats}
      actions={dashboardActions}
      loading={loading}
    >
      <Tabs activeKey={activeTab} onChange={setActiveTab} type="card">
        <TabPane 
          tab={
            <span>
              <UserOutlined />
              Tổng quan
            </span>
          } 
          key="overview"
        >
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
        </TabPane>

        <TabPane 
          tab={
            <span>
              <ClockCircleOutlined />
              Ca làm việc
            </span>
          } 
          key="shifts"
        >
          <Card>
            <Table
              dataSource={myShifts}
              columns={shiftsColumns}
              loading={loading}
              locale={{ emptyText: 'Không có ca làm việc nào' }}
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <FileTextOutlined />
              Đơn xin nghỉ
            </span>
          } 
          key="leave-requests"
        >
          <Card>
            <Table
              dataSource={myLeaveRequests}
              columns={leaveRequestsColumns}
              loading={loading}
              locale={{ emptyText: 'Chưa có đơn xin nghỉ nào' }}
            />
          </Card>
        </TabPane>

        <TabPane 
          tab={
            <span>
              <HistoryOutlined />
              Lịch sử chấm công
            </span>
          } 
          key="attendance"
        >
          <Card>
            <Table
              dataSource={attendanceHistory}
              columns={attendanceColumns}
              loading={loading}
              locale={{ emptyText: 'Chưa có dữ liệu chấm công' }}
            />
          </Card>
        </TabPane>
      </Tabs>

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
};

export default TeacherDashboard;
