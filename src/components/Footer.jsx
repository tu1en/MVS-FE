import React from 'react';

/**
 * Footer component for the application
 * @returns {JSX.Element} Footer with basic contact information and copyright
 */
function Footer() {
  // Get current year for copyright
  const currentYear = new Date().getFullYear();
  
  const handleSupportClick = () => {
    // Mở Messenger Facebook của trung tâm
    window.open('https://www.facebook.com/messages/t/544090102127045', '_blank');
  };
  
  return (
    <footer className="bg-gray-900 text-white w-full">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {/* Contact Information */}
        <div className="text-center space-y-4 mb-6">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-primary font-semibold">Địa chỉ trung tâm:</span>
            <span>Thôn Uy Bắc, xã Quảng Ngọc, huyện Quảng Xương, tỉnh Thanh Hoá</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <span className="text-primary font-semibold">Số điện thoại liên hệ:</span>
            <span>0827 640 788</span>
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <span className="text-primary font-semibold">Email liên hệ:</span>
            <span>minhvieteducation01@gmail.com</span>
          </div>
        </div>
        
        {/* Support Button */}
        <div className="text-center mb-6">
          <button
            onClick={handleSupportClick}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            Liên hệ hỗ trợ
          </button>
        </div>
        
        {/* Copyright */}
        <div className="border-t border-gray-800 pt-4 text-center text-gray-400">
          <p>© {currentYear} Minh Việt Educational. Tất cả các quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer; 