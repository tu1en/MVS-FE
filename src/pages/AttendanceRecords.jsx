import { DownOutlined } from '@ant-design/icons';
import { Card, Col, Dropdown, Empty, message, Row, Space, Spin, Table, Tag, Typography } from 'antd';
import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { useNavigate } from 'react-router-dom';
import attendanceService from '../services/attendanceService';

ChartJS.register(ArcElement, Tooltip, Legend);

const { Text, Title } = Typography;

// Map API status values to display labels
const STATUS_MAP = {
  'PRESENT': 'Có mặt',
  'LATE': 'Đi muộn',
  'ABSENT': 'Vắng mặt',
  'EXCUSED': 'Có phép',
  'present': 'Có mặt',
  'late': 'Đi muộn',
  'absent': 'Vắng mặt',
  'excused': 'Có phép'
};

export default function AttendanceRecords() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [attendanceData, setAttendanceData] = useState([]);
  const [allSubjects, setAllSubjects] = useState(['Tất cả']);
  const [selectedSubject, setSelectedSubject] = useState('Tất cả');
  const [summary, setSummary] = useState({
    totalSessions: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    excusedCount: 0,
    attendancePercentage: 0
  });

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (role !== '1' && role !== 'STUDENT') {
      navigate("/");
      return;
    }
    loadAttendanceData();
  }, [navigate]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Fetch attendance records from the API
      const response = await attendanceService.getStudentAttendanceView();
      
      let records = [];
      if (response && response.records) {
        records = response.records;
      } else {
        // If no records found, just return empty array
        setAttendanceData([]);
        setLoading(false);
        return;
      }

      const transformedData = records.map((record, index) => ({
        key: record.id || index,
        date: record.sessionDate || dayjs(record.date).format('DD/MM/YYYY') || new Date().toISOString().split('T')[0],
        subject: record.classroomName || record.course || record.courseName || record.subject || 'Không xác định',
        status: STATUS_MAP[record.status] || record.status || 'Không xác định',
        originalStatus: record.status
      }));

      transformedData.sort((a, b) => new Date(b.date) - new Date(a.date));

      setAttendanceData(transformedData);

      const subjects = [...new Set(transformedData.map(record => record.subject))];
      setAllSubjects(['Tất cả', ...subjects.filter(subject => subject !== 'Không xác định')]);

      // Get attendance summary
      try {
        const summaryResponse = await attendanceService.getStudentAttendanceSummary();
        if (summaryResponse) {
          setSummary({
            totalSessions: summaryResponse.totalSessions || 0,
            presentCount: summaryResponse.presentCount || 0,
            lateCount: summaryResponse.lateCount || 0,
            absentCount: summaryResponse.absentCount || 0,
            excusedCount: summaryResponse.excusedCount || 0,
            attendancePercentage: summaryResponse.attendancePercentage || 0
          });
        }
      } catch (summaryError) {
        console.error('Error loading attendance summary:', summaryError);
        // Calculate summary from records as fallback
        const totalSessions = records.length;
        const presentCount = records.filter(r => r.status === 'PRESENT').length;
        const lateCount = records.filter(r => r.status === 'LATE').length;
        const absentCount = records.filter(r => r.status === 'ABSENT').length;
        const excusedCount = records.filter(r => r.status === 'EXCUSED').length;
        
        setSummary({
          totalSessions,
          presentCount,
          lateCount,
          absentCount,
          excusedCount,
          attendancePercentage: totalSessions > 0 ? 
            Math.round(((presentCount + lateCount) / totalSessions) * 100) : 0
        });
      }

    } catch (error) {
      console.error('Error loading attendance data:', error);
      message.error('Không thể tải dữ liệu điểm danh. Vui lòng thử lại sau.');
      // Return empty data instead of mock data
      setAttendanceData([]);
      setSummary({
        totalSessions: 0,
        presentCount: 0,
        lateCount: 0,
        absentCount: 0,
        excusedCount: 0,
        attendancePercentage: 0
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredData = selectedSubject === 'Tất cả'
    ? attendanceData
    : attendanceData.filter((item) => item.subject === selectedSubject);

  // Chart data
  const chartData = {
    labels: ['Có mặt', 'Đi muộn', 'Vắng mặt', 'Có phép'],
    datasets: [
      {
        data: [summary.presentCount, summary.lateCount, summary.absentCount, summary.excusedCount],
        backgroundColor: ['#52c41a', '#faad14', '#f5222d', '#1890ff'],
        hoverBackgroundColor: ['#95de64', '#ffc53d', '#ff7875', '#69c0ff'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    }
  };

  const columns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => {
        let color = 'green';
        if (record.originalStatus === 'LATE' || record.originalStatus === 'late') color = 'orange';
        if (record.originalStatus === 'ABSENT' || record.originalStatus === 'absent') color = 'red';
        if (record.originalStatus === 'EXCUSED' || record.originalStatus === 'excused') color = 'blue';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  const subjectMenu = {
    items: allSubjects.map(subject => ({
      key: subject,
      label: subject,
    })),
    onClick: ({ key }) => setSelectedSubject(key),
  };

  return (
    <div className="attendance-records-page">
      <Title level={3} className="page-title">Điểm danh</Title>
      
      {loading ? (
        <div style={{ textAlign: 'center', margin: '50px 0' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} md={12}>
              <Card variant="outlined" title="Thống kê điểm danh">
                <div style={{ height: 300 }}>
                  {summary.totalSessions > 0 ? (
                    <Pie data={chartData} options={chartOptions} />
                  ) : (
                    <Empty description="Không có dữ liệu điểm danh" />
                  )}
                </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
              <Card variant="outlined" title="Tổng kết">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <Text strong>Tổng số buổi học: </Text>
                    <Text>{summary.totalSessions}</Text>
                  </div>
                  <div>
                    <Text strong>Có mặt: </Text>
                    <Text>{summary.presentCount} buổi</Text>
                  </div>
                  <div>
                    <Text strong>Đi muộn: </Text>
                    <Text>{summary.lateCount} buổi</Text>
                  </div>
                  <div>
                    <Text strong>Vắng mặt: </Text>
                    <Text>{summary.absentCount} buổi</Text>
                  </div>
                  {summary.excusedCount > 0 && (
                    <div>
                      <Text strong>Có phép: </Text>
                      <Text>{summary.excusedCount} buổi</Text>
                    </div>
                  )}
                  <div>
                    <Text strong>Tỷ lệ tham dự: </Text>
                    <Text>{summary.attendancePercentage}%</Text>
                  </div>
                </div>
            </Card>
          </Col>
        </Row>

          <Card 
            title="Lịch sử điểm danh"
            variant="outlined"
            extra={
              <Space>
                <Text>Môn học:</Text>
                <Dropdown menu={subjectMenu}>
                  <a onClick={(e) => e.preventDefault()}>
                    <Space>
                      {selectedSubject}
                      <DownOutlined />
                    </Space>
                  </a>
                </Dropdown>
              </Space>
            }
          >
            {filteredData.length > 0 ? (
            <Table
              columns={columns}
              dataSource={filteredData}
              pagination={{
                pageSize: 10,
                  showSizeChanger: false
                }}
              />
            ) : (
              <Empty description="Không có dữ liệu điểm danh" />
          )}
        </Card>
        </>
      )}
    </div>
  );
}
