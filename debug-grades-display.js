// Debug script to test grade display logic
console.log('🔍 Testing Grade Display Logic...\n');

// Mock grade data that should show as graded
const mockGrades = [
  {
    id: 1,
    assignmentTitle: "Test Assignment 1",
    score: 95,
    isGraded: true,
    feedback: "Great work!"
  },
  {
    id: 2,
    assignmentTitle: "Test Assignment 2", 
    score: 0,
    isGraded: true,
    feedback: "Needs improvement"
  },
  {
    id: 3,
    assignmentTitle: "Test Assignment 3",
    score: null,
    isGraded: false,
    feedback: null
  },
  {
    id: 4,
    assignmentTitle: "Test Assignment 4",
    score: 75,
    isGraded: false, // Even if isGraded is false, should show as graded because score exists
    feedback: "Good effort"
  }
];

console.log('📊 Testing Grade Display Logic:\n');

mockGrades.forEach((grade, index) => {
  console.log(`Grade ${index + 1}: ${grade.assignmentTitle}`);
  console.log(`  Score: ${grade.score}`);
  console.log(`  isGraded: ${grade.isGraded}`);
  
  // Test the UI logic
  const shouldShowScore = grade.score !== null && grade.score !== undefined;
  const displayText = shouldShowScore ? `${grade.score}/10` : 'Chưa chấm';
  
  console.log(`  UI Display: ${displayText}`);
  console.log(`  Should show score: ${shouldShowScore}`);
  console.log('');
});

// Test statistics calculation
console.log('📈 Testing Statistics Calculation:\n');

const validGrades = mockGrades.filter(grade => grade.score !== null && grade.score !== undefined);
console.log(`Valid grades count: ${validGrades.length}`);

if (validGrades.length > 0) {
  const total = validGrades.reduce((sum, grade) => sum + grade.score, 0);
  const average = Math.round((total / validGrades.length) * 100) / 100;
  const passed = validGrades.filter(grade => grade.score >= 5).length;
  
  console.log(`Total score: ${total}`);
  console.log(`Average: ${average}`);
  console.log(`Passed count: ${passed}`);
  console.log(`Statistics: ${passed}/${validGrades.length} bài đạt, điểm TB: ${average}/10`);
} else {
  console.log('No valid grades found');
}

console.log('\n✅ Debug complete!');
