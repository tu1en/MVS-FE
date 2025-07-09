import {
    BookOutlined,
    CalendarOutlined,
    FileTextOutlined,
    LogoutOutlined,
    MessageOutlined,
    UserOutlined,
    VideoCameraOutlined
} from '@ant-design/icons';
import { Avatar, Badge, Dropdown, Menu } from 'antd';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';

export default function NavigationMenu() {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const userName = localStorage.getItem('userName') || 'User';

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const studentMenuItems = [
    {
      key: 'dashboard',
      icon: <UserOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/student')
    },
    {
      key: 'assignments',
      icon: <FileTextOutlined />,
      label: 'Bài tập',
      onClick: () => navigate('/assignments-new')
    },
    {
      key: 'lectures',
      icon: <VideoCameraOutlined />,
      label: 'Bài giảng',
      onClick: () => navigate('/lectures')
    },
    {
      key: 'materials',
      icon: <FileTextOutlined />,
      label: 'Tài liệu học tập',
      onClick: () => navigate('/student/materials')
    },
    {
      key: 'attendance',
      icon: <CalendarOutlined />,
      label: 'Điểm danh',
      onClick: () => navigate('/attendance-marking')
    },
    {
      key: 'messaging',
      icon: <MessageOutlined />,
      label: 'Tin nhắn',
      onClick: () => navigate('/messaging')
    },
    {
      key: 'academic',
      icon: <BookOutlined />,
      label: 'Học lực',
      onClick: () => navigate('/student/academic-performance')
    }
  ];

  const teacherMenuItems = [
    {
      key: 'dashboard',
      icon: <UserOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/teacher')
    },
    {
      key: 'classes',
      icon: <BookOutlined />,
      label: 'Lớp học',
      onClick: () => navigate('/classes')
    },
    {
      key: 'assignments',
      icon: <FileTextOutlined />,
      label: 'Bài tập',
      onClick: () => navigate('/assignments-new')
    },
    {
      key: 'grading',
      icon: <FileTextOutlined />,
      label: 'Chấm điểm',
      onClick: () => navigate('/teacher/grading')
    },
    {
      key: 'lectures',
      icon: <VideoCameraOutlined />,
      label: 'Bài giảng',
      onClick: () => navigate('/lectures')
    },
    {
      key: 'attendance',
      icon: <CalendarOutlined />,
      label: 'Điểm danh',
      onClick: () => navigate('/teacher/attendance')
    },
    {
      key: 'messaging',
      icon: <MessageOutlined />,
      label: 'Tin nhắn',
      onClick: () => navigate('/messaging')
    }
  ];

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout
    }
  ];

  const getMenuItems = () => {
    switch (role) {
      case ROLE.STUDENT:
        return studentMenuItems;
      case ROLE.TEACHER:
        return teacherMenuItems;
      default:
        return [];
    }
  };

  const userMenu = (
    <Menu>
      {userMenuItems.map(item => (
        <Menu.Item key={item.key} icon={item.icon} onClick={item.onClick}>
          {item.label}
        </Menu.Item>
      ))}
    </Menu>
  );

  if (!role || role === 'undefined') {
    return null;
  }

  return (
    <div className="flex items-center justify-between bg-white shadow-sm p-4 mb-6">
      <div className="flex items-center space-x-6">
        <h2 className="text-xl font-bold text-blue-600">SEP490 LMS</h2>
        <Menu mode="horizontal" items={getMenuItems()} className="border-none" />
      </div>
      
      <div className="flex items-center space-x-4">
        <Badge count={5} size="small">
          <MessageOutlined className="text-lg text-gray-600 cursor-pointer" />
        </Badge>
        
        <Dropdown overlay={userMenu} placement="bottomRight">
          <div className="flex items-center space-x-2 cursor-pointer">
            <Avatar icon={<UserOutlined />} />
            <span className="hidden md:inline">{userName}</span>
          </div>
        </Dropdown>
      </div>
    </div>
  );
}
