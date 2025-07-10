// Debug script for course details loading issue
// Copy and paste this into browser console after logging in

console.log('🔧 Course Details Debug Script Started');

// Check authentication
const checkAuth = () => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');
    const token = localStorage.getItem('token');
    
    console.log('👤 Authentication Status:');
    console.log('   User ID:', userId);
    console.log('   User Role:', userRole);
    console.log('   Token:', token ? 'Present' : 'Missing');
    
    return { userId, userRole, token };
};

// Get course ID from URL
const getCourseId = () => {
    const path = window.location.pathname;
    const match = path.match(/\/student\/courses\/(\d+)/);
    return match ? match[1] : null;
};

// Test course details API
const testCourseDetailsAPI = async () => {
    const { token } = checkAuth();
    const courseId = getCourseId();
    
    if (!courseId) {
        console.error('❌ No course ID found in URL');
        return;
    }
    
    if (!token) {
        console.error('❌ No authentication token found. Please login first.');
        return;
    }
    
    const baseURL = 'http://localhost:8088/api';
    const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
    
    const endpoint = `/classrooms/${courseId}/details`;
    
    console.log(`\n🧪 Testing Course Details API:`);
    console.log(`   Course ID: ${courseId}`);
    console.log(`   URL: ${baseURL}${endpoint}`);
    
    try {
        const response = await fetch(`${baseURL}${endpoint}`, { headers });
        console.log(`   Status: ${response.status} ${response.statusText}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log(`   ✅ Success:`, data);
            
            // Analyze data structure
            console.log('\n🔍 Data Structure Analysis:');
            console.log(`   - ID: ${data.id}`);
            console.log(`   - Name: ${data.name}`);
            console.log(`   - Description: ${data.description}`);
            console.log(`   - Teacher:`, data.teacher);
            console.log(`   - Students: ${data.students ? `Array of ${data.students.length}` : 'null'}`);
            console.log(`   - Subject: ${data.subject}`);
            console.log(`   - Section: ${data.section}`);
            
            return data;
        } else {
            const errorText = await response.text();
            console.log(`   ❌ Error Response:`, errorText);
            return null;
        }
    } catch (error) {
        console.log(`   💥 Network Error:`, error.message);
        return null;
    }
};

// Check DOM elements
const checkDOM = () => {
    console.log('\n🎯 DOM Elements Check:');
    
    const spinners = document.querySelectorAll('.ant-spin');
    console.log(`   Spinners found: ${spinners.length}`);
    
    const courseTitle = document.querySelector('h2');
    console.log(`   Course title element: ${courseTitle ? courseTitle.textContent : 'Not found'}`);
    
    const errorMessages = document.querySelectorAll('.ant-alert-error');
    console.log(`   Error messages: ${errorMessages.length}`);
    
    const loadingText = Array.from(document.querySelectorAll('*')).find(el => 
        el.textContent && el.textContent.includes('Đang tải')
    );
    console.log(`   Loading text: ${loadingText ? 'Found' : 'Not found'}`);
    
    if (spinners.length > 0) {
        console.log('⚠️  Loading spinner is still visible - indicates loading issue');
    }
    
    if (errorMessages.length > 0) {
        errorMessages.forEach((error, index) => {
            console.log(`   Error ${index + 1}:`, error.textContent);
        });
    }
};

// Check React component state (if available)
const checkReactState = () => {
    console.log('\n⚛️  React Component State Check:');
    
    // Try to find React component instance
    const reactRoot = document.querySelector('#root');
    if (reactRoot && reactRoot._reactInternalInstance) {
        console.log('   React instance found');
    } else {
        console.log('   React instance not accessible');
    }
    
    // Check for any React error boundaries
    const errorBoundaries = document.querySelectorAll('[data-reactroot] *').length;
    console.log(`   React elements count: ${errorBoundaries}`);
};

// Main debug function
const debugCourseDetails = async () => {
    console.log('🚀 Starting Course Details Debug...\n');
    
    checkAuth();
    const courseData = await testCourseDetailsAPI();
    checkDOM();
    checkReactState();
    
    console.log('\n✅ Debug completed. Check the logs above for issues.');
    
    if (courseData) {
        console.log('\n💡 Suggestions:');
        console.log('   - API is working correctly');
        console.log('   - Check if frontend component is handling the data properly');
        console.log('   - Look for JavaScript errors in console');
    } else {
        console.log('\n💡 Suggestions:');
        console.log('   - Check authentication token');
        console.log('   - Verify course ID exists in database');
        console.log('   - Check backend logs for errors');
    }
};

// Auto-run after 2 seconds to allow page to load
setTimeout(() => {
    debugCourseDetails();
}, 2000);

// Also expose function globally for manual testing
window.debugCourseDetails = debugCourseDetails;
