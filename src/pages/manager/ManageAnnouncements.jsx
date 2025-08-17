import { DeleteOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Table, Tag, message } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { managerService } from '../../services/managerService';

const ManageAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const data = await managerService.getAnnouncements();
      setAnnouncements(data);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      message.error('Không thể tải danh sách thông báo');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Tiêu Đề',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Ngày Tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => {
        if (!date) return 'N/A';
        
        // Handle various date formats from backend
        let parsedDate;
        if (typeof date === 'string') {
          // Replace space with 'T' if needed for ISO format
          const isoString = date.replace(' ', 'T');
          parsedDate = dayjs(isoString);
        } else if (Array.isArray(date)) {
          // Handle array format [year, month, day, hour, minute, second, nano]
          if (date.length >= 3) {
            parsedDate = dayjs(new Date(date[0], date[1] - 1, date[2], 
                           date[3] || 0, date[4] || 0, date[5] || 0));
          } else {
            parsedDate = dayjs(date);
          }
        } else {
          parsedDate = dayjs(date);
        }
        
        // Check if date is valid
        if (!parsedDate.isValid()) {
          console.warn('Invalid date in ManageAnnouncements:', date);
          return 'Invalid Date';
        }
        
        return parsedDate.format('DD/MM/YYYY');
      },
    },
    {
      title: 'Đối tượng nhận thông báo',
      dataIndex: 'targetAudience',
      key: 'targetAudience',
      render: (targetAudience) => {
        const audienceMap = {
          'ALL': { text: 'Tất cả', color: 'purple' },
          'STUDENTS': { text: 'Học sinh', color: 'blue' },
          'TEACHERS': { text: 'Giáo viên', color: 'green' },
          'PARENTS': { text: 'Phụ huynh', color: 'orange' },
          'ACCOUNTANTS': { text: 'Kế toán', color: 'cyan' }
        };
        
        const audience = audienceMap[targetAudience] || { text: targetAudience || 'N/A', color: 'default' };
        return <Tag color={audience.color}>{audience.text}</Tag>;
      },
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'green';
        let text = 'Đang hiển thị';
        
        if (status === 'scheduled') {
          color = 'blue';
          text = 'Đã lên lịch';
        } else if (status === 'draft') {
          color = 'gray';
          text = 'Bản nháp';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Mức Độ',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority) => {
        const colors = {
          high: 'red',
          medium: 'orange',
          low: 'green',
        };
        const texts = {
          high: 'Cao',
          medium: 'Trung bình',
          low: 'Thấp',
        };
        return <Tag color={colors[priority]}>{texts[priority]}</Tag>;
      },
    },
    {
      title: 'Thao Tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="primary"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
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

  const handleView = (announcement) => {
    Modal.info({
      title: announcement.title,
      content: (
        <div>
          <p>{announcement.content}</p>
          <p>
            <strong>Ngày tạo:</strong> {(() => {
              if (!announcement.createdAt) return 'N/A';
              
              let parsedDate;
              if (typeof announcement.createdAt === 'string') {
                const isoString = announcement.createdAt.replace(' ', 'T');
                parsedDate = dayjs(isoString);
              } else if (Array.isArray(announcement.createdAt)) {
                if (announcement.createdAt.length >= 3) {
                  parsedDate = dayjs(new Date(announcement.createdAt[0], announcement.createdAt[1] - 1, announcement.createdAt[2], 
                                 announcement.createdAt[3] || 0, announcement.createdAt[4] || 0, announcement.createdAt[5] || 0));
                } else {
                  parsedDate = dayjs(announcement.createdAt);
                }
              } else {
                parsedDate = dayjs(announcement.createdAt);
              }
              
              return parsedDate.isValid() ? parsedDate.format('DD/MM/YYYY') : 'Invalid Date';
            })()}
          </p>
        </div>
      ),
      width: 600,
    });
  };

  const handleEdit = (announcement) => {
    // Navigate to edit page
    window.location.href = '/manager/announcements/edit/' + announcement.id;
  };

  const handleDelete = async (announcement) => {
    Modal.confirm({
      title: 'Xác nhận xóa thông báo',
      content: 'Bạn có chắc chắn muốn xóa thông báo "' + announcement.title + '"?',
      onOk: async () => {
        try {
          await managerService.deleteAnnouncement(announcement.id);
          message.success('Xóa thông báo thành công');
          fetchAnnouncements();
        } catch (error) {
          console.error('Error deleting announcement:', error);
          message.error('Không thể xóa thông báo');
        }
      }
    });
  };

  return (
    <Card title="Quản Lý Thông Báo" className="shadow-md">
      <Button
        type="primary"
        href="/manager/announcements/create"
        style={{ marginBottom: 16 }}
      >
        Tạo Thông Báo Mới
      </Button>

      <Table columns={columns} dataSource={announcements} rowKey="id" loading={loading} />
    </Card>
  );
};

export default ManageAnnouncements;
