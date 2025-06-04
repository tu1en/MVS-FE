import React, { useState, useEffect } from 'react';
import { Button, message, Table, Popconfirm, Card, Collapse } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';

const ManageSchedule = () => {
  const [schedules, setSchedules] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      // In a real app, this would be an API call
      // For now, we'll use the mock data from scheduleService
      const { getSchedules } = await import('../../services/scheduleService');
      const scheduleData = getSchedules();
      setSchedules(scheduleData);
    } catch (error) {
      message.error('Không thể tải dữ liệu lịch học');
    }
  };



  const handleDelete = (id) => {
    setSchedules(schedules.filter(schedule => schedule.id !== id));
    message.success('Xóa lịch học thành công');
    
    // In a real app, you would delete this from the backend
    // await axios.delete(`/api/schedules/${id}`);
  };

  // Group schedules by subject, then by teacher
  const groupBy = (array, key) => array.reduce((result, item) => {
    (result[item[key]] = result[item[key]] || []).push(item);
    return result;
  }, {});

  // Table columns for schedule details
  const detailColumns = [
    {
      title: 'Thứ',
      dataIndex: 'day',
      key: 'day',
      render: (day) => {
        const days = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
        return days[day];
      }
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => `${record.start} - ${record.end}`
    },
    {
      title: 'Phòng',
      dataIndex: 'room',
      key: 'room',
    },
    {
      title: 'Lớp',
      dataIndex: 'className',
      key: 'className',
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
          <Button type="text" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  // Group schedules by subject
  const subjectGroups = groupBy(schedules, 'subject');

  return (
    <div className="p-6">
      <Card title="Danh sách Lịch học" bordered={false} className="shadow-lg">
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
