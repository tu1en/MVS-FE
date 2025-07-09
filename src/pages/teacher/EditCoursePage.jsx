import React from 'react';
import { useParams } from 'react-router-dom';

const EditCoursePage = () => {
    const { courseId } = useParams();

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold">Chỉnh sửa khóa học</h1>
            <p className="mt-4">
                Bạn đang chỉnh sửa khóa học với ID: <strong>{courseId}</strong>
            </p>
            <p className="mt-2 text-gray-600">
                (Giao diện chỉnh sửa chi tiết sẽ được xây dựng ở đây.)
            </p>
        </div>
    );
};

export default EditCoursePage; 