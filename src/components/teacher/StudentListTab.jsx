import { Button, Modal, Table, message } from 'antd';
import React, { useEffect, useState } from 'react';
import ClassroomService from '../../services/classroomService';

const StudentListTab = ({ classroomId }) => {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStudents = () => {
        if (!classroomId) return;
        setLoading(true);
        ClassroomService.getStudentsInClassroom(classroomId)
            .then(res => {
                setStudents(res.data);
            })
            .catch(() => {
                message.error('Không thể tải danh sách sinh viên!');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchStudents();
    }, [classroomId]);

    const handleRemove = (studentId) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc muốn xóa sinh viên này khỏi lớp?',
            onOk: () => {
                return ClassroomService.removeStudent(classroomId, studentId)
                    .then(() => {
                        message.success('Xóa sinh viên thành công!');
                        fetchStudents(); // Refresh the list
                    })
                    .catch((err) => {
                        console.error("Remove student error:", err);
                        message.error('Xóa sinh viên thất bại!');
                    });
            }
        });
    };

    const columns = [
        { title: 'Tên sinh viên', dataIndex: 'name', key: 'name' },
        { title: 'Email', dataIndex: 'email', key: 'email' },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Button danger onClick={() => handleRemove(record.id)}>
                    Xóa khỏi lớp
                </Button>
            ),
        },
    ];

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Danh sách học viên</h3>
                {/* Enroll button could be passed as a prop or handled here */}
            </div>
            <Table
                columns={columns}
                dataSource={students}
                rowKey="id"
                loading={loading}
                pagination={{ pageSize: 10 }}
            />
        </div>
    );
};

export default StudentListTab; 