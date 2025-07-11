import axiosInstance from '../config/axiosInstance';

// Use the configured axios instance instead of creating a new one
const apiClient = axiosInstance;

class GradeService {
  /**
   * Get all grades for current student across all classrooms
   * This combines assignment submissions and exam results
   * @param {string|number} classroomId - Optional classroom ID to filter results
   * @returns {Promise<Array>} List of grade records
   */
  static async getMyGrades(classroomId = null) {
    try {
      // Get student's assignments first - use the correct endpoint for current authenticated student
      const assignmentResponse = await apiClient.get('/assignments/student/me');
      const assignments = Array.isArray(assignmentResponse.data?.data) ? assignmentResponse.data.data :
                         Array.isArray(assignmentResponse.data) ? assignmentResponse.data : [];

      if (assignments.length === 0) {
        console.info('No assignments found for current student');
        return [];
      }

      // Get current user ID from assignments or submissions
      const userResponse = await apiClient.get('/classrooms/student/me');
      const userInfo = userResponse.data?.[0]; // Get user info from first classroom
      
      if (!userInfo) {
        return [];
      }

      // For each assignment, try to get the submission and grade
      const gradePromises = assignments.map(async (assignment) => {
        try {
          // Try to get submission for this assignment - need to extract student ID
          // Since we don't have direct student ID, we'll use a different approach
          const submissionResponse = await apiClient.get(`/submissions/assignment/${assignment.id}`);
          const submissions = Array.isArray(submissionResponse.data) ? submissionResponse.data : [];
          
          // Find current user's submission (this is a limitation - we need student ID)
          // For now, we'll return assignment info and mark if there's any submission
          return {
            id: assignment.id,
            type: 'assignment',
            title: assignment.title,
            description: assignment.description,
            classroomId: assignment.classroomId,
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
            classroomId: assignment.classroomId,
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
      const validGrades = grades.filter(grade => grade !== null);

      // Filter by classroomId if provided
      if (classroomId) {
        return validGrades.filter(grade => grade.classroomId === parseInt(classroomId));
      }

      return validGrades;
      
    } catch (error) {
      console.error('Error fetching my grades:', error);

      // Provide more specific error information
      if (error.response?.status === 401) {
        console.error('Authentication required - user may need to log in again');
      } else if (error.response?.status === 403) {
        console.error('Access denied - user may not have student permissions');
      } else if (error.response?.status === 404) {
        console.error('Assignments endpoint not found - check API configuration');
      } else if (error.response?.status === 500) {
        console.error('Server error - check backend logs for details');
      }

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
