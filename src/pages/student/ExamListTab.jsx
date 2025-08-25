import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Badge } from '../../components/ui/badge';
import examService from '../../services/examService';

const ExamListTab = () => {
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const { courseId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchExams = async () => {
            setIsLoading(true);
            try {
                console.log('Fetching exams for courseId:', courseId);
                console.log('API URL will be:', `/api/classrooms/${courseId}/exams`);
                const response = await examService.getExamsByClassroom(courseId);
                console.log('Exam response:', response);
                setExams(response.data);
            } catch (err) {
                setError('Failed to fetch exams.');
                console.error('Exam fetch error:', err);
                console.error('Error response:', err.response);
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchExams();
        }
    }, [courseId]);

    const getExamStatus = (startTime, endTime) => {
        const now = new Date();
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (now < start) return { text: "Upcoming", color: "bg-yellow-500" };
        if (now >= start && now <= end) return { text: "Ongoing", color: "bg-green-500" };
        return { text: "Finished", color: "bg-red-500" };
    };
    
    const handleStartExam = (examId) => {
        // Navigate to the DoExamPage, which will handle the logic of starting the exam
        navigate(`/courses/${courseId}/exams/${examId}/do`);
    };

    if (isLoading) return <div>Loading...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <h2 className="text-xl font-bold mb-4">Exams</h2>
            <div className="space-y-4">
                {exams.length > 0 ? (
                    exams.map(exam => {
                        const status = getExamStatus(exam.startTime, exam.endTime);
                        return (
                            <div key={exam.id} className="border p-4 rounded-lg shadow-sm flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold">{exam.title}</h3>
                                    <p className="text-sm text-gray-500">Duration: {exam.durationInMinutes} minutes</p>
                                    <p className="text-sm text-gray-500">Starts: {new Date(exam.startTime).toLocaleString()}</p>
                                    <p className="text-sm text-gray-500">Ends: {new Date(exam.endTime).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center space-x-4">
                                     <Badge className={`${status.color} text-white`}>{status.text}</Badge>
                                    {status.text === 'Ongoing' && (
                                        <button 
                                            onClick={() => handleStartExam(exam.id)}
                                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                                            Vào bài kiểm tra
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p>Khóa học này tạm thời không có bài kiểm tra.</p>
                )}
            </div>
        </div>
    );
};

export default ExamListTab; 