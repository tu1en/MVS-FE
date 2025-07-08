import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import examService from '../../services/examService';
import examSubmissionService from '../../services/examSubmissionService';

const CountdownTimer = ({ expiryTimestamp, onTimeUp }) => {
    const calculateTimeLeft = useCallback(() => {
        const difference = +new Date(expiryTimestamp) - +new Date();
        let timeLeft = {};
        if (difference > 0) {
            timeLeft = {
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft;
    }, [expiryTimestamp]);

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            const newTimeLeft = calculateTimeLeft();
            setTimeLeft(newTimeLeft);
            if (!Object.keys(newTimeLeft).length) {
                onTimeUp();
            }
        }, 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, calculateTimeLeft, onTimeUp]);

    return (
        <div className="text-2xl font-bold text-red-500">
            {timeLeft.hours !== undefined ? `${timeLeft.hours}h ${timeLeft.minutes}m ${timeLeft.seconds}s` : <span>Time's up!</span>}
        </div>
    );
};


const DoExamPage = () => {
    const { courseId, examId } = useParams();
    const navigate = useNavigate();

    const [exam, setExam] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const expiryTimestamp = submission ? new Date(new Date(submission.startedAt).getTime() + exam.durationInMinutes * 60000) : null;

    useEffect(() => {
        const initializeExam = async () => {
            try {
                // First, get exam details to know the duration
                const examDetailsRes = await examService.getExamById(examId);
                setExam(examDetailsRes.data);

                // Then, start the exam to get the submission record and official start time
                const submissionRes = await examSubmissionService.startExam(examId);
                setSubmission(submissionRes.data);

            } catch (err) {
                setError(err.response?.data?.message || 'Failed to start the exam. You may have already started it, or it is not active.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        initializeExam();
    }, [examId]);
    
    const handleSubmit = async (force = false) => {
        if (!submission) return;
        setIsSubmitting(true);
        try {
            await examSubmissionService.submitExam(submission.id, { content });
            alert('Your exam has been submitted successfully!');
            navigate(`/courses/${courseId}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit exam.');
            if (force) {
                 alert("Time's up! Your exam failed to submit automatically. Please check your connection and try again, or contact your instructor.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="p-8">Initializing your exam...</div>;
    if (error) return <div className="p-8 text-red-500">Error: {error} <button onClick={() => navigate(`/courses/${courseId}`)} className="text-blue-500">Go Back</button></div>;

    return (
        <div className="container mx-auto p-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h1 className="text-3xl font-bold">{exam?.title}</h1>
                    {expiryTimestamp && <CountdownTimer expiryTimestamp={expiryTimestamp} onTimeUp={() => handleSubmit(true)} />}
                </div>

                <div className="exam-content">
                    <h2 className="text-xl font-semibold mb-2">Your Answer</h2>
                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-96 p-4 border rounded-md"
                        placeholder="Type your answer here..."
                        disabled={isSubmitting}
                    />
                </div>

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={isSubmitting}
                        className="bg-green-500 text-white font-bold py-2 px-6 rounded hover:bg-green-600 disabled:bg-gray-400"
                    >
                        {isSubmitting ? 'Submitting...' : 'Submit Exam'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DoExamPage; 