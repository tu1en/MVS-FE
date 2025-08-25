// Debug script to test redirect logic
console.log('=== Testing Redirect Logic ===');

// Simulate localStorage values
const testCases = [
  { role: 'ROLE_MANAGER', expected: 'MANAGER' },
  { role: 'MANAGER', expected: 'MANAGER' },
  { role: null, expected: null },
  { role: undefined, expected: null },
  { role: '', expected: null }
];

testCases.forEach((testCase, index) => {
  console.log(`\nTest Case ${index + 1}:`);
  console.log(`Input role: ${testCase.role}`);
  
  // Test the normalization logic from ManagerDashboard
  const normalizedRole = testCase.role?.replace('ROLE_', '');
  console.log(`Normalized role: ${normalizedRole}`);
  console.log(`Expected: ${testCase.expected}`);
  console.log(`Match: ${normalizedRole === testCase.expected}`);
});

console.log('\n=== End Test ===');
