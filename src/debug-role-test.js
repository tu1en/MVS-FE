// Debug script to test role detection and routing
// Run this in browser console to debug role issues

console.log('=== Role Debug Test ===');

// Check current localStorage
console.log('Current localStorage:');
for (let i = 0; i < localStorage.length; i++) {
  const key = localStorage.key(i);
  console.log(`  ${key}: ${localStorage.getItem(key)}`);
}

// Force set teacher role for testing
console.log('\n=== Setting Teacher Role ===');
localStorage.setItem('role', '2');
localStorage.setItem('roleId', '2'); // Some apps use roleId instead
console.log('Set role to:', localStorage.getItem('role'));

// Test role detection logic
const role = localStorage.getItem('role');
const roleStr = String(role);
console.log('\n=== Role Detection Test ===');
console.log('role:', role);
console.log('typeof role:', typeof role);
console.log('roleStr:', roleStr);
console.log('roleStr === "2":', roleStr === '2');
console.log('roleStr === "1":', roleStr === '1');

// Test routing logic
const rolePath = roleStr === '2' ? 'teacher' : roleStr === '1' ? 'student' : 'announcements';
console.log('\n=== Routing Test ===');
console.log('rolePath:', rolePath);
console.log('Target URL:', `/${rolePath}/announcements`);

// Test API endpoint selection
const endpoint = roleStr === '2' ? '/announcements/teacher/unread-count' : '/announcements/student/unread-count';
console.log('\n=== API Endpoint Test ===');
console.log('API endpoint:', endpoint);

console.log('\n=== Test Complete ===');
console.log('Now refresh the page to see if NotificationBell works correctly');
