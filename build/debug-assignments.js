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
            localStorage.setItem('role', data.role);
            localStorage.setItem('userId', data.userId);
            console.log('Token saved. Now test assignments API...');
            window.debugAssignments();
        }
    })
    .catch(error => {
        console.error('Login error:', error);
    });
};

// Enhanced debug function to test JWT token validation
window.debugJWT = function() {
    console.log('=== JWT DEBUG ===');
    const token = localStorage.getItem('token');
    console.log('Token from localStorage:', token);

    if (!token) {
        console.error('No token found in localStorage');
        return;
    }

    // Decode JWT payload (without verification)
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('JWT Payload:', payload);
        console.log('Subject (should be email):', payload.sub);
        console.log('Role ID:', payload.role);
        console.log('Expiration:', new Date(payload.exp * 1000));
        console.log('Is expired?', Date.now() > payload.exp * 1000);
    } catch (e) {
        console.error('Error decoding JWT:', e);
    }

    // Test token validation endpoint
    fetch('http://localhost:8088/api/auth/validate', {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        console.log('Token validation status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('Token validation response:', data);
    })
    .catch(error => {
        console.error('Token validation error:', error);
    });
};

console.log('Additional helpers:');
console.log('- window.testLogin(email, password) - Test login');
console.log('- window.debugJWT() - Debug JWT token');

// Test specific teacher endpoints
window.testTeacherEndpoints = function() {
    console.log('=== TESTING TEACHER ENDPOINTS ===');
    const token = localStorage.getItem('token');

    if (!token) {
        console.error('No token found. Please login first with window.testLogin()');
        return;
    }

    const endpoints = [
        '/api/teacher/dashboard-stats',
        '/api/assignments/current-teacher',
        '/api/classrooms/current-teacher'
    ];

    endpoints.forEach(endpoint => {
        console.log(`Testing ${endpoint}...`);
        fetch(`http://localhost:8088${endpoint}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            console.log(`${endpoint} - Status: ${response.status}`);
            if (response.status === 403) {
                console.error(`${endpoint} - 403 FORBIDDEN`);
            }
            return response.json();
        })
        .then(data => {
            console.log(`${endpoint} - Response:`, data);
        })
        .catch(error => {
            console.error(`${endpoint} - Error:`, error);
        });
    });
};

console.log('- window.testTeacherEndpoints() - Test all teacher endpoints');

// Test with different teacher accounts
window.testAllTeachers = function() {
    console.log('=== TESTING ALL TEACHER ACCOUNTS ===');

    const teacherAccounts = [
        { email: 'teacher@test.com', password: 'teacher123', name: 'Main Teacher' },
        { email: 'math@test.com', password: 'teacher123', name: 'Math Teacher' },
        { email: 'literature@test.com', password: 'teacher123', name: 'Literature Teacher' },
        { email: 'english@test.com', password: 'teacher123', name: 'English Teacher' }
    ];

    teacherAccounts.forEach((account, index) => {
        setTimeout(() => {
            console.log(`\n--- Testing ${account.name} (${account.email}) ---`);

            // Login
            fetch('http://localhost:8088/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: account.email,
                    password: account.password
                })
            })
            .then(response => {
                console.log(`${account.name} login status:`, response.status);
                return response.json();
            })
            .then(data => {
                console.log(`${account.name} login response:`, data);

                if (data.token) {
                    // Test teacher endpoints with this token
                    const endpoints = [
                        '/api/teacher/dashboard-stats',
                        '/api/assignments/current-teacher',
                        '/api/classrooms/current-teacher'
                    ];

                    endpoints.forEach(endpoint => {
                        fetch(`http://localhost:8088${endpoint}`, {
                            headers: {
                                'Authorization': `Bearer ${data.token}`,
                                'Content-Type': 'application/json'
                            }
                        })
                        .then(response => {
                            console.log(`${account.name} - ${endpoint}: ${response.status}`);
                            if (response.status === 403) {
                                console.error(`❌ ${account.name} - ${endpoint}: 403 FORBIDDEN`);
                            } else if (response.status === 200) {
                                console.log(`✅ ${account.name} - ${endpoint}: SUCCESS`);
                            }
                            return response.json();
                        })
                        .then(endpointData => {
                            console.log(`${account.name} - ${endpoint} data:`, endpointData);
                        })
                        .catch(error => {
                            console.error(`${account.name} - ${endpoint} error:`, error);
                        });
                    });
                }
            })
            .catch(error => {
                console.error(`${account.name} login error:`, error);
            });
        }, index * 2000); // Stagger requests by 2 seconds
    });
};

console.log('- window.testAllTeachers() - Test all teacher accounts');
