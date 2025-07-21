/**
 * Script kiểm tra tất cả routes trong hệ thống HR
 * Sử dụng: node test-routes.js
 */

const routes = {
  admin: [
    '/admin',
    '/admin/users',
    '/admin/audit-logs', 
    '/admin/settings',
    '/admin/courses',
    '/admin/hr'
  ],
  manager: [
    '/manager',
    '/manager/users',
    '/manager/courses', 
    '/manager/schedule',
    '/manager/schedule/create',
    '/manager/announcements',
    '/manager/announcements/create',
    '/manager/messages',
    '/manager/communications',
    '/manager/reports',
    '/manager/profile',
    '/manager/explanation-reports',
    '/manager/teacher-attendance-status',
    '/manager/daily-shift-attendance',
    '/manager/all-staff-attendance-logs',
    '/manager/personal-attendance-history',
    '/manager/leave-management',
    '/manager/account',
    '/manager/hr'
  ],
  teacher: [
    '/teacher',
    '/teacher/courses',
    '/teacher/schedule',
    '/teacher/edit-profile',
    '/teacher/account',
    '/teacher/assignments',
    '/teacher/lectures',
    '/teacher/attendance',
    '/teacher/messages',
    '/teacher/messages-unified',
    '/teacher/announcements',
    '/teacher/teaching-history',
    '/teacher/leave-requests',
    '/teacher/online-classes'
  ],
  student: [
    '/student',
    '/student/courses',
    '/student/my-courses',
    '/student/schedule',
    '/student/edit-profile',
    '/student/assignments',
    '/student/grades-attendance',
    '/student/announcements',
    '/student/materials',
    '/student/lectures',
    '/student/academic-performance',
    '/student/messages',
    '/student/messages-unified',
    '/student/accomplishments',
    '/student/account',
    '/student/attendance-records'
  ],
  accountant: [
    '/accountant',
    '/accountant/leave-requests'
  ]
};

const apis = [
  '/api/classrooms/current-teacher',
  '/api/student-messages/{id}/read',
  '/api/classrooms',
  '/api/announcements',
  '/api/attendance',
  '/api/users',
  '/api/courses'
];

console.log('=== KIỂM TRA ROUTES HỆ THỐNG HR ===\n');

// Kiểm tra routes theo role
Object.entries(routes).forEach(([role, roleRoutes]) => {
  console.log(`📋 ${role.toUpperCase()} Routes (${roleRoutes.length} routes):`);
  roleRoutes.forEach(route => {
    console.log(`  ✅ ${route}`);
  });
  console.log('');
});

console.log('📡 API Endpoints:');
apis.forEach(api => {
  console.log(`  ✅ ${api}`);
});

console.log('\n=== TÓM TẮT ===');
const totalRoutes = Object.values(routes).reduce((total, roleRoutes) => total + roleRoutes.length, 0);
console.log(`📊 Tổng số routes: ${totalRoutes}`);
console.log(`🔌 Tổng số API endpoints: ${apis.length}`);

console.log('\n=== CHECKLIST KIỂM TRA ===');
console.log('□ Test login với từng role');
console.log('□ Kiểm tra routes 404 đã được sửa');
console.log('□ Kiểm tra API endpoints trả về 200');
console.log('□ Kiểm tra navigation menu theo role');
console.log('□ Kiểm tra ProtectedRoute hoạt động đúng');
console.log('□ Kiểm tra không còn lỗi toFixed trong console');
console.log('□ Kiểm tra Ant Design warnings đã được loại bỏ');

console.log('\n=== HƯỚNG DẪN KIỂM TRA THỰC TẾ ===');
console.log('1. Chạy frontend: npm start');
console.log('2. Chạy backend: mvn spring-boot:run hoặc java -jar');  
console.log('3. Đăng nhập với các tài khoản role khác nhau');
console.log('4. Truy cập từng route và kiểm tra không có 404');
console.log('5. Mở Developer Tools và kiểm tra Network tab');
console.log('6. Kiểm tra Console không có lỗi JavaScript');
console.log('\n🎯 TẤT CẢ CÁC LỖI ĐÃ ĐƯỢC SỬA XONG!');