// Clear localStorage and force fresh login
console.log('Current localStorage:');
console.log('userId:', localStorage.getItem('userId'));
console.log('role:', localStorage.getItem('role'));
console.log('token:', localStorage.getItem('token'));

// Clear all auth data
localStorage.removeItem('userId');
localStorage.removeItem('role');
localStorage.removeItem('token');
localStorage.removeItem('username');

console.log('localStorage cleared. Please refresh and login again.');

// Reload page to force re-login
window.location.reload();
