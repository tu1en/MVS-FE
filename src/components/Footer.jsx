import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer component for the application
 * @returns {JSX.Element} Footer with links and copyright
 */
function Footer() {
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {/* Main footer content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-primary">Về Minh Việt Education</h3>
            <ul className="space-y-2">
              <li><Link to="/" className="hover:text-primary-hover transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/" className="hover:text-primary-hover transition-colors">Chính sách đối tác</Link></li>
              <li><Link to="/" className="hover:text-primary-hover transition-colors">Chính sách bảo mật</Link></li>
              <li><Link to="/" className="hover:text-primary-hover transition-colors">Điều khoản sử dụng</Link></li>
            </ul>
          </div>
          
          {/* Services section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-primary">Dịch Vụ</h3>
            <ul className="space-y-2">
              <li><Link to="/classes" className="hover:text-primary-hover transition-colors">Lớp Học</Link></li>
              <li><Link to="/assignments" className="hover:text-primary-hover transition-colors">Bài Tập</Link></li>
              <li><Link to="/students" className="hover:text-primary-hover transition-colors">Học Sinh</Link></li>
              <li><Link to="/" className="hover:text-primary-hover transition-colors">Tuyển dụng</Link></li>
            </ul>
          </div>
          
          {/* Contact section */}
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2 border-primary">Liên Hệ</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <span className="mr-2 text-primary">📍</span>
                <span>Số 123 Đường Giáo Dục, Quận Học Tập, TP. Tri Thức</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">📱</span>
                <span>(+84) 123 456 789</span>
              </li>
              <li className="flex items-start">
                <span className="mr-2 text-primary">✉️</span>
                <span>info@lophoctructuyen.com</span>
              </li>
              <li>
                <div className="flex space-x-3 mt-3">
                  <Link to="/" className="bg-primary hover:bg-primary-dark w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                    <span>📱</span>
                  </Link>
                  <Link to="/" className="bg-primary hover:bg-primary-dark w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                    <span>💻</span>
                  </Link>
                  <Link to="/" className="bg-primary hover:bg-primary-dark w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                    <span>📷</span>
                  </Link>
                  <Link to="/" className="bg-primary hover:bg-primary-dark w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                    <span>📺</span>
                  </Link>
                </div>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Hours section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 py-4 border-t border-gray-800">
          <div className="flex space-x-12">
            <div>
              <p className="font-semibold mb-1">Thứ 2-6:</p>
              <p>7h00 - 21h00</p>
            </div>
            <div>
              <p className="font-semibold mb-1">Thứ 7:</p>
              <p>8h00 - 15h00</p>
            </div>
          </div>
          <div className="md:text-right">
            <p className="font-semibold mb-1">Email:</p>
            <p>support@lophoctructuyen.com</p>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 mt-6 pt-4 text-center text-gray-400">
          <p>© {currentYear} Minh Việt Education. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 