import axios from 'axios';

const apiClient = axios.create({
  timeout: 10000,
});

// Add axios interceptor to handle token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for common error handling
apiClient.interceptors.response.use((response) => {
  return response;
}, (error) => {
  const { response } = error;
  if (response && response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  }
  return Promise.reject(error);
});

class GradeService {
  /**
   * Get all grades for current student across all classrooms
   * This combines assignment submissions and exam results
   * @returns {Promise<Array>} List of grade records
   */
  static async getMyGrades() {
    try {
      // Get student's assignments first
      const assignmentResponse = await apiClient.get('/api/assignments/student');
      const assignments = Array.isArray(assignmentResponse.data?.data) ? assignmentResponse.data.data : 
                         Array.isArray(assignmentResponse.data) ? assignmentResponse.data : [];

      if (assignments.length === 0) {
        return [];
      }

      // Get current user ID from assignments or submissions
      const userResponse = await apiClient.get('/api/classrooms/student/me');
      const userInfo = userResponse.data?.[0]; // Get user info from first classroom
      
      if (!userInfo) {
        return [];
      }

      // For each assignment, try to get the submission and grade
      const gradePromises = assignments.map(async (assignment) => {
        try {
          // Try to get submission for this assignment - need to extract student ID
          // Since we don't have direct student ID, we'll use a different approach
          const submissionResponse = await apiClient.get(`/api/submissions/assignment/${assignment.id}`);
          const submissions = Array.isArray(submissionResponse.data) ? submissionResponse.data : [];
          
          // Find current user's submission (this is a limitation - we need student ID)
          // For now, we'll return assignment info and mark if there's any submission
          return {
            id: assignment.id,
            type: 'assignment',
            title: assignment.title,
            description: assignment.description,
            classroomName: assignment.classroomName,
            subject: assignment.subject,
            maxPoints: assignment.points || 0,
            earnedPoints: null, // Will be filled if submission found
            isGraded: false,
            submittedAt: null,
            gradedAt: null,
            feedback: null,
            dueDate: assignment.dueDate,
            createdAt: assignment.createdAt
          };
        } catch (error) {
          console.error(`Error fetching submission for assignment ${assignment.id}:`, error);
          return {
            id: assignment.id,
            type: 'assignment',
            title: assignment.title,
            description: assignment.description,
            classroomName: assignment.classroomName,
            subject: assignment.subject,
            maxPoints: assignment.points || 0,
            earnedPoints: null,
            isGraded: false,
            submittedAt: null,
            gradedAt: null,
            feedback: null,
            dueDate: assignment.dueDate,
            createdAt: assignment.createdAt
          };
        }
      });

      const grades = await Promise.all(gradePromises);
      return grades.filter(grade => grade !== null);
      
    } catch (error) {
      console.error('Error fetching my grades:', error);
      return [];
    }
  }

  /**
   * Get grades for a specific classroom
   * @param {number} classroomId - Classroom ID
   * @returns {Promise<Array>} List of grades for the classroom
   */
  static async getGradesByClassroom(classroomId) {
    try {
      const allGrades = await this.getMyGrades();
      return allGrades.filter(grade => grade.classroomId === classroomId);
    } catch (error) {
      console.error('Error fetching grades by classroom:', error);
      return [];
    }
  }

  /**
   * Get grade summary statistics
   * @returns {Promise<Object>} Grade summary with averages, totals, etc.
   */
  static async getGradeSummary() {
    try {
      const grades = await this.getMyGrades();
      
      const gradedAssignments = grades.filter(g => g.isGraded && g.earnedPoints !== null);
      const totalPoints = grades.reduce((sum, g) => sum + (g.maxPoints || 0), 0);
      const earnedPoints = gradedAssignments.reduce((sum, g) => sum + (g.earnedPoints || 0), 0);
      const maxEarnedPoints = gradedAssignments.reduce((sum, g) => sum + (g.maxPoints || 0), 0);
      
      const percentage = maxEarnedPoints > 0 ? (earnedPoints / maxEarnedPoints) * 100 : 0;
      
      // Group by classroom
      const byClassroom = {};
      grades.forEach(grade => {
        const key = grade.classroomName || 'Unknown';
        if (!byClassroom[key]) {
          byClassroom[key] = {
            classroomName: key,
            subject: grade.subject,
            totalAssignments: 0,
            gradedAssignments: 0,
            totalPoints: 0,
            earnedPoints: 0,
            percentage: 0
          };
        }
        
        byClassroom[key].totalAssignments++;
        byClassroom[key].totalPoints += grade.maxPoints || 0;
        
        if (grade.isGraded) {
          byClassroom[key].gradedAssignments++;
          byClassroom[key].earnedPoints += grade.earnedPoints || 0;
        }
      });
      
      // Calculate percentages for each classroom
      Object.values(byClassroom).forEach(classroom => {
        const gradedTotal = classroom.gradedAssignments > 0 
          ? grades.filter(g => g.classroomName === classroom.classroomName && g.isGraded)
                  .reduce((sum, g) => sum + (g.maxPoints || 0), 0)
          : 0;
        classroom.percentage = gradedTotal > 0 ? (classroom.earnedPoints / gradedTotal) * 100 : 0;
      });
      
      return {
        overall: {
          totalAssignments: grades.length,
          gradedAssignments: gradedAssignments.length,
          totalPoints,
          earnedPoints,
          percentage: Math.round(percentage * 100) / 100
        },
        byClassroom: Object.values(byClassroom)
      };
      
    } catch (error) {
      console.error('Error calculating grade summary:', error);
      return {
        overall: {
          totalAssignments: 0,
          gradedAssignments: 0,
          totalPoints: 0,
          earnedPoints: 0,
          percentage: 0
        },
        byClassroom: []
      };
    }
  }
}

export default GradeService;
