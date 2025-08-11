import { Tag } from 'antd';
import { useEffect, useState } from 'react';
import AssignmentService from '../services/assignmentService';

const AssignmentStatusCell = ({ assignmentId }) => {
  const [submissionCount, setSubmissionCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSubmissionCount = async () => {
      try {
        setLoading(true);
        const submissions = await AssignmentService.getSubmissionsForAssignment(assignmentId);
        // Chỉ đếm những submission thực sự đã nộp (có thời điểm nộp hoặc nội dung/tệp)
        const realSubmissions = Array.isArray(submissions)
          ? submissions.filter((s) => {
              const submittedAt = s.submittedAt || s.submissionDate;
              const hasText = !!(s.submissionText || s.comment);
              const hasFile = !!(s.fileSubmissionUrl || s.attachmentUrl);
              const hasScore = s.score !== undefined && s.score !== null;
              return submittedAt || hasText || hasFile || hasScore;
            })
          : [];
        if (isMounted) {
          setSubmissionCount(realSubmissions.length);
        }
      } catch (error)
      {
        console.error(`Error fetching submissions for assignment ${assignmentId}:`, error);
        if (isMounted) {
          setSubmissionCount(0); // Default to 0 on error
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (assignmentId) {
      fetchSubmissionCount();
    }

    return () => {
      isMounted = false;
    };
  }, [assignmentId]);

  if (loading) {
    return <Tag color="default">Đang tải...</Tag>;
  }

  return (
    <Tag color="blue" className="vietnamese-text">
      {`Đã nộp: ${submissionCount}`}
    </Tag>
  );
};

export default AssignmentStatusCell; 