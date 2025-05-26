import React from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

/**
 * Header component for the application
 * @returns {JSX.Element} Header with navigation
 */
function Header() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate('/select-role');
  };
  // Toggle sidebar function
  const toggleSidebar = () => {
    window.dispatchEvent(new Event('toggleSidebarFromHeader'));
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
        <div className="flex items-center">
          <Link to="/" className="text-xl font-bold text-primary hover:text-primary-dark transition-colors">
            Lớp Học Trực Tuyến
          </Link>
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
          <div className="relative">
            <button className="p-2 text-primary hover:text-primary-dark">
              <span className="text-xl">🔔</span>
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">3</span>
            </button>
          </div>
          <button
            className="hidden sm:block px-4 py-1 text-white bg-primary rounded hover:bg-primary-dark transition-colors"
            onClick={handleLogin}
          >
            Đăng nhập
          </button>
          <button className="hidden sm:block px-4 py-1 border border-primary text-primary rounded hover:bg-primary-light hover:text-primary-dark transition-colors">
            Đăng Ký
          </button>
        </div>
      </div>
    </header>
  );
}
export default Header;