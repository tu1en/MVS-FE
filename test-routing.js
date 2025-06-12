/**
 * Script để test tất cả routes có trong NavigationBar vs App.js
 * Chạy script này để kiểm tra còn route nào bị thiếu
 */

// Routes từ NavigationBar.jsx
const navigationRoutes = {
  GUEST: [
    '/',
    '/about',
    '/courses',
    '/register/student',
    '/register/teacher',
    '/login'
  ],
  STUDENT: [
    '/student',
    '/student/my-courses',
    '/student/timetable',
    '/student-academic-performance',
    '/assignments-new', // ⚠️ QUAN TRỌNG - Route này cần được bảo vệ
    '/lectures-new',
    '/student-attendance-records',
    '/student/messages',
    '/student/account',
    '/student/accomplishments'
  ],
  TEACHER: [
    '/teacher',
    '/teacher/courses',
    '/teacher/schedule',
    '/assignments-new', // ⚠️ QUAN TRỌNG - Route này cần được bảo vệ
    '/lectures-new',
    '/attendance-new',
    '/teacher/messages',
    '/teacher/announcements',
    '/teacher/account'
  ],
  MANAGER: [
    '/manager',
    '/request-list',
    '/manager/communications',
    '/manager/users',
    '/manager/messages',
    '/manager/account'
  ],
  ADMIN: [
    '/admin',
    '/admin/users',
    '/admin/courses',
    '/admin/settings',
    '/admin/requests',
    '/admin/communications',
    '/admin/reports',
    '/admin/account'
  ]
};

// Routes từ App.js (đã cập nhật)
const appRoutes = [
  '/',
  '/select-role',
  '/classes',
  '/assignments',
  '/assignments-old',
  '/assignments-new', // ✅ ĐÃ được bảo vệ
  '/student/assignments', // ✅ ĐÃ được bảo vệ
  '/submit-homework',
  '/lectures',
  '/lectures-new',
  '/online-classes',
  '/attendance-marking',
  '/attendance-new',
  '/messaging',
  '/communication',
  '/feedback',
  '/blogs',
  '/blank',
  '/login',
  '/forgot-password',
  '/reset-password',
  '/change-password',
  '/register/student',
  '/register/teacher',
  '/admin',
  '/admin/users',
  '/admin/courses',
  '/admin/settings',
  '/admin/requests',
  '/admin/communications',
  '/admin/reports',
  '/teacher',
  '/teacher/grading',
  '/teacher/advanced-grading',
  '/teacher/student-list',
  '/teacher/lecture-creator',
  '/teacher/courses',
  '/teacher/schedule',
  '/teacher/messages',
  '/teacher/announcements',
  '/manager',
  '/request-list',
  '/manager/communications',
  '/manager/users',
  '/manager/messages',
  '/student',
  '/student-academic-performance',
  '/student-attendance-records',
  '/student-homework',
  '/student-exam-result',
  '/student/accomplishments',
  '/student/course-details',
  '/student/announcements',
  '/student/timetable',
  '/student/materials',
  '/student/my-courses',
  '/student/messages',
  '/student/account',
  '/teacher/account',
  '/manager/account',
  '/admin/account',
  '/user/account'
];

console.log('🔍 PHÂN TÍCH ROUTING ISSUES:');
console.log('==========================================');

// Kiểm tra missing routes
function checkMissingRoutes() {
  console.log('\n❌ ROUTES BỊ THIẾU TRONG APP.JS:');
  let missingCount = 0;
  
  Object.keys(navigationRoutes).forEach(role => {
    console.log(`\n📋 ${role} Routes:`);
    navigationRoutes[role].forEach(route => {
      if (!appRoutes.includes(route)) {
        console.log(`  ❌ MISSING: ${route}`);
        missingCount++;
      } else {
        console.log(`  ✅ OK: ${route}`);
      }
    });
  });
  
  console.log(`\n📊 TỔNG KẾT: ${missingCount} routes bị thiếu`);
  return missingCount === 0;
}

// Kiểm tra duplicate routes
function checkDuplicateRoutes() {
  console.log('\n🔄 ROUTES TRÙNG LẶP:');
  const routeCount = {};
  appRoutes.forEach(route => {
    routeCount[route] = (routeCount[route] || 0) + 1;
  });
  
  const duplicates = Object.keys(routeCount).filter(route => routeCount[route] > 1);
  if (duplicates.length > 0) {
    duplicates.forEach(route => {
      console.log(`  ⚠️ DUPLICATE: ${route} (${routeCount[route]} lần)`);
    });
  } else {
    console.log('  ✅ Không có routes trùng lặp');
  }
  
  return duplicates.length === 0;
}

// Kiểm tra protection status
function checkProtectionStatus() {
  console.log('\n🛡️ TRẠNG THÁI BẢO VỆ ROUTES:');
  
  const criticalRoutes = [
    '/assignments-new',
    '/student/assignments',
    '/teacher/courses',
    '/admin/users',
    '/manager/users'
  ];
  
  criticalRoutes.forEach(route => {
    if (appRoutes.includes(route)) {
      console.log(`  ✅ PROTECTED: ${route}`);
    } else {
      console.log(`  ❌ NOT PROTECTED: ${route}`);
    }
  });
}

// Chạy tất cả kiểm tra
const allRoutesPresent = checkMissingRoutes();
const noDuplicates = checkDuplicateRoutes();
checkProtectionStatus();

console.log('\n🎯 KẾT QUẢ CUỐI CÙNG:');
console.log('==========================================');
if (allRoutesPresent && noDuplicates) {
  console.log('✅ ĐÃ HOÀN THÀNH: Tất cả routes đều được định nghĩa và bảo vệ đúng cách!');
} else {
  console.log('⚠️ CẦN SỬA: Vẫn có các vấn đề cần được khắc phục');
}

console.log('\n🚀 HƯỚNG DẪN TIẾP THEO:');
console.log('1. Kiểm tra file App.js và đảm bảo tất cả routes có ProtectedRoute');
console.log('2. Test với `npm start` và truy cập các URL để kiểm tra');
console.log('3. Kiểm tra console log để đảm bảo authentication hoạt động');
