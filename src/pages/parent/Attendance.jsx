import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Calendar, 
  Badge, 
  Typography, 
  Row, 
  Col, 
  Select, 
  Table, 
  Tag,
  Empty,
  Statistic,
  Progress
} from 'antd';
import { 
  CalendarOutlined, 
  CheckCircleOutlined, 
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ChildSwitcher from '../../components/parent/ChildSwitcher';
import api from '../../services/api';

const { Title, Text } = Typography;
const { Option } = Select;

/**
 * Attendance Component for Parents
 * Based on PARENT_ROLE_SPEC.md - View attendance history and leave notice status
 */
const Attendance = () => {
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // calendar, table
  const [selectedMonth, setSelectedMonth] = useState(dayjs());
  const [children, setChildren] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveNotices, setLeaveNotices] = useState([]);

  // Load real data
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load children data
        const childrenResponse = await api.get('/parent/children');
        const childrenData = childrenResponse.data;
        
        const childrenList = Array.isArray(childrenData) ? childrenData : (childrenData?.data || []);
        const formattedChildren = childrenList.map(child => ({
          id: child.studentId || child.id,
          name: child.student?.fullName || child.studentName || child.name,
          grade: child.grade || child.className || 'Chưa xác định',
          teacherName: child.teacherName || 'Chưa phân công'
        }));
        
        setChildren(formattedChildren);
        
        if (formattedChildren.length > 0) {
          setSelectedChildId(formattedChildren[0].id);
          loadAttendanceData(formattedChildren[0].id);
        }
      } catch (error) {
        console.error('Error loading children data:', error);
        // Fallback to mock data
        const mockChildren = [
          {
            id: 1,
            name: 'Học sinh mẫu',
            grade: 'Lớp 10A',
            teacherName: 'Giáo viên chủ nhiệm'
          }
        ];
        setChildren(mockChildren);
        if (mockChildren.length > 0) {
          setSelectedChildId(mockChildren[0].id);
        }
      }
    };

    const loadAttendanceData = async (childId) => {
      if (!childId) return;
      
      try {
        // Try to load attendance data for the child
        const attendanceResponse = await api.get(`/parent/children/${childId}/attendance`);
        // Process attendance data if available
        setAttendanceData(attendanceResponse.data || []);
      } catch (error) {
        console.warn('Attendance data not available:', error);
        // Use mock attendance data
        const mockAttendance = [
          {
            date: '2025-08-01',
            status: 'PRESENT',
            sessions: [
              { period: 'Sáng', status: 'PRESENT', subject: 'Toán' },
              { period: 'Chiều', status: 'PRESENT', subject: 'Văn' }
            ]
          },
          {
            date: '2025-08-02',
            status: 'LATE',
            arriveTime: '08:30',
            sessions: [
              { period: 'Sáng', status: 'LATE', subject: 'Lý', arriveTime: '08:30' },
              { period: 'Chiều', status: 'PRESENT', subject: 'Hóa' }
            ]
          }
        ];
        setAttendanceData(mockAttendance);
        
        const mockLeaveNotices = [
          {
            id: 1,
            date: '2025-08-03',
            type: 'LATE',
            arriveAt: '09:00',
            status: 'ACKNOWLEDGED',
            reason: 'Khám bệnh'
          }
        ];
        setLeaveNotices(mockLeaveNotices);
      }
    };

    loadData();
  }, []);

  // Load attendance data when child selection changes
  useEffect(() => {
    if (selectedChildId) {
      const loadAttendanceForChild = async () => {
        try {
          const attendanceResponse = await api.get(`/parent/children/${selectedChildId}/attendance`);
          setAttendanceData(attendanceResponse.data || []);
          
          // Load leave notices for this child
          const leavesResponse = await api.get(`/parent/children/${selectedChildId}/leave-notices`);
          setLeaveNotices(leavesResponse.data || []);
        } catch (error) {
          console.warn('Could not load specific child data:', error);
        }
      };
      loadAttendanceForChild();
    }
  }, [selectedChildId]);

  const getAttendanceStatusConfig = (status) => {
    const configs = {
      'PRESENT': { 
        color: 'success', 
        text: 'Có mặt', 
        icon: <CheckCircleOutlined />,
        badgeStatus: 'success'
      },
      'ABSENT': { 
        color: 'error', 
        text: 'Vắng mặt', 
        icon: <CloseCircleOutlined />,
        badgeStatus: 'error'
      },
      'LATE': { 
        color: 'warning', 
        text: 'Đến muộn', 
        icon: <ClockCircleOutlined />,
        badgeStatus: 'warning'
      },
      'EARLY': { 
        color: 'processing', 
        text: 'Về sớm', 
        icon: <ClockCircleOutlined />,
        badgeStatus: 'processing'
      },
      'EXCUSED_BY_NOTICE': { 
        color: 'default', 
        text: 'Nghỉ có thông báo', 
        icon: <ExclamationCircleOutlined />,
        badgeStatus: 'default'
      }
    };
    return configs[status] || configs['ABSENT'];
  };

  const getMonthlyStats = () => {
    const monthData = attendanceData.filter(record => 
      dayjs(record.date).isSame(selectedMonth, 'month')
    );
    
    const total = monthData.length;
    const present = monthData.filter(r => r.status === 'PRESENT').length;
    const late = monthData.filter(r => r.status === 'LATE').length;
    const absent = monthData.filter(r => r.status === 'ABSENT').length;
    const excused = monthData.filter(r => r.status === 'EXCUSED_BY_NOTICE').length;
    
    return { total, present, late, absent, excused };
  };

  const dateCellRender = (value) => {
    const dateStr = value.format('YYYY-MM-DD');
    const record = attendanceData.find(r => r.date === dateStr);
    const leaveNotice = leaveNotices.find(n => n.date === dateStr);
    
    if (!record) return null;
    
    const config = getAttendanceStatusConfig(record.status);
    
    return (
      <div style={{ fontSize: '12px' }}>
        <Badge 
          status={config.badgeStatus} 
          text={config.text}
        />
        {leaveNotice && (
          <div style={{ marginTop: '2px' }}>
            <Tag size="small" color="blue">
              Có thông báo
            </Tag>
          </div>
        )}
      </div>
    );
  };

  const tableColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const config = getAttendanceStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
      filters: [
        { text: 'Có mặt', value: 'PRESENT' },
        { text: 'Vắng mặt', value: 'ABSENT' },
        { text: 'Đến muộn', value: 'LATE' },
        { text: 'Về sớm', value: 'EARLY' },
        { text: 'Nghỉ có thông báo', value: 'EXCUSED_BY_NOTICE' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Chi tiết',
      key: 'details',
      render: (_, record) => (
        <div>
          {record.arriveTime && (
            <Text type="secondary">Đến lúc: {record.arriveTime}</Text>
          )}
          {record.leaveNoticeId && (
            <Tag size="small" color="blue">Có thông báo #{record.leaveNoticeId}</Tag>
          )}
        </div>
      ),
    },
    {
      title: 'Buổi học',
      key: 'sessions',
      render: (_, record) => (
        <div>
          {record.sessions?.map((session, index) => {
            const sessionConfig = getAttendanceStatusConfig(session.status);
            return (
              <div key={index} style={{ marginBottom: '4px' }}>
                <Text style={{ marginRight: '8px' }}>{session.period}:</Text>
                <Tag size="small" color={sessionConfig.color}>
                  {session.subject}
                </Tag>
                {session.arriveTime && (
                  <Text type="secondary" style={{ marginLeft: '8px' }}>
                    ({session.arriveTime})
                  </Text>
                )}
              </div>
            );
          })}
        </div>
      ),
    },
  ];

  const stats = getMonthlyStats();
  const attendanceRate = stats.total > 0 ? ((stats.present + stats.excused) / stats.total * 100) : 0;

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <CalendarOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
        Điểm danh & Chuyên cần
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Theo dõi tình hình chuyên cần và lịch sử điểm danh
      </Text>

      {/* Child Switcher */}
      <ChildSwitcher 
        children={children}
        selectedChildId={selectedChildId}
        onChildChange={setSelectedChildId}
      />

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ margin: '24px 0' }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Tỷ lệ chuyên cần"
              value={attendanceRate}
              precision={1}
              suffix="%"
              valueStyle={{ 
                color: attendanceRate >= 95 ? '#3f8600' : 
                       attendanceRate >= 85 ? '#faad14' : '#cf1322' 
              }}
            />
            <Progress 
              percent={attendanceRate} 
              size="small" 
              showInfo={false}
              strokeColor={
                attendanceRate >= 95 ? '#52c41a' : 
                attendanceRate >= 85 ? '#faad14' : '#ff4d4f'
              }
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Có mặt"
              value={stats.present}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Đến muộn"
              value={stats.late}
              valueStyle={{ color: '#faad14' }}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title="Vắng mặt"
              value={stats.absent}
              valueStyle={{ color: '#cf1322' }}
              prefix={<CloseCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* View Controls */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Select 
            value={viewMode} 
            onChange={setViewMode}
            style={{ width: 150 }}
          >
            <Option value="calendar">Lịch</Option>
            <Option value="table">Bảng</Option>
          </Select>
        </Col>
        <Col>
          <Text strong>
            Tháng {selectedMonth.format('MM/YYYY')}
          </Text>
        </Col>
      </Row>

      {/* Content */}
      {viewMode === 'calendar' ? (
        <Card>
          <Calendar
            value={selectedMonth}
            onPanelChange={setSelectedMonth}
            dateCellRender={dateCellRender}
            mode="month"
          />
        </Card>
      ) : (
        <Card>
          {attendanceData.length > 0 ? (
            <Table
              columns={tableColumns}
              dataSource={attendanceData.filter(record => 
                dayjs(record.date).isSame(selectedMonth, 'month')
              )}
              rowKey="date"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} của ${total} ngày học`
              }}
            />
          ) : (
            <Empty description="Chưa có dữ liệu điểm danh" />
          )}
        </Card>
      )}
    </div>
  );
};

export default Attendance;