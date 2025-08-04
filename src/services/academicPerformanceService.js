
const academicPerformanceService = {
  /**
   * Get student academic performance data
   * @returns {Promise<Object>} Academic performance data
   */
  getAcademicPerformance: async () => {
    try {
      console.log('🎓 [AcademicPerformance] Fetching student assignments and submissions...');

      // Import services
      const SubmissionService = (await import('./submissionService')).default;
      const AssignmentService = (await import('./assignmentService')).default;

      const assignments = await AssignmentService.getCurrentStudentAssignments();
      console.log('📚 [AcademicPerformance] Found assignments:', assignments.length);

      if (assignments.length === 0) {
        return { subjects: [], averageScore: 0 };
      }

      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;

      if (!user?.id) {
        return { subjects: [], averageScore: 0 };
      }

      const gradePromises = assignments.map(async (assignment) => {
        try {
          const submission = await SubmissionService.getStudentSubmission(assignment.id, user.id);

          const hasScore = submission?.score !== null && submission?.score !== undefined;
          const isActuallyGraded = submission?.isGraded === true || hasScore;

          return {
            id: assignment.id,
            subject: assignment.classroomName || 'Chưa xác định',
            score: hasScore ? submission.score : 0,
            maxScore: assignment.points || 10,
            isGraded: isActuallyGraded,
            assignmentTitle: assignment.title
          };
        } catch {
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

        const hasValidScore = grade.isGraded || (grade.score !== null && grade.score !== undefined);

        if (hasValidScore) {
          subjectMap[grade.subject].scores.push(grade.score);
          subjectMap[grade.subject].totalScore += grade.score;
          subjectMap[grade.subject].totalMaxScore += grade.maxScore;
          subjectMap[grade.subject].gradedCount++;
        }
      });

      const subjects = Object.values(subjectMap).map(subjectData => {
        const averageScore = subjectData.gradedCount > 0
          ? (subjectData.totalScore / subjectData.gradedCount)
          : 0;

        let rank = 'Trung bình';
        if (averageScore >= 8.5) rank = 'Giỏi';
        else if (averageScore >= 6.5) rank = 'Khá';

        return {
          subject: subjectData.subject,
          score: Math.round(averageScore * 100) / 100,
          rank
        };
      });

      const totalGradedScores = subjects.reduce((sum, subject) => sum + subject.score, 0);
      const averageScore = subjects.length > 0 ? totalGradedScores / subjects.length : 0;

      return {
        subjects,
        averageScore: Math.round(averageScore * 100) / 100
      };
    } catch (error) {
      console.error('❌ [AcademicPerformance] Error fetching academic performance:', error);

      if (error.response?.status === 401) {
        console.error('🔐 Authentication required');
      } else if (error.response?.status === 403) {
        console.error('🚫 Access denied');
      } else if (error.response?.status === 404) {
        console.error('🔍 Endpoint not found');
      } else if (error.response?.status === 500) {
        console.error('🔥 Server error');
      }

      return { subjects: [], averageScore: 0 };
    }
  }
};

export default academicPerformanceService;
