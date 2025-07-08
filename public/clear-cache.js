// Script to clear specific cache and preserve login information
document.addEventListener('DOMContentLoaded', function() {
  try {
    // Save login information
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('userId');
    const role = localStorage.getItem('role');
    const username = localStorage.getItem('username');
    
    // Clear only API URL cache if on users page
    if (window.location.pathname === '/manager/users') {
      console.log('Detected /manager/users page, clearing specific cache');
      
      // Clear browser cache for API calls
      if (window.caches) {
        caches.keys().then(function(names) {
          for (let name of names) {
            if (name.includes('api/api/v1/users')) {
              caches.delete(name);
              console.log('Deleted cache for:', name);
            }
          }
        });
      }
      
      // Force reload only once
      const hasReloaded = sessionStorage.getItem('usersPageReloaded');
      if (!hasReloaded) {
        sessionStorage.setItem('usersPageReloaded', 'true');
        console.log('Reloading page once to apply changes');
        setTimeout(function() {
          window.location.reload(true);
        }, 500);
      }
    }
  } catch (e) {
    console.error('Error clearing specific cache:', e);
  }
}); 