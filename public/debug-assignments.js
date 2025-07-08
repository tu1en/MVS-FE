// Debug helper for assignments
window.debugAssignments = function() {
    console.log('=== ASSIGNMENTS DEBUG ===');
    console.log('Token:', localStorage.getItem('token'));
    console.log('User from localStorage:', localStorage.getItem('user'));
    
    // Test API call
    fetch('http://localhost:8088/api/assignments/current-teacher', {
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('API Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('API Response data:', data);
        if (Array.isArray(data) && data.length > 0) {
            console.log('First assignment:', data[0]);
            console.log('Date fields:', {
                dueDate: data[0].dueDate,
                dueDateType: typeof data[0].dueDate,
                isArray: Array.isArray(data[0].dueDate),
                createdAt: data[0].createdAt,
                updatedAt: data[0].updatedAt
            });
            
            // Test date parsing
            if (data[0].dueDate) {
                let testDate;
                if (Array.isArray(data[0].dueDate)) {
                    const [year, month, day, hour, minute, second] = data[0].dueDate;
                    testDate = new Date(year, month - 1, day, hour, minute, second);
                } else {
                    testDate = new Date(data[0].dueDate);
                }
                console.log('Parsed date:', testDate);
                console.log('Is valid date:', !isNaN(testDate.getTime()));
            }
        }
    })
    .catch(error => {
        console.error('API Error:', error);
    });
};

console.log('Debug helper loaded. Use window.debugAssignments() in console.');

window.testLogin = function(email = 'testteacher@test.com', password = 'password123') {
    console.log('Testing login with:', email);
    
    fetch('http://localhost:8088/api/auth/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
    })
    .then(response => {
        console.log('Login status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Login response:', data);
        if (data.token) {
            localStorage.setItem('token', data.token);
            console.log('Token saved. Now test assignments API...');
            window.debugAssignments();
        }
    })
    .catch(error => {
        console.error('Login error:', error);
    });
};

console.log('Additional helpers:');
console.log('- window.testLogin(email, password) - Test login');
