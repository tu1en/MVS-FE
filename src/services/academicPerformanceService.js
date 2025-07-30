
const academicPerformanceService = {
  /**
   * Get student academic performance data
   * @returns {Promise<Object>} Academic performance data
   */
  getAcademicPerformance: async () => {
    try {
      console.log('🎓 [AcademicPerformance] Fetching student assignments and submissions...');
      
      // Import services to use the same logic as StudentAssignments
      const SubmissionService = (await import('./submissionService')).default;
      const AssignmentService = (await import('./assignmentService')).default;
      
      // Get current student's assignments using the same method as StudentAssignments
      const assignments = await AssignmentService.getCurrentStudentAssignments();
      console.log('📚 [AcademicPerformance] Found assignments:', assignments.length);

      if (assignments.length === 0) {
        console.log('📚 [AcademicPerformance] No assignments found, returning empty data');
        return {
          subjects: [],
          averageScore: 0
        };
      }

      // Get current user ID from localStorage
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      
      if (!user?.id) {
        console.log('👤 [AcademicPerformance] No user info found in localStorage');
        return {
          subjects: [],
          averageScore: 0
        };
      }

      console.log('👤 [AcademicPerformance] Current user:', user.id);

      // For each assignment, try to get the submission using SubmissionService
      const gradePromises = assignments.map(async (assignment) => {
        try {
          console.log(`📝 [AcademicPerformance] Checking submission for assignment ${assignment.id}`);
          
          // Use the same method as StudentAssignments
          const submission = await SubmissionService.getStudentSubmission(assignment.id, user.id);
          
          if (submission) {
            console.log(`✅ [AcademicPerformance] Found submission for assignment ${assignment.id}:`, {
              score: submission.score,
              isGraded: submission.isGraded
            });

            // Check if submission is graded - either isGraded is true OR score is not null/undefined
            const hasScore = submission.score !== null && submission.score !== undefined;
            const isActuallyGraded = submission.isGraded === true || hasScore;

            console.log(`🔍 [AcademicPerformance] Assignment ${assignment.id} grading status:`, {
              isGraded: submission.isGraded,
              score: submission.score,
              hasScore,
              isActuallyGraded
            });

            return {
              id: assignment.id,
              subject: assignment.classroomName || 'Chưa xác định',
              score: submission.score || 0,
              maxScore: assignment.points || 10,
              isGraded: isActuallyGraded,
              assignmentTitle: assignment.title
            };
          } else {
            console.log(`❌ [AcademicPerformance] No submission found for assignment ${assignment.id}`);
            return {
              id: assignment.id,
              subject: assignment.classroomName || 'Chưa xác định',
              score: 0,
              maxScore: assignment.points || 10,
              isGraded: false,
              assignmentTitle: assignment.title
            };
          }
        } catch (error) {
          console.log(`❌ [AcademicPerformance] Error getting submission for assignment ${assignment.id}:`, error);
          return {
            id: assignment.id,
            subject: assignment.classroomName || 'Chưa xác định',
            score: 0,
            maxScore: assignment.points || 10,
            isGraded: false,
            assignmentTitle: assignment.title
          };
        }
      });

      const grades = await Promise.all(gradePromises);
      console.log('📊 [AcademicPerformance] All grades processed:', grades.length);

      // Group by subject and calculate averages
      const subjectMap = {};
      grades.forEach(grade => {
        if (!subjectMap[grade.subject]) {
          subjectMap[grade.subject] = {
            subject: grade.subject,
            scores: [],
            totalScore: 0,
            totalMaxScore: 0,
            gradedCount: 0
          };
        }
        
        // Check if assignment has a valid score (either isGraded is true OR score exists)
        const hasValidScore = grade.isGraded || (grade.score !== null && grade.score !== undefined);
        
        if (hasValidScore) {
          subjectMap[grade.subject].scores.push(grade.score);
          subjectMap[grade.subject].totalScore += grade.score;
          subjectMap[grade.subject].totalMaxScore += grade.maxScore;
          subjectMap[grade.subject].gradedCount++;
          
          console.log(`📊 [AcademicPerformance] Added score for ${grade.subject}:`, {
            assignmentTitle: grade.assignmentTitle,
            score: grade.score,
            maxScore: grade.maxScore,
            isGraded: grade.isGraded
          });
        }
      });

      // Convert to subjects array with calculated scores
      const subjects = Object.values(subjectMap).map(subjectData => {
        const averageScore = subjectData.gradedCount > 0 
          ? (subjectData.totalScore / subjectData.gradedCount) 
          : 0;
        
        let rank = 'Trung bình';
        if (averageScore >= 8.5) rank = 'Giỏi';
        else if (averageScore >= 6.5) rank = 'Khá';

        return {
          subject: subjectData.subject,
          score: Math.round(averageScore * 100) / 100, // Round to 2 decimal places
          rank: rank
        };
      });

      // Calculate overall average
      const totalGradedScores = subjects.reduce((sum, subject) => sum + subject.score, 0);
      const averageScore = subjects.length > 0 ? totalGradedScores / subjects.length : 0;

      console.log('🎯 [AcademicPerformance] Final result:', {
        subjects: subjects.length,
        averageScore: Math.round(averageScore * 100) / 100
      });

      return {
        subjects: subjects,
        averageScore: Math.round(averageScore * 100) / 100
      };
      
    } catch (error) {
      console.error('❌ [AcademicPerformance] Error fetching academic performance:', error);
      
      // Provide more specific error information
      if (error.response?.status === 401) {
        console.error('🔐 [AcademicPerformance] Authentication required - user may need to log in again');
      } else if (error.response?.status === 403) {
        console.error('🚫 [AcademicPerformance] Access denied - user may not have student permissions');
      } else if (error.response?.status === 404) {
        console.error('🔍 [AcademicPerformance] Assignments endpoint not found - check API configuration');
      } else if (error.response?.status === 500) {
        console.error('🔥 [AcademicPerformance] Server error - check backend logs for details');
      }

      return {
        subjects: [],
        averageScore: 0
      };
    }
  }
};

export default academicPerformanceService;
