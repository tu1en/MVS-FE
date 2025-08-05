import { Lock, LogOut, User } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout, syncFromLocalStorage } from '../store/slices/authSlice';
import { performLogout } from '../utils/authUtils';
import RegisterModal from './RegisterModal';
import NotificationBell from './NotificationBell';

/**
 * Header component for the application
 * @returns {JSX.Element} Header with navigation
 */
function Header() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLogin, user } = useSelector((state) => state.auth);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const settingsMenuRef = useRef(null);

  // Sync Redux state with localStorage on component mount
  useEffect(() => {
    dispatch(syncFromLocalStorage());
  }, [dispatch]);

  // Close settings menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (settingsMenuRef.current && !settingsMenuRef.current.contains(event.target)) {
        setShowSettingsMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogin = () => {
    navigate('/login');
  };

  const handleLogout = () => {
    // Sử dụng function logout chung
    performLogout(dispatch, navigate);
    setShowSettingsMenu(false);
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    window.dispatchEvent(new Event('toggleSidebarFromHeader'));
  };

  const openRegisterModal = () => {
    setRegisterModalVisible(true);
  };

  const closeRegisterModal = () => {
    setRegisterModalVisible(false);
  };

  const toggleSettingsMenu = () => {
    setShowSettingsMenu(!showSettingsMenu);
  };

  return (
    <header className="bg-white text-primary shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden p-2 mr-2 text-primary hover:text-primary-dark"
          onClick={() => toggleSidebar()}
        >
          <span className="text-xl">☰</span>
        </button>
      
        {/* Logo and App Name */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="text-xl font-bold text-primary hover:text-primary-dark transition-colors">
            Minh Việt Education
          </Link>
          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-4">
            <Link 
              to="/courses" 
              className="text-gray-700 hover:text-primary font-medium transition-colors"
            >
              Browse Courses
            </Link>
          </nav>
        </div>
        
        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-xl mx-4">
          <div className="relative w-full">
            <input 
              type="text" 
              placeholder="Tìm kiếm lớp học, bài tập, học sinh..." 
              className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>
        </div>
        
        {/* User Actions */}
        <div className="flex items-center space-x-4">
          {isLogin && (
            <>
              <NotificationBell />
              
              {/* Settings Dropdown */}
              <div className="relative" ref={settingsMenuRef}>
                <button 
                  onClick={toggleSettingsMenu}
                  className="flex items-center space-x-2 hover:bg-gray-100 rounded-full p-1 transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}</span>
                    )}
                  </div>
                  <span className="hidden md:inline font-medium">{user?.name || 'Người dùng'}</span>
                  <svg className={`w-4 h-4 transition-transform ${showSettingsMenu ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Settings Dropdown Menu */}
                {showSettingsMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    <Link 
                      to="/profile" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowSettingsMenu(false)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Hồ sơ
                    </Link>
                    <Link 
                      to="/change-password" 
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setShowSettingsMenu(false)}
                    >
                      <Lock className="h-4 w-4 mr-2" />
                      Đổi mật khẩu
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          {!isLogin && (
            <>
              <button
                className="hidden sm:block px-4 py-1 text-white bg-primary rounded hover:bg-primary-dark transition-colors"
                onClick={handleLogin}
              >
                Đăng nhập
              </button>
              <button 
                onClick={openRegisterModal}
                className="hidden sm:block px-4 py-1 border border-primary text-primary rounded hover:bg-primary-light hover:text-primary-dark transition-colors"
              >
                Đăng Ký
              </button>
            </>
          )}
        </div>
      </div>
      
      {/* Modal đăng ký */}
      <RegisterModal open={registerModalVisible} onClose={closeRegisterModal} />
    </header>
  );
}

export default Header;