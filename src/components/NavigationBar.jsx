import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { ROLE } from '../constants/constants';
import api from '../services/api'; // Added import for api
import { syncFromLocalStorage } from '../store/slices/authSlice';
import { isUserLoggedIn, performLogout } from '../utils/authUtils';

/**
 * NavigationBar component that provides sidebar navigation based on user role
 * @returns {JSX.Element} NavigationBar component
 */
function NavigationBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Get auth state from Redux store instead of directly from localStorage
  const { isLogin, role: reduxRole } = useSelector((state) => state.auth);
  
  // State to control mobile sidebar visibility
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // State to control sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);
  // User role state
  const [userRole, setUserRole] = useState(null);
  // Thêm hàm kiểm tra hợp đồng chính thức cho teacher
  const [hasOfficialContract, setHasOfficialContract] = useState(false);

  // Get role from Redux and localStorage, and convert to role constant
  useEffect(() => {
    // First sync Redux state with localStorage
    dispatch(syncFromLocalStorage());
    
    // Use utility function to check if user is actually logged in
    const actuallyLoggedIn = isUserLoggedIn();
    
    // Check if user is actually logged in before using any role
    // Handle null/undefined states more gracefully
    if (!actuallyLoggedIn || isLogin === false || isLogin === null) {
      // If not logged in, always set to GUEST regardless of stored role
      setUserRole(ROLE.GUEST);
      if (process.env.NODE_ENV === 'development') {
        console.log('User not logged in (actuallyLoggedIn:', actuallyLoggedIn, 'isLogin:', isLogin, '), setting role to GUEST');
      }
      return;
    }
    
    // Only process role if user is definitively logged in
    if (reduxRole && isLogin === true && actuallyLoggedIn) {
      // Direct role mapping - if role is already the correct constant, use it
      if (Object.values(ROLE).includes(reduxRole)) {
        setUserRole(reduxRole);
        if (process.env.NODE_ENV === 'development') {
          console.log('Using direct role from Redux:', reduxRole);
        }
      } else {
        // Otherwise, map numeric or string values to constants
        const roleMapping = {
          '0': ROLE.ADMIN, // Admin
          '1': ROLE.STUDENT, // Student  
          '2': ROLE.TEACHER, // Teacher
          '3': ROLE.MANAGER, // Manager
          '4': ROLE.GUEST, // Guest (not logged in)
          // Also handle string values from backend
          'ADMIN': ROLE.ADMIN,
          'STUDENT': ROLE.STUDENT,
          'TEACHER': ROLE.TEACHER,
          'MANAGER': ROLE.MANAGER,
          'ACCOUNTANT': ROLE.ACCOUNTANT,
          'GUEST': ROLE.GUEST
        };
        
        const mappedRole = roleMapping[reduxRole] || ROLE.GUEST;
        setUserRole(mappedRole);
        if (process.env.NODE_ENV === 'development') {
          console.log('Using mapped role from Redux:', reduxRole, '→', mappedRole);
        }
      }
    } else {
      // If logged in but no Redux role, check localStorage as fallback
      const storedRole = localStorage.getItem('role');
      const storedToken = localStorage.getItem('token');
      
      if (storedRole && storedToken && isLogin && actuallyLoggedIn) {
        const roleMapping = {
          '0': ROLE.ADMIN,
          '1': ROLE.STUDENT,
          '2': ROLE.TEACHER,
          '3': ROLE.MANAGER,
            '4': ROLE.GUEST,
            'ACCOUNTANT': ROLE.ACCOUNTANT,
            'ADMIN': ROLE.ADMIN,
            'STUDENT': ROLE.STUDENT,
            'TEACHER': ROLE.TEACHER,
            'MANAGER': ROLE.MANAGER,
            'PARENT': ROLE.PARENT
        };
        
          const mappedRole = roleMapping[storedRole] || (Object.values(ROLE).includes(storedRole) ? storedRole : ROLE.GUEST);
        setUserRole(mappedRole);
        if (process.env.NODE_ENV === 'development') {
          console.log('Using role from localStorage:', storedRole, '→', mappedRole);
        }
      } else {
        // Default to guest if no valid role found or not logged in
        setUserRole(ROLE.GUEST);
        if (process.env.NODE_ENV === 'development') {
          console.log('No valid role found or not logged in, defaulting to GUEST');
        }
      }
    }
  }, [dispatch, reduxRole, isLogin]);

  // Thêm hàm kiểm tra hợp đồng chính thức cho teacher
  useEffect(() => {
    if (userRole === ROLE.TEACHER) {
      // Gọi API kiểm tra hợp đồng chính thức
      api.get('/teacher/official-contract-status').then(res => {
        setHasOfficialContract(res.data.hasOfficialContract);
      }).catch(() => setHasOfficialContract(false));
    }
  }, [userRole]);

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Handle header menu button click
  useEffect(() => {
    const handleHeaderToggle = () => {
      setIsCollapsed(prevState => !prevState);
    };
    
    window.addEventListener('toggleSidebarFromHeader', handleHeaderToggle);
    
    return () => {
      window.removeEventListener('toggleSidebarFromHeader', handleHeaderToggle);
    };
  }, []);

  // Toggle sidebar function
  const ToggleSidebar = () => {
    setIsCollapsed(prevState => !prevState);
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('sidebarToggled', { 
      detail: { isCollapsed: !isCollapsed }
    }));
  };

  // Set initial state based on window width
  useEffect(() => {
    // Check for window width on initial render
    if (typeof window !== 'undefined' && window.innerWidth) {
      const initialCollapsed = window.innerWidth < 1024;
      setIsCollapsed(initialCollapsed);
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('sidebarToggled', { 
        detail: { isCollapsed: initialCollapsed }
      }));
    }
  }, []);

  // Combined classes for mobile responsiveness and collapsed state
  const navClasses = `${isCollapsed ? 'w-16' : 'w-64'} bg-white shadow-md h-full fixed left-0 top-16 overflow-y-auto z-40 transition-all duration-300 ${
    isMobileOpen ? 'translate-x-0' : '-translate-x-full'
  } md:translate-x-0`;

  const handleLogout = () => {
    // Sử dụng function logout chung
    performLogout(dispatch, navigate, signOut, auth);
  };

  // Define navigation items for GUEST (not logged in)
  const guestNavItems = [
    {
      category: "Khám phá",
      items: [
        { 
          name: 'Trang Chủ',
          path: '/',
          icon: '🏠'
        },
        { 
          name: 'Về Chúng Tôi',
          path: '/about',
          icon: 'ℹ️'
        },
        { 
          name: 'Danh Sách Khóa Học',
          path: '/courses',
          icon: '📚'
        }
      ]
    }
  ];

  // Define navigation items for STUDENT - Updated with new routes
  const studentNavItems = [
    {
      category: "Chính",
      items: [        
        { 
          name: 'Dashboard', 
          path: '/student', 
          icon: '🏠'
        }
      ]
    },
    {
      category: "Tin tức",
      items: [
        { name: 'Tin Tức', path: '/blog', icon: '📰' }
      ]
    },
    {
      category: "Học tập",
      items: [
        { 
          name: 'Khóa học của tôi', 
          path: '/student/courses', 
          icon: '📚'
        },
        { 
          name: 'Lịch trình', 
          path: '/student/schedule', 
          icon: '📅'
        },
        { 
          name: 'Bài tập', 
          path: '/student/assignments', 
          icon: '📝'
        },        
        { 
          name: 'Kết quả học tập', 
          path: '/student/grades-attendance', 
          icon: '📊'
        },
        { 
          name: 'Tài liệu', 
          path: '/student/materials', 
          icon: '📄'
        },
        { 
          name: 'Thông báo', 
          path: '/student/announcements', 
          icon: '📢'
        }
      ]
    },
    {
      category: "Giao tiếp",
      items: [
        { 
          name: 'Tin Nhắn', 
          path: '/student/messages', 
          icon: '💬'
        }
      ]
    },
    {
      category: "Cá nhân",
      items: [
        {
          name: 'Tài Khoản',
          path: '/student/account',
          icon: '👤'
        },
        { 
          name: 'Thành Tựu', 
          path: '/student/accomplishments', 
          icon: '🏆'
        }
      ]
    }
  ];

  // Define navigation items for TEACHER
  const teacherNavItems = [
    {
      category: "Chính",
      items: [
        { 
          name: 'Trang Chủ/Dashboard', 
          path: '/teacher', 
          icon: '🏠'
        }
      ]
    },
    {
      category: "Tin tức",
      items: [
        { name: 'Tin Tức', path: '/blog', icon: '📰' }
      ]
    },
    {
      category: "Giảng dạy",
      items: [
        { 
          name: 'Quản Lý Khóa Học', 
          path: '/teacher/courses', 
          icon: '📚'
        },
        { 
          name: 'Lịch Dạy', 
          path: '/teacher/schedule', 
          icon: '📅'
        },
        { 
          name: 'Quản Lý Bài Tập', 
          path: '/teacher/assignments', 
          icon: '📝'
        },
        // {
        //   name: 'Quản Lý Bài Giảng', 
        //   path: '/teacher/lectures', 
        //   icon: '📔'
        // },
        {
          name: 'Lịch Sử Giảng Dạy', 
          path: '/teacher/teaching-history', 
          icon: '🕒'
        }
      ]
    },
    {
      category: "Giao tiếp",
      items: [
        { 
          name: 'Hỏi Đáp & Tin Nhắn', 
          path: '/teacher/messages', 
          icon: '💬'
        },
        { 
          name: 'Thông Báo', 
          path: '/teacher/announcements', 
          icon: '📢'
        }
      ]
    },
    {
      category: "Lương",
      items: [
        { name: 'Lương của tôi', path: '/teacher/my/payroll', icon: '💵' }
      ]
    },
    {
      category: "Cá nhân",
      items: [
        {
          name: 'Tài Khoản',
          path: '/teacher/account',
          icon: '👤'
        },
        hasOfficialContract && {
          name: 'Quản Lý Nghỉ Phép',
          path: '/teacher/leave-requests',
          icon: '🏖️'
        },
        {
          name: 'Yêu Cầu Giải Trình',
          path: '/teacher/explanation-request',
          icon: '📝'
        },

      ].filter(Boolean)
    }
  ];

  // Define navigation items for MANAGER
  const managerNavItems = [
    {
      category: "Chính",
      items: [
        { 
          name: 'Trang Chủ/Dashboard', 
          path: '/manager', 
          icon: '🏠'
        }
      ]
    },
    {
      category: "Tin tức",
      items: [
        { name: 'Tin Tức', path: '/blog', icon: '📰' }
      ]
    },
    {
      category: "Quản lý",
      items: [
        { 
          name: 'Quản Lý Yêu Cầu', 
          path: '/request-list',
          icon: '📋'
        },
        { 
          name: 'Quản Lý Nghỉ Phép', 
          path: '/manager/leave-management',
          icon: '🏖️'
        },
        { 
          name: 'Quản Lý Giao Tiếp', 
          path: '/manager/communications', 
          icon: '📢'
        },
        { 
          name: 'Quản Lý Tuyển Dụng',
          path: '/manager/recruitment',
          icon: '🧑‍💼'
        },
        { 
          name: 'Báo cáo', 
          path: '/manager/reports', 
          icon: '📊'
        }
      ]
    },
    {
      category: "Điểm danh",
      items: [
        { 
          name: 'Giải trình điểm danh', 
          path: '/manager/explanation-reports',
          icon: '📝'
        },
        { 
          name: 'Chấm công nhân viên', 
          path: '/manager/all-staff-attendance-logs',
          icon: '👥'
        },
        { 
          name: 'Lịch sử chấm công', 
          path: '/manager/personal-attendance-history',
          icon: '📊'
        },
        { 
          name: 'Trạng thái giáo viên', 
          path: '/manager/teacher-attendance-status',
          icon: '👨‍🏫'
        },
        { 
          name: 'Ca làm việc hàng ngày', 
          path: '/manager/daily-shift-attendance',
          icon: '🕒'
        }
      ]
    },
    {
      category: "Giao tiếp",
      items: [
        { 
          name: 'Tin Nhắn', 
          path: '/manager/messages', 
          icon: '💬'
        }
      ]
    },
    {
      category: "Lương",
      items: [
        { name: 'Lương của tôi', path: '/manager/my/payroll', icon: '💵' }
      ]
    },
    {
      category: "Cá nhân",
      items: [
        {
          name: 'Tài Khoản',
          path: '/manager/account',
          icon: '👤'
        }
      ]
    }
  ];

  // Define navigation items for ADMIN (includes all Manager options plus system admin options)
  const adminNavItems = [
    {
      category: "Chính",
      items: [
        { 
          name: 'Trang Chủ/Dashboard', 
          path: '/admin', 
          icon: '🏠'
        }
      ]
    },
    {
      category: "Tin tức",
      items: [
        { name: 'Tin Tức', path: '/blog', icon: '📰' }
      ]
    },
    {
      category: "Quản trị hệ thống",
      items: [
        { 
          name: 'Quản Lý Người Dùng', 
          path: '/admin/users', 
          icon: '👥'
        },
        { 
          name: 'Quản Lý Khóa Học', 
          path: '/admin/courses', 
          icon: '📚'
        },
        { 
          name: 'Cấu Hình Hệ Thống', 
          path: '/admin/settings', 
          icon: '⚙️'
        }
      ]
    },
    {
      category: "Cá nhân",
      items: [
        {
          name: 'Tài Khoản',
          path: '/admin/account',
          icon: '👤'
        }
      ]
    }
  ];

  // Define navigation items for ACCOUNTANT
  const accountantNavItems = [
    {
      category: "Chính",
      items: [
        { name: 'Trang Chủ/Dashboard', path: '/accountant', icon: '🏠' }
      ]
    },
    {
      category: "Tin tức",
      items: [
        { name: 'Tin Tức', path: '/blog', icon: '📰' }
      ]
    },
    {
      category: "Lương",
      items: [
        { name: 'Lương của tôi', path: '/accountant/my/payroll', icon: '💵' },
        { name: 'Quản lý bảng lương', path: '/accountant/payroll', icon: '📑' }
      ]
    },
    {
      category: "Thông Báo",
      items: [
        { name: 'Thông Báo', path: '/accountant/announcements', icon: '📢' }
      ]
    },
    {
      category: "Điểm danh",
      items: [
        { name: 'Giải trình vi phạm', path: '/accountant/attendance-explanations', icon: '📝' },
        // { name: 'Xem trạng thái giải trình', path: '/accountant/explanation-status', icon: '📊' }
      ]
    },
    {
      category: "Lương",
      items: [
        { name: 'Lương của tôi', path: '/accountant/my/payroll', icon: '💵' },
        { name: 'Quản lý bảng lương', path: '/accountant/payroll', icon: '📑' },
        { name: 'Tra soát lương', path: '/accountant/payroll-issues', icon: '🛠️' }
      ]
    },
    {
      category: "Nghỉ phép",
      items: [
        { name: 'Quản Lý Nghỉ Phép', path: '/accountant/leave-requests', icon: '🏖️' },
        { name: 'Yêu Cầu Giải Trình', path: '/accountant/explanation-request', icon: '📝' },

      ]
    }
  ];

  // Define navigation items for PARENT
  const parentNavItems = [
    {
      category: "Chính",
      items: [
        { name: 'Trang Chủ/Dashboard', path: '/parent', icon: '🏠' }
      ]
    },
    {
      category: "Tin tức",
      items: [
        { name: 'Tin Tức', path: '/blog', icon: '📰' }
      ]
    }
  ];

  const getNavItems = () => {
    switch(userRole) {
      case ROLE.STUDENT:
        return studentNavItems;
      case ROLE.TEACHER:
        return teacherNavItems;
      case ROLE.ADMIN:
        return adminNavItems;
      case ROLE.MANAGER:
        return managerNavItems;
      case ROLE.ACCOUNTANT:
        return accountantNavItems;
      case ROLE.PARENT:
        return parentNavItems;
      default:
        return guestNavItems;
    }
  };

  const navItems = getNavItems();
  
  if (!isLogin && userRole === ROLE.GUEST) {
    return null; // Don't render sidebar if not logged in
  }

  return (
    <div className={navClasses}>
      <nav className="flex-1 px-2 py-4 space-y-2">
        {navItems.map((nav, index) => (
          <div key={index}>
            {!isCollapsed && (
              <h3 className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                {nav.category}
              </h3>
            )}
            {nav.items.map((item, idx) => (
              <NavLink
                key={idx}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${
                    isActive
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  } ${isCollapsed ? 'justify-center' : ''}`
                }
              >
                <span className="text-lg">{item.icon}</span>
                {!isCollapsed && <span className="ml-3">{item.name}</span>}
              </NavLink>
            ))}
          </div>
        ))}
        
        {/* Quick Actions Section - Only for logged in users */}
        {!isCollapsed && userRole !== ROLE.GUEST && (
          <div className="p-4 border-t border-gray-200 mt-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
              Thao Tác Nhanh
            </h3>
            <div className="space-y-2">
              {/* Chỉ cho phép giáo viên thao tác nhanh tạo lớp */}
              {userRole === ROLE.TEACHER && (
                <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center">
                  <span className="mr-3 text-xl">➕</span>
                  <span>Tạo Lớp Mới</span>
                </button>
              )}
              {/* Ẩn Báo Cáo và Tạo Lớp Mới cho admin */}
              <button 
                className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center"
                onClick={() => navigate('/change-password')}
              >
                <span className="mr-3 text-xl">🔑</span>
                <span>Đổi Mật Khẩu</span>
              </button>
              <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center">
                <span className="mr-3 text-xl">⚙️</span>
                <span>Cài Đặt</span>
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors flex items-center"
              >
                <span className="mr-3 text-xl">🚪</span>
                <span>Đăng Xuất</span>
              </button>
            </div>
          </div>
        )}
      </nav>
      
      {/* Sidebar Toggle Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={ToggleSidebar}
          className="w-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-150"
        >
          {isCollapsed ? 'Mở rộng' : 'Thu gọn'}
        </button>
      </div>
    </div>
  );
}

export default NavigationBar;