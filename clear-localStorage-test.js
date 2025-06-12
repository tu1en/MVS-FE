/**
 * Script để xóa localStorage và test authentication state
 * Chạy script này trong DevTools Console để test
 */

// Xóa toàn bộ localStorage
console.log('🧹 Clearing localStorage...');
localStorage.clear();

// Kiểm tra localStorage đã được xóa
console.log('📦 LocalStorage after clear:', {
  token: localStorage.getItem('token'),
  role: localStorage.getItem('role'),
  userId: localStorage.getItem('userId'),
  email: localStorage.getItem('email')
});

// Reload trang để test
console.log('🔄 Reloading page to test authentication state...');
window.location.reload();
