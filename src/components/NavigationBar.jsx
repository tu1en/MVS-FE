import React, { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';
import { signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
/**
 * NavigationBar component that provides sidebar navigation
 * @returns {JSX.Element} NavigationBar component
 */
function NavigationBar() {
  const dispatch = useDispatch();
  // Sử dụng role từ localStorage
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || null);
  
  // State to control mobile sidebar visibility
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // State to control sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigate = useNavigate();

  // Theo dõi thay đổi role từ localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setUserRole(localStorage.getItem('role'));
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Thêm interval để kiểm tra localStorage thường xuyên
    const checkLocalStorage = setInterval(() => {
      const currentRole = localStorage.getItem('role');
      if (currentRole !== userRole) {
        setUserRole(currentRole);
      }
    }, 1000); // Kiểm tra mỗi giây
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(checkLocalStorage);
    };
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
    const menuButton = document.querySelector('button.md\\:hidden');
    
    const handleMenuClick = () => {
      setIsMobileOpen(prevState => !prevState);
    };
    
    if (menuButton) {
      menuButton.addEventListener('click', handleMenuClick);
      return () => menuButton.removeEventListener('click', handleMenuClick);
    }
  }, []);

  // Listen for toggle event from header button
  useEffect(() => {
    const handleHeaderToggle = () => {
      setIsCollapsed(prevState => !prevState);
      // Also dispatch the custom event for other components
      window.dispatchEvent(new CustomEvent('sidebarToggled', { 
        detail: { isCollapsed: !isCollapsed }
      }));
    };
    
    window.addEventListener('toggleSidebarFromHeader', handleHeaderToggle);
    return () => window.removeEventListener('toggleSidebarFromHeader', handleHeaderToggle);
  }, [isCollapsed]);

  // Set initial state based on window width
  useEffect(() => {
    // Check for window width on initial render
    if (window.innerWidth && typeof window.innerWidth === 'number') {
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
    isMobileOpen || window.innerWidth >= 768 ? 'translate-x-0' : '-translate-x-full'
  } md:translate-x-0`;

  const handleLogout = () => {
    // 1. Đăng xuất khỏi backend - xóa token và role
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    dispatch(logout());
    
    // 2. Đăng xuất khỏi Firebase
    signOut(auth).then(() => {
      console.log('Đã đăng xuất khỏi Firebase thành công');
    }).catch((error) => {
      console.error('Lỗi khi đăng xuất khỏi Firebase:', error);
    });
    
    // Chuyển hướng về trang đăng nhập
    navigate('/');
    
    // Tải lại trang để đảm bảo xóa sạch state
    window.location.reload();
  };

  // Define navigation items with icons and paths
  const navItems = [
    { 
      name: 'Trang Chủ', 
      path: '/', 
      icon: '🏠'
    },
    {
      name: 'Quản lý tài khoản',
      path: '/accounts',
      icon: '👥',
      roles: [ROLE.MANAGER, ROLE.ADMIN]
    },
    { 
      name: 'Lớp Học', 
      path: '/classes', 
      icon: '📚',
      roles: [ROLE.TEACHER, ROLE.ADMIN]
    },
    { 
      name: 'Bài Tập', 
      path: '/assignments', 
      icon: '📝',
      roles: [ROLE.TEACHER, ROLE.ADMIN]
    },
    { 
      name: 'Học Sinh', 
      path: '/students', 
      icon: '👨‍🎓',
      roles: [ROLE.TEACHER, ROLE.ADMIN]
    },
    { 
      name: 'Trang Trắng', 
      path: '/blank', 
      icon: '📄',
      roles: [ROLE.TEACHER, ROLE.ADMIN]
    },
    {
      name: 'Quản lý yêu cầu',
      path: '/request-list',
      icon: '📋',
      roles: [ROLE.MANAGER, ROLE.ADMIN]
    },
    { 
      name: 'Tổng quan học lực', 
      path: '/student-academic-performance', 
      icon: '📊',
      roles: [ROLE.STUDENT]
    },
    { 
      name: 'Xem điểm danh', 
      path: '/student-attendance-records', 
      icon: '📅',
      roles: [ROLE.STUDENT]
    },
    { 
      name: 'Xem bài tập', 
      path: '/student-homework', 
      icon: '📒',
      roles: [ROLE.STUDENT]
    },
    { 
      name: 'Xem điểm kiểm tra', 
      path: '/student-exam-result', 
      icon: '🎓',
      roles: [ROLE.STUDENT]
    },
    { 
      name: 'Lịch Thi', 
      path: '/exam-schedule', 
      icon: '📆',
      roles: [ROLE.STUDENT]
    },
    { 
      name: 'Thành tựu', 
      path: '/student/accomplishments', 
      icon: '🏆',
      roles: [ROLE.STUDENT]
    },
  ];

<<<<<<< Updated upstream
  // Toggle sidebar collapsed state
  const ToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('sidebarToggled', { detail: { isCollapsed: !isCollapsed }}));
=======
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
        },
        hasOfficialContract && {
          name: 'Quản Lý Nghỉ Phép',
          path: '/teacher/leave-requests',
          icon: '🏖️'
        }
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
      items: [
        { 
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
      category: "Nghỉ phép",
      items: [
        { name: 'Quản Lý Nghỉ Phép', path: '/accountant/leave-requests', icon: '🏖️' }
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
      category: "Con Cái",
      items: [
        { name: 'Quản Lý Con Cái', path: '/parent/children', icon: '👨‍👩‍👧‍👦' },
        { name: 'Kết Quả Học Tập', path: '/parent/academic-performance', icon: '📊' },
        { name: 'Điểm Danh', path: '/parent/attendance', icon: '📅' }
      ]
    },
    {
      category: "Thông Tin",
      items: [
        { name: 'Thông Báo', path: '/parent/notifications', icon: '📢' },
        { name: 'Lịch Học', path: '/parent/schedule', icon: '📚' },
        { name: 'Tin Nhắn', path: '/parent/messages', icon: '💬' }
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
>>>>>>> Stashed changes
  };

  // Helper function to check if user has a specific role
  const hasRole = (roleArray) => {
    if (!roleArray || !userRole) return false;
    // Convert userRole to uppercase for comparison
    const normalizedUserRole = String(userRole).toUpperCase();
    return roleArray.some(role => {
      const normalizedRole = String(role).toUpperCase();
      return normalizedUserRole === normalizedRole;
    });
  };

  return (
    <nav className={navClasses}>
      <div className="p-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-primary mb-4 border-b border-gray-200 pb-2">Lớp Học Trực Tuyến</h2>
        )}
        <ul className="space-y-2">
          {navItems
          .filter(item => !item.roles || (item.roles && hasRole(item.roles)))
          .map((item, index) => (
            <li key={index}>
              <NavLink 
                to={item.path}
                className={({ isActive }) => 
                  `flex ${isCollapsed ? 'justify-center' : ''} items-center px-4 py-3 rounded-lg transition-colors ${
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
      </div>
      
      {/* Quick Actions Section */}
      {!isCollapsed && (
        <div className="p-4 border-t border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Thao Tác Nhanh
          </h3>
          <div className="space-y-2">
          {hasRole([ROLE.TEACHER, ROLE.ADMIN]) && 
            <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center">
              <span className="mr-3 text-xl">➕</span>
              <span>Tạo Lớp Mới</span>
            </button>
          }
          {hasRole([ROLE.ADMIN]) && 
            <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center">
              <span className="mr-3 text-xl">📊</span>
              <span>Báo Cáo</span>
            </button>
          }
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

      {/* Toggle Button - Positioned differently to avoid the "bite" effect */}
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