import { Form, Input, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import classroomService from '../../services/classroomService';

const EditClassroomModal = ({ visible, onCancel, onOk, classroom }) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (classroom) {
            form.setFieldsValue({
                name: classroom.name,
                description: classroom.description,
            });
        }
    }, [classroom, form]);

    const handleOk = () => {
        form.validateFields().then(values => {
            setLoading(true);
            classroomService.updateClassroom(classroom.id, values)
                .then(response => {
                    setLoading(false);
                    onOk(response.data); 
                    message.success('Cập nhật lớp học thành công!');
                })
                .catch(error => {
                    setLoading(false);
                    const errorMsg = error.response?.data?.message || 'Cập nhật thất bại!';
                    message.error(errorMsg);
                });
        });
    };

    return (
        <Modal
            title="Chỉnh sửa thông tin lớp học"
            open={visible}
            onCancel={onCancel}
            onOk={handleOk}
            confirmLoading={loading}
        >
            <Form form={form} layout="vertical" name="editClassroomForm">
                <Form.Item name="name" label="Tên lớp học" rules={[{ required: true, message: 'Vui lòng nhập tên lớp!' }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea rows={4} />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default EditClassroomModal; 