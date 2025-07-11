// Test script để debug messages loading issue
// Chạy script này trong browser console khi đã login

console.log('🧪 Testing Messages Loading...');

// Test 1: Check if user is logged in
const userId = localStorage.getItem('userId');
const userRole = localStorage.getItem('userRole');
console.log('👤 User ID:', userId);
console.log('🎭 User Role:', userRole);

if (!userId) {
    console.error('❌ User not logged in!');
} else {
    console.log('✅ User is logged in');
    
    // Test 2: Test API endpoints
    const testEndpoints = async () => {
        const baseURL = 'http://localhost:8088/api';
        const token = localStorage.getItem('token');
        
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
        
        console.log('🔑 Token:', token ? 'Present' : 'Missing');
        
        const endpoints = [
            `/student-messages/student/${userId}`,
            `/users/teachers`,
            `/classrooms/student/${userId}`
        ];
        
        for (const endpoint of endpoints) {
            try {
                console.log(`📡 Testing: ${endpoint}`);
                const response = await fetch(`${baseURL}${endpoint}`, { headers });
                console.log(`   Status: ${response.status}`);
                
                if (response.ok) {
                    const data = await response.json();
                    console.log(`   ✅ Success:`, data);
                } else {
                    const errorText = await response.text();
                    console.log(`   ❌ Error:`, errorText);
                }
            } catch (error) {
                console.log(`   💥 Exception:`, error.message);
            }
        }
    };
    
    testEndpoints();
}

// Test 3: Check if MessagingPage component is mounted
setTimeout(() => {
    const messagingElements = document.querySelectorAll('[data-testid="messaging-page"], .ant-spin');
    console.log('🎯 Messaging elements found:', messagingElements.length);
    
    const spinners = document.querySelectorAll('.ant-spin');
    console.log('⏳ Spinners found:', spinners.length);
    
    if (spinners.length > 0) {
        console.log('🔄 Loading spinner is still visible - this indicates the loading issue');
    }
}, 2000);
