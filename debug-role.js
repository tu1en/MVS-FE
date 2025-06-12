// Script to debug role detection issues
// Run this in browser console to check authentication state

console.log('🔍 ROLE DETECTION DEBUG SCRIPT');
console.log('================================');

// Check localStorage values
console.log('📱 LocalStorage Values:');
console.log('- token:', localStorage.getItem('token'));
console.log('- role:', localStorage.getItem('role'));
console.log('- userId:', localStorage.getItem('userId'));
console.log('- username:', localStorage.getItem('username'));

// Check Redux state if available
if (window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__) {
  console.log('🔄 Redux state available - check Redux DevTools');
}

// Check current URL
console.log('🌐 Current URL:', window.location.href);

// Test role mapping
const role = localStorage.getItem('role');
const roleMapping = {
  '0': 'ADMIN',
  '1': 'STUDENT', 
  '2': 'TEACHER',
  '3': 'MANAGER',
  'ADMIN': '0',
  'STUDENT': '1',
  'TEACHER': '2', 
  'MANAGER': '3'
};

console.log('🎭 Role Analysis:');
console.log('- Raw role:', role);
console.log('- Role type:', typeof role);
console.log('- Is null/undefined:', role === null || role === undefined);
console.log('- Is empty string:', role === '');
console.log('- Mapped role:', roleMapping[role]);

// Check if user should be on this page
const currentPath = window.location.pathname;
console.log('📍 Route Analysis:');
console.log('- Current path:', currentPath);

if (currentPath.includes('/assignments')) {
  if (role === '1' || role === 'STUDENT') {
    console.log('✅ Student on assignments page - CORRECT');
  } else if (role === '2' || role === 'TEACHER') {
    console.log('✅ Teacher on assignments page - CORRECT');
  } else {
    console.log('⚠️ Unexpected role on assignments page');
  }
}

// Recommendations
console.log('💡 Recommendations:');
if (!role) {
  console.log('❌ No role detected - User should log in again');
  console.log('🔧 Fix: Redirect to /login');
} else if (!localStorage.getItem('token')) {
  console.log('❌ No token detected - Authentication expired');
  console.log('🔧 Fix: Redirect to /login');
} else if (!localStorage.getItem('userId')) {
  console.log('❌ No userId detected - Incomplete authentication');
  console.log('🔧 Fix: Redirect to /login');
} else {
  console.log('✅ Authentication data looks complete');
}

console.log('================================');
console.log('📋 Copy this output and share if you need help debugging');
