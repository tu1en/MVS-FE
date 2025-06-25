import { DeleteOutlined } from '@ant-design/icons';
import { Button, Card, Collapse, message, Popconfirm, Table } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import API_CONFIG from '../../config/api-config';

const ManageSchedule = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        message.error('Bạn chưa đăng nhập');
        setLoading(false);
        return;
      }
      
      // In a real app, this would be an API call
      const response = await axios.get(`${API_CONFIG.BASE_URL}/api/schedules`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.data) {
        // Transform API response to match our component's expected format
        const transformedSchedules = response.data.map(schedule => ({
          id: schedule.id,
          classId: schedule.classroom?.id,
          className: schedule.classroom?.name || 'Không xác định',
          subject: schedule.subject || 'Không xác định',
          day: schedule.dayOfWeek, // 0 = Monday, 6 = Sunday
          start: schedule.startTime ? schedule.startTime.substring(0, 5) : '00:00',
          end: schedule.endTime ? schedule.endTime.substring(0, 5) : '00:00',
          teacherId: schedule.teacher?.id,
          teacherName: schedule.teacher?.fullName || 'Không xác định',
          room: schedule.room || 'Không xác định'
        }));
        
        setSchedules(transformedSchedules);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
      message.error('Không thể tải dữ liệu lịch học');
      
      // Fallback to mock data if API fails
      try {
        const { getSchedules } = await import('../../services/scheduleService');
        const scheduleData = getSchedules();
        setSchedules(scheduleData);
      } catch (fallbackError) {
        console.error('Error loading fallback schedule data:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      // Delete in the backend
      await axios.delete(`${API_CONFIG.BASE_URL}/api/schedules/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update in the frontend
      setSchedules(schedules.filter(schedule => schedule.id !== id));
      message.success('Xóa lịch học thành công');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      message.error('Không thể xóa lịch học');
      
      // Still update UI even if API fails
      setSchedules(schedules.filter(schedule => schedule.id !== id));
    }
  };

  // Group schedules by subject, then by teacher
  const groupBy = (array, key) => array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});

  // Group schedules by subject
  const subjectGroups = groupBy(schedules, 'subject');

  // Convert day number to day name
  const getDayName = (day) => {
    const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
    return days[day] || 'Không xác định';
  };

  // Detail columns for the table
  const detailColumns = [
    {
      title: 'Ngày',
      dataIndex: 'day',
      key: 'day',
      render: (day) => getDayName(day)
    },
    {
      title: 'Giờ bắt đầu',
      dataIndex: 'start',
      key: 'start'
    },
    {
      title: 'Giờ kết thúc',
      dataIndex: 'end',
      key: 'end'
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      key: 'room'
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Popconfirm
          title="Bạn có chắc chắn muốn xóa lịch học này?"
          onConfirm={() => handleDelete(record.id)}
          okText="Có"
          cancelText="Không"
        >
          <Button type="primary" danger icon={<DeleteOutlined />}>Xóa</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <div className="p-6">
      <Card title="Danh sách Lịch học" variant="borderless" className="shadow-lg" loading={loading}>
        <Collapse accordion>
          {Object.entries(subjectGroups).map(([subject, subjectSchedules]) => {
            // Group by teacher within this subject
            const teacherGroups = groupBy(subjectSchedules, 'teacherName');
            return (
              <Collapse.Panel header={<span style={{ fontWeight: 600, fontSize: 17 }}>{subject}</span>} key={subject}>
                <Collapse accordion>
                  {Object.entries(teacherGroups).map(([teacher, teacherSchedules]) => (
                    <Collapse.Panel header={<span style={{ fontWeight: 500 }}>{teacher}</span>} key={teacher}>
                      <Table
                        columns={detailColumns}
                        dataSource={teacherSchedules}
                        rowKey="id"
                        pagination={false}
                        bordered
                        size="small"
                        style={{ marginBottom: 12 }}
                      />
                    </Collapse.Panel>
                  ))}
                </Collapse>
              </Collapse.Panel>
            );
          })}
        </Collapse>
      </Card>
    </div>
  );
};

export default ManageSchedule;
