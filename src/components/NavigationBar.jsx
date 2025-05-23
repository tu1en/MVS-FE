import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';

/**
 * NavigationBar component that provides sidebar navigation
 * @returns {JSX.Element} NavigationBar component
 */
function NavigationBar() {
  // State to control mobile sidebar visibility
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  // State to control sidebar collapsed state
  const [isCollapsed, setIsCollapsed] = useState(false);
  
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

  // Define navigation items with icons and paths
  const navItems = [
    { 
      name: 'Trang Chủ', 
      path: '/', 
      icon: '🏠'
    },
    { 
      name: 'Lớp Học', 
      path: '/classes', 
      icon: '📚'
    },
    { 
      name: 'Bài Tập', 
      path: '/assignments', 
      icon: '📝'
    },
    { 
      name: 'Học Sinh', 
      path: '/students', 
      icon: '👨‍🎓'
    },
    { 
      name: 'Trang Trắng', 
      path: '/blank', 
      icon: '📄'
    }
  ];

  // Toggle sidebar collapsed state
  const ToggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Dispatch custom event for other components to listen to
    window.dispatchEvent(new CustomEvent('sidebarToggled', { detail: { isCollapsed: !isCollapsed }}));
  };

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

  return (
    <nav className={navClasses}>
      <div className="p-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold text-primary mb-4 border-b border-gray-200 pb-2">Lớp Học Trực Tuyến</h2>
        )}
        <ul className="space-y-2">
          {navItems.map((item, index) => (
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
            <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center">
              <span className="mr-3 text-xl">➕</span>
              <span>Tạo Lớp Mới</span>
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center">
              <span className="mr-3 text-xl">📊</span>
              <span>Báo Cáo</span>
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-primary-light hover:text-primary transition-colors flex items-center">
              <span className="mr-3 text-xl">⚙️</span>
              <span>Cài Đặt</span>
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