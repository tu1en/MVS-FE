import React from 'react';

/**
 * HomePage component displays the dashboard and overview of the classroom application
 * @returns {JSX.Element} HomePage component
 */
function HomePage() {
  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md">
        <h2 className="text-xl font-bold text-blue-700 mb-2">Chào mừng đến với Lớp Học Trực Tuyến</h2>
        <p className="text-blue-600">
          Quản lý lớp học, bài tập và học sinh của bạn tại một nơi duy nhất.
        </p>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Lớp Học</h3>
          <div className="flex items-center">
            <span className="text-3xl font-bold text-blue-600">8</span>
            <span className="ml-2 text-gray-500">Lớp đang hoạt động</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Học Sinh</h3>
          <div className="flex items-center">
            <span className="text-3xl font-bold text-green-600">125</span>
            <span className="ml-2 text-gray-500">Học sinh đã đăng ký</span>
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Bài Tập</h3>
          <div className="flex items-center">
            <span className="text-3xl font-bold text-purple-600">24</span>
            <span className="ml-2 text-gray-500">Bài tập đang hoạt động</span>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-700 mb-4">Hoạt Động Gần Đây</h3>
        <div className="space-y-3">
          <div className="flex items-start border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
              <span className="text-sm font-semibold">NT</span>
            </div>
            <div>
              <p className="text-gray-700">Nguyễn Thành đã nộp <span className="font-medium">Bài tập Toán số 3</span></p>
              <p className="text-sm text-gray-500">2 giờ trước</p>
            </div>
          </div>
          
          <div className="flex items-start border-b border-gray-100 pb-3">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 mr-3">
              <span className="text-sm font-semibold">TL</span>
            </div>
            <div>
              <p className="text-gray-700">Trần Lan đã tạo <span className="font-medium">Dự án Khoa học</span></p>
              <p className="text-sm text-gray-500">5 giờ trước</p>
            </div>
          </div>
          
          <div className="flex items-start">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 mr-3">
              <span className="text-sm font-semibold">PH</span>
            </div>
            <div>
              <p className="text-gray-700">Phạm Huy đã tham gia <span className="font-medium">Lịch sử 101</span></p>
              <p className="text-sm text-gray-500">Hôm qua</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage; 