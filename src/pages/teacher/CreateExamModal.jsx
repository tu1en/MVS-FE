import React, { useState } from 'react';
import examService from '../../services/examService';

const CreateExamModal = ({ courseId, onClose, onExamCreated }) => {
    const [title, setTitle] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [durationInMinutes, setDurationInMinutes] = useState(60);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const examData = {
            title,
            classroomId: courseId,
            startTime: new Date(startTime).toISOString(),
            endTime: new Date(endTime).toISOString(),
            durationInMinutes: parseInt(durationInMinutes, 10),
        };

        try {
            const response = await examService.createExam(examData);
            onExamCreated(response.data);
            onClose();
        } catch (err) {
            setError('Failed to create exam. Please check the details and try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
            <div className="relative mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Create New Exam</h3>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                        <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">Start Time</label>
                        <input type="datetime-local" id="startTime" value={startTime} onChange={(e) => setStartTime(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">End Time</label>
                        <input type="datetime-local" id="endTime" value={endTime} onChange={(e) => setEndTime(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (minutes)</label>
                        <input type="number" id="duration" value={durationInMinutes} onChange={(e) => setDurationInMinutes(e.target.value)} required min="1" className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="items-center gap-2 mt-3 sm:flex">
                        <button type="button" onClick={onClose} className="w-full mt-2 p-2.5 flex-1 text-gray-800 bg-gray-100 rounded-md outline-none border hover:bg-gray-200">
                            Cancel
                        </button>
                        <button type="submit" disabled={isLoading} className="w-full mt-2 p-2.5 flex-1 text-white bg-indigo-600 rounded-md outline-none hover:bg-indigo-700 disabled:bg-indigo-300">
                            {isLoading ? 'Creating...' : 'Create Exam'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateExamModal; 