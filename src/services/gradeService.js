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
      console.log('📊 [GradeService] Fetching student assignments and submissions...');
      
      // Import SubmissionService to use the same logic as StudentAssignments
      const SubmissionService = (await import('./submissionService')).default;
      const AssignmentService = (await import('./assignmentService')).default;
      
      // Get student's assignments first - use the same method as StudentAssignments
      const assignments = await AssignmentService.getCurrentStudentAssignments();
      console.log('📚 [GradeService] Found assignments:', assignments.length);

      if (assignments.length === 0) {
        console.info('📚 [GradeService] No assignments found for current student');
        return [];
      }

      // Get current user ID from localStorage or auth context
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user?.id) {
        console.log('👤 [GradeService] No user info found in localStorage');
        return [];
      }

      console.log('👤 [GradeService] Current user:', user.id);

      // For each assignment, try to get the submission using SubmissionService
      const gradePromises = assignments.map(async (assignment) => {
        try {
          console.log(`📝 [GradeService] Checking submission for assignment ${assignment.id}`);
          
          // Use the same method as StudentAssignments
          const submission = await SubmissionService.getStudentSubmission(assignment.id, user.id);
          
          if (submission) {
            console.log(`✅ [GradeService] Found submission for assignment ${assignment.id}:`, {
              score: submission.score,
              isGraded: submission.isGraded
            });

            // Check if submission is graded - either isGraded is true OR score is not null/undefined
            const hasScore = submission.score !== null && submission.score !== undefined;
            const isActuallyGraded = submission.isGraded === true || hasScore;

            console.log(`🔍 [GradeService] Assignment ${assignment.id} grading status:`, {
              isGraded: submission.isGraded,
              score: submission.score,
              hasScore,
              isActuallyGraded
            });

            // Normalize score to 10-point scale for Vietnamese grading system
            const maxPoints = assignment.points || 100;
            const rawScore = submission.score || 0;
            const normalizedScore = maxPoints > 0 ? Math.round((rawScore / maxPoints) * 10 * 100) / 100 : 0;

            console.log(`📊 [GradeService] Score normalization for assignment ${assignment.id}:`, {
              rawScore,
              maxPoints,
              normalizedScore,
              calculation: `(${rawScore} / ${maxPoints}) * 10 = ${normalizedScore}`
            });

            return {
              id: assignment.id,
              type: 'assignment',
              title: assignment.title,
              assignmentTitle: assignment.title, // Add this for UI compatibility
              description: assignment.description,
              classroomId: assignment.classroomId,
              classroomName: assignment.classroomName,
              subject: assignment.classroomName || 'Chưa xác định',
              maxPoints: assignment.points || 0,
              earnedPoints: submission.score || 0,
              score: normalizedScore, // Normalized to 10-point scale
              rawScore: submission.score, // Keep original score for reference
              isGraded: isActuallyGraded,
              submittedAt: submission.submittedAt,
              gradedAt: submission.gradedAt,
              feedback: submission.feedback,
              dueDate: assignment.dueDate,
              createdAt: assignment.createdAt
            };
          } else {
            console.log(`❌ [GradeService] No submission found for assignment ${assignment.id}`);
            return {
              id: assignment.id,
              type: 'assignment',
              title: assignment.title,
              assignmentTitle: assignment.title, // Add this for UI compatibility
              description: assignment.description,
              classroomId: assignment.classroomId,
              classroomName: assignment.classroomName,
              subject: assignment.classroomName || 'Chưa xác định',
              maxPoints: assignment.points || 0,
              earnedPoints: 0,
              score: null, // Add this field for UI compatibility
              isGraded: false,
              submittedAt: null,
              gradedAt: null,
              feedback: null,
              dueDate: assignment.dueDate,
              createdAt: assignment.createdAt
            };
          }
        } catch (error) {
          console.log(`❌ [GradeService] Error getting submission for assignment ${assignment.id}:`, error);
          return {
            id: assignment.id,
            type: 'assignment',
            title: assignment.title,
            assignmentTitle: assignment.title, // Add this for UI compatibility
            description: assignment.description,
            classroomId: assignment.classroomId,
            classroomName: assignment.classroomName,
            subject: assignment.classroomName || 'Chưa xác định',
            maxPoints: assignment.points || 0,
            earnedPoints: 0,
            score: null, // Add this field for UI compatibility
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

      console.log('📊 [GradeService] All grades processed:', validGrades.length);

      // Filter by classroomId if provided
      if (classroomId) {
        const filteredGrades = validGrades.filter(grade => grade.classroomId === parseInt(classroomId));
        console.log(`🔍 [GradeService] Filtered by classroom ${classroomId}:`, filteredGrades.length);
        return filteredGrades;
      }

      return validGrades;
      
    } catch (error) {
      console.error('❌ [GradeService] Error fetching my grades:', error);

      // Provide more specific error information
      if (error.response?.status === 401) {
        console.error('🔐 [GradeService] Authentication required - user may need to log in again');
      } else if (error.response?.status === 403) {
        console.error('🚫 [GradeService] Access denied - user may not have student permissions');
      } else if (error.response?.status === 404) {
        console.error('🔍 [GradeService] Assignments endpoint not found - check API configuration');
      } else if (error.response?.status === 500) {
        console.error('🔥 [GradeService] Server error - check backend logs for details');
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
