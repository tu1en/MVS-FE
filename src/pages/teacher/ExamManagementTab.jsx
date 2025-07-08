import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import examService from '../../services/examService';
import CreateExamModal from './CreateExamModal';

const ExamManagementTab = () => {
    const [exams, setExams] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { courseId } = useParams(); // Assuming courseId is available from URL

    useEffect(() => {
        const fetchExams = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await examService.getExamsByClassroom(courseId);
                setExams(response.data);
            } catch (err) {
                setError('Failed to fetch exams. Please try again.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        if (courseId) {
            fetchExams();
        }
    }, [courseId]);

    const handleExamCreated = (newExam) => {
        setExams(prevExams => [...prevExams, newExam]);
    };

    if (isLoading) return <div>Loading exams...</div>;
    if (error) return <div className="text-red-500">{error}</div>;

    return (
        <div className="p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Exam Management</h2>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Create New Exam
                </button>
            </div>
            <div className="mt-4">
                {exams.length === 0 ? (
                    <p>No exams have been created for this course yet.</p>
                ) : (
                    <ul>
                        {exams.map(exam => (
                            <li key={exam.id} className="border p-2 my-2 rounded">
                                {exam.title}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {isModalOpen && (
                <CreateExamModal
                    courseId={courseId}
                    onClose={() => setIsModalOpen(false)}
                    onExamCreated={handleExamCreated}
                />
            )}
        </div>
    );
};

export default ExamManagementTab; 