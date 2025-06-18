import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useNavigate } from 'react-router-dom';
import { auth } from '../config/firebase';
import { ROLE } from '../constants/constants';
import { logout, syncFromLocalStorage } from '../store/slices/authSlice';
import { clearAuthData, isUserLoggedIn } from '../utils/authUtils';

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
  const [userRole, setUserRole] = useState(null);  // Get role from Redux and localStorage, and convert to role constant
  useEffect(() => {
    // First sync Redux state with localStorage
    dispatch(syncFromLocalStorage());
    
    // Use utility function to check if user is actually logged in
    const actuallyLoggedIn = isUserLoggedIn();
    
    // Check if user is actually logged in before using any role
    if (!actuallyLoggedIn || !isLogin) {
      // If not logged in, always set to GUEST regardless of stored role
      setUserRole(ROLE.GUEST);
      if (process.env.NODE_ENV === 'development') {
        console.log('User not logged in (actuallyLoggedIn:', actuallyLoggedIn, 'isLogin:', isLogin, '), setting role to GUEST');
      }
      return;
    }
    
    // Only process role if user is logged in
    if (reduxRole && isLogin && actuallyLoggedIn) {
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
          '4': ROLE.GUEST
        };
        
        const mappedRole = roleMapping[storedRole] || ROLE.GUEST;
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

  // Close sidebar when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);  }, []);
    // Handle header menu button click
  useEffect(() => {
    // Remove unused handleMenuClick function
    // const handleMenuClick = () => {
    //   setIsMobileOpen(prevState => !prevState);
    // };
    
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
    // 1. Reset user role immediately
    setUserRole(ROLE.GUEST);
    
    // 2. Clear all auth data using utility function
    clearAuthData();
    
    // 3. Dispatch logout action to Redux
    dispatch(logout());
    
    // 4. Đăng xuất khỏi Firebase
    signOut(auth).then(() => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Đã đăng xuất khỏi Firebase thành công');
      }
    }).catch((error) => {
      console.error('Lỗi khi đăng xuất khỏi Firebase:', error);
    });
    
    // 5. Chuyển hướng về trang đăng nhập
    navigate('/');
    
    // 6. Tải lại trang để đảm bảo xóa sạch state
    window.location.reload();
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

  // Define navigation items for STUDENT
  const studentNavItems = [
    {
      category: "Chính",
      items: [        { 
          name: 'Trang Chủ/Dashboard', 
          path: '/student', 
          icon: '🏠'
        }
      ]
    },
    {
      category: "Học tập",
      items: [
        { 
          name: 'Khóa Học Của Tôi', 
          path: '/student/my-courses', 
          icon: '📚'
        },
        { 
          name: 'Lịch Học', 
          path: '/student/timetable', 
          icon: '📅'
        },        { 
          name: 'Kết Quả Học Tập', 
          path: '/student/academic-performance', 
          icon: '📊'
        },
        {
          name: 'Bài Tập', 
          path: '/student/assignments', 
          icon: '📝'
        },
        { 
          name: 'Bài Giảng', 
          path: '/student/lectures', 
          icon: '📔'
        },
        { 
          name: 'Xem Điểm Danh', 
          path: '/student/attendance-records', 
          icon: '📋'
        }
      ]
    },
    {
      category: "Giao tiếp",
      items: [
        { 
          name: 'Hỏi Đáp & Tin Nhắn', 
          path: '/student/messages', 
          icon: '💬'
        },
        { 
          name: 'Blog', 
          path: '/blog', 
          icon: '📝'
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
      items: [        { 
          name: 'Trang Chủ/Dashboard', 
          path: '/teacher', 
          icon: '🏠'
        }
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
        {
          name: 'Quản Lý Bài Giảng', 
          path: '/teacher/lectures', 
          icon: '📔'
        },
        {
          name: 'Quản Lý Điểm Danh', 
          path: '/teacher/attendance', 
          icon: '📋'
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
        },
        { 
          name: 'Blog', 
          path: '/blog', 
          icon: '📝'
        }
      ]
    },
    {
      category: "Cá nhân",
      items: [
        {
          name: 'Tài Khoản',
          path: '/teacher/account',
          icon: '👤'
        }
      ]
    }
  ];

  // Define navigation items for MANAGER
  const managerNavItems = [
    {
      category: "Chính",
      items: [        { 
          name: 'Trang Chủ/Dashboard', 
          path: '/manager', 
          icon: '🏠'
        }
      ]
    },
    {
      category: "Quản lý",
      items: [        { 
          name: 'Quản Lý Yêu Cầu', 
          path: '/request-list',
          icon: '📋'
        },
        { 
          name: 'Quản Lý Giao Tiếp', 
          path: '/manager/communications', 
          icon: '📢'
        },
        { 
          name: 'Quản Lý Người Dùng', 
          path: '/manager/users', 
          icon: '👥'
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
      items: [        { 
          name: 'Trang Chủ/Dashboard', 
          path: '/admin', 
          icon: '🏠'
        }
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
      category: "Quản lý",
      items: [
        { 
          name: 'Quản Lý Yêu Cầu', 
          path: '/admin/requests', 
          icon: '📋'
        },
        { 
          name: 'Quản Lý Giao Tiếp', 
          path: '/admin/communications', 
          icon: '📢'
        },
        { 
          name: 'Quản Lý Báo Cáo', 
          path: '/admin/reports', 
          icon: '📊'
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

  // Select navigation items based on user role
  let navItems = [];
  
  switch(userRole) {
    case ROLE.STUDENT:
      navItems = studentNavItems;
      break;
    case ROLE.TEACHER:
      navItems = teacherNavItems;
      break;
    case ROLE.MANAGER:
      navItems = managerNavItems;
      break;
    case ROLE.ADMIN:
      navItems = adminNavItems;
      break;
    default:
      navItems = guestNavItems;
      break;  }

  return (
    <nav className={navClasses}>
      <div className="p-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-primary mb-4 border-b border-gray-200 pb-2">MVS Classroom</h2>
        )}

        <div className="space-y-4">
          {navItems.map((category, categoryIndex) => (
            <div key={categoryIndex} className="nav-category">
              {!isCollapsed && (
                <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 px-4">
                  {category.category}
                </h3>
              )}
              <ul className="space-y-1">
                {category.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <NavLink 
                      to={item.path}
                      className={({ isActive }) => 
                        `flex ${isCollapsed ? 'justify-center' : ''} items-center px-4 py-2 rounded-lg transition-colors ${
                          isActive 
                            ? 'bg-primary text-white' 
                            : 'text-gray-700 hover:bg-primary-light hover:text-primary'
                        }`
                      }
                      end={item.path === '/'}
                      onClick={() => window.innerWidth < 768 && setIsMobileOpen(false)}
                      title={isCollapsed ? item.name : ''}
                    >
                      <span className={isCollapsed ? '' : 'mr-3'} style={{ fontSize: '1.25rem' }}>{item.icon}</span>
                      {!isCollapsed && <span>{item.name}</span>}
                    </NavLink>
                  </li>
                ))}
              </ul>
              {!isCollapsed && categoryIndex < navItems.length - 1 && (
                <div className="border-b border-gray-200 my-3"></div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Quick Actions Section - Only for logged in users */}
      {!isCollapsed && userRole !== ROLE.GUEST && (
        <div className="p-4 border-t border-gray-200 mt-4">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Thao Tác Nhanh
          </h3>
          <div className="space-y-2">
            {(userRole === ROLE.TEACHER || userRole === ROLE.ADMIN) && (
              <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center">
                <span className="mr-3 text-xl">➕</span>
                <span>Tạo Lớp Mới</span>
              </button>
            )}
            {userRole === ROLE.ADMIN && (
              <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center">
                <span className="mr-3 text-xl">📊</span>
                <span>Báo Cáo</span>
              </button>
            )}
            <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center">
              <span className="mr-3 text-xl">⚙️</span>
              <span>Cài Đặt</span>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center"
            >
              <span className="mr-3 text-xl">🚪</span>
              <span>Đăng Xuất</span>
            </button>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      <div className="absolute bottom-4 right-2 flex justify-center items-center">
        <button 
          onClick={ToggleSidebar}
          className="bg-primary text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg hover:bg-primary-dark transition-colors"
          title={isCollapsed ? "Mở rộng" : "Thu gọn"}
        >
          {isCollapsed ? '→' : '←'}
        </button>
      </div>
    </nav>
  );
}

export default NavigationBar;