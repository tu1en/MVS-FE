// Debug script for messages loading issue
// Copy and paste this into browser console after logging in

// console.log('🔧 Messages Debug Script Started');

// Check authentication
const checkAuth = () => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    // console.log('👤 Authentication Status:');
    // console.log('   User ID:', userId);
    // console.log('   User Role:', userRole);
    // console.log('   Token:', token ? 'Present' : 'Missing');
    
    return { userId, userRole, token };
};

// Test API endpoints
const testAPIs = async () => {
    const { userId, token } = checkAuth();
    
    if (!userId) {
        console.error('❌ No user ID found. Please login first.');
        return;
    }
    
    const baseURL = 'http://localhost:8088/api';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
    
    const endpoints = [
        { name: 'Student Messages', url: `/student-messages/student/${userId}` },
        { name: 'Teachers List', url: '/users/teachers' },
        { name: 'Student Classrooms', url: `/classrooms/student/${userId}` }
    ];
    
    // console.log('🧪 Testing API Endpoints:');
    
    for (const endpoint of endpoints) {
        try {
            // console.log(`\n📡 Testing ${endpoint.name}...`);
            // console.log(`   URL: ${baseURL}${endpoint.url}`);
            
            const response = await fetch(`${baseURL}${endpoint.url}`, { headers });
            // console.log(`   Status: ${response.status} ${response.statusText}`);
            
            if (response.ok) {
                const data = await response.json();
                // console.log(`   ✅ Success:`, data);
                // console.log(`   📊 Data type: ${Array.isArray(data) ? 'Array' : typeof data}`);
                if (Array.isArray(data)) {
                    // console.log(`   📊 Array length: ${data.length}`);
                }
            } else {
                const errorText = await response.text();
                // console.log(`   ❌ Error Response:`, errorText);
            }
        } catch (error) {
            // console.log(`   💥 Network Error:`, error.message);
        }
    }
};

// Check DOM elements
const checkDOM = () => {
    // console.log('\n🎯 DOM Elements Check:');
    
    const spinners = document.querySelectorAll('.ant-spin');
    // console.log(`   Spinners found: ${spinners.length}`);
    
    const messagingPage = document.querySelector('[data-testid="messaging-page"]');
    // console.log(`   Messaging page element: ${messagingPage ? 'Found' : 'Not found'}`);
    
    const loadingText = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes('Đang tải')
    );
    // console.log(`   Loading text: ${loadingText ? 'Found' : 'Not found'}`);
    
    if (spinners.length > 0) {
        // console.log('⚠️  Loading spinner is still visible - indicates loading issue');
    }
};

// Main debug function
const debugMessages = async () => {
    // console.log('🚀 Starting Messages Debug...\n');
    
    checkAuth();
    await testAPIs();
    checkDOM();
    
    // console.log('\n✅ Debug completed. Check the logs above for issues.');
};

// Auto-run after 2 seconds to allow page to load
setTimeout(() => {
    debugMessages();
}, 2000);

// Also expose function globally for manual testing
window.debugMessages = debugMessages;
