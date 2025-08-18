import axiosInstance from '../config/axiosInstance';
import ProfileDataService from './profileDataService';
import SubmissionService from './submissionService';

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
      // 1) Lấy danh sách bài tập được giao cho học sinh hiện tại
      const assignmentResponse = await apiClient.get('/assignments/student/me');
      const assignments = Array.isArray(assignmentResponse.data?.data)
        ? assignmentResponse.data.data
        : Array.isArray(assignmentResponse.data)
          ? assignmentResponse.data
          : [];

      if (assignments.length === 0) {
        console.info('No assignments found for current student');
        return [];
      }

      // 2) Lấy thông tin học sinh hiện tại để lấy studentId
      const profileResult = await ProfileDataService.fetchProfileWithFallback('student');
      const studentId = profileResult?.data?.id
        || profileResult?.data?.studentId
        || localStorage.getItem('userId')
        || localStorage.getItem('studentId');

      if (!studentId) {
        console.warn('Cannot resolve current studentId. Returning assignments without grades.');
      }

      // 3) Lấy toàn bộ submissions của học sinh (tránh 403 ở endpoint của giáo viên)
      const submissions = studentId
        ? await SubmissionService.getStudentSubmissions(studentId)
        : [];
      const submissionByAssignmentId = new Map();
      submissions.forEach(sub => {
        const aId = sub.assignmentId || sub.assignment?.id;
        if (aId != null && !submissionByAssignmentId.has(aId)) {
          submissionByAssignmentId.set(aId, sub);
        }
      });

      // 4) Hợp nhất assignments với submissions → map đúng các trường StudentGradesAttendance cần
      const validGrades = assignments.map((assignment) => {
        const sub = submissionByAssignmentId.get(assignment.id);
        const score = sub?.score != null ? sub.score : null;
        const feedback = sub?.feedback || sub?.teacherFeedback || null;
        const isGraded = sub ? (sub.graded === true || sub.score != null) : false;

        return {
          id: assignment.id,
          type: 'assignment',
          assignmentTitle: assignment.title,
          score: score,
          feedback: feedback,
          classroomId: assignment.classroomId
            ?? assignment.classroom?.id
            ?? assignment.courseId
            ?? assignment.classroomID,
          classroomName: assignment.classroomName
            ?? assignment.classroom?.name
            ?? assignment.classroom?.className
            ?? assignment.courseName,
          subject: assignment.subject
            ?? assignment.classroom?.subject
            ?? assignment.subjectName,
          maxPoints: assignment.points || 0,
          isGraded: isGraded,
          submittedAt: sub?.submittedAt || sub?.createdAt || null,
          gradedAt: sub?.gradedAt || sub?.updatedAt || null,
          dueDate: assignment.dueDate,
          createdAt: assignment.createdAt
        };
      });

      // Filter by classroomId if provided (coerce to number safely)
      if (classroomId) {
        const cid = Number(classroomId);
        return validGrades.filter(grade => Number(grade.classroomId) === cid);
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
