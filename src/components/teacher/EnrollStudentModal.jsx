import React, { useEffect, useState } from 'react';
import { accountService } from '../../services/accountService';
import classroomService from '../../services/classroomService';

const EnrollStudentModal = ({ isOpen, onClose, classroomId, existingStudents = [], onEnrolled }) => {
    const [allStudents, setAllStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isEnrolling, setIsEnrolling] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchStudents();
        } else {
            // Reset state when modal closes
            setSearchTerm('');
            setSelectedStudentIds([]);
        }
    }, [isOpen]);

    useEffect(() => {
        const existingStudentIds = new Set(existingStudents.map(s => s.id));
        const studentsToDisplay = allStudents
            .filter(student => !existingStudentIds.has(student.id))
            .filter(student => 
                student.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                student.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        setFilteredStudents(studentsToDisplay);
    }, [searchTerm, allStudents, existingStudents]);

    const fetchStudents = async () => {
        setLoading(true);
        setError(null);
        try {
            const allUsers = await accountService.getAllAccounts();
            const students = allUsers.filter(user => user.role === 'STUDENT');
            setAllStudents(students);
        } catch (err) {
            setError('Không thể tải danh sách sinh viên. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStudentSelect = (studentId) => {
        setSelectedStudentIds(prevSelected =>
            prevSelected.includes(studentId)
                ? prevSelected.filter(id => id !== studentId)
                : [...prevSelected, studentId]
        );
    };

    const handleEnroll = async () => {
        if (selectedStudentIds.length === 0) {
            alert('Vui lòng chọn ít nhất một sinh viên để ghi danh.');
            return;
        }

        setIsEnrolling(true);
        setError(null);
        try {
            const enrollmentRequest = { studentIds: selectedStudentIds };
            await classroomService.enrollStudent(classroomId, enrollmentRequest);
            onEnrolled(); // Trigger refresh in parent
            onClose(); // Close modal on success
        } catch (err) {
            setError('Ghi danh thất bại. Vui lòng thử lại.');
            console.error(err);
        } finally {
            setIsEnrolling(false);
        }
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h2 className="text-2xl font-bold mb-4">Ghi danh học viên</h2>
                
                <input
                    type="text"
                    placeholder="Tìm kiếm sinh viên theo tên hoặc email..."
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />

                {loading && <p>Đang tải danh sách sinh viên...</p>}
                
                {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

                <div className="overflow-y-auto flex-grow border rounded-lg">
                    <table className="min-w-full">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="p-3 text-left w-12">Chọn</th>
                                <th className="p-3 text-left">Tên sinh viên</th>
                                <th className="p-3 text-left">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.length > 0 ? (
                                filteredStudents.map(student => (
                                    <tr key={student.id} className="border-t hover:bg-gray-50">
                                        <td className="p-3 text-center">
                                            <input
                                                type="checkbox"
                                                className="h-5 w-5"
                                                checked={selectedStudentIds.includes(student.id)}
                                                onChange={() => handleStudentSelect(student.id)}
                                            />
                                        </td>
                                        <td className="p-3">{student.full_name}</td>
                                        <td className="p-3">{student.email}</td>
                                    </tr>
                                ))
                            ) : (
                                !loading && (
                                    <tr>
                                        <td colSpan="3" className="text-center p-6 text-gray-500">
                                            Không tìm thấy sinh viên phù hợp.
                                        </td>
                                    </tr>
                                )
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mt-6 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        disabled={isEnrolling}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleEnroll}
                        disabled={isEnrolling || selectedStudentIds.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                    >
                        {isEnrolling ? 'Đang ghi danh...' : `Ghi danh (${selectedStudentIds.length})`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EnrollStudentModal; 