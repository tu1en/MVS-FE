import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Select, DatePicker, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';
import { notificationService } from '../../services/notificationService';

const { TextArea } = Input;

function AssignHomework() {
  const [form] = Form.useForm();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);

  // Fetch classes when component mounts
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const response = await axios.get('/api/teacher/classes', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        setClasses(response.data);
      } catch (error) {
        message.error('Không thể tải danh sách lớp học');
      }
    };
    fetchClasses();
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('title', values.title);
      formData.append('description', values.description);
      formData.append('classId', values.classId);
      formData.append('dueDate', dayjs(values.dueDate).toISOString());
      formData.append('maxScore', values.maxScore || 10);
      
      // Append files if any
      fileList.forEach(file => {
        formData.append('files', file.originFileObj);
      });

      // Gửi bài tập
      await axios.post('/api/assignments', formData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Tạo thông báo cho học sinh
      const selectedClass = classes.find(c => c.id === values.classId);
      await notificationService.createNotification({
        title: `Bài tập mới: ${values.title}`,
        content: `Lớp ${selectedClass?.name}: ${values.description}
Hạn nộp: ${dayjs(values.dueDate).format('DD/MM/YYYY HH:mm')}`,
        targetAudience: 'students'
      });

      message.success('Đã giao bài tập và gửi thông báo thành công!');
      form.resetFields();
      setFileList([]);
    } catch (error) {
      message.error('Không thể giao bài tập. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: file => {
      setFileList([...fileList, file]);
      return false;
    },
    fileList,
    onRemove: file => {
      const index = fileList.indexOf(file);
      const newFileList = fileList.slice();
      newFileList.splice(index, 1);
      setFileList(newFileList);
    }
  };

  return (
    <Card title="Giao Bài Tập Mới" className="shadow-md">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="max-w-3xl mx-auto"
      >
        <Form.Item
          name="classId"
          label="Chọn Lớp"
          rules={[{ required: true, message: 'Vui lòng chọn lớp!' }]}
        >
          <Select placeholder="Chọn lớp học">
            {classes.map(cls => (
              <Select.Option key={cls.id} value={cls.id}>
                {cls.name}
              </Select.Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="title"
          label="Tiêu Đề"
          rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài tập!' }]}
        >
          <Input placeholder="Nhập tiêu đề bài tập" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô Tả Chi Tiết"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả bài tập!' }]}
        >
          <TextArea
            rows={6}
            placeholder="Nhập hướng dẫn và yêu cầu chi tiết cho bài tập"
          />
        </Form.Item>

        <Form.Item
          name="dueDate"
          label="Thời Hạn Nộp"
          rules={[{ required: true, message: 'Vui lòng chọn thời hạn nộp!' }]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            placeholder="Chọn thời hạn nộp bài"
            className="w-full"
          />
        </Form.Item>

        <Form.Item
          name="maxScore"
          label="Điểm Tối Đa"
          initialValue={10}
        >
          <Input type="number" min={0} max={10} />
        </Form.Item>

        <Form.Item
          label="Tệp Đính Kèm"
          name="attachments"
        >
          <Upload {...uploadProps} multiple>
            <Button icon={<UploadOutlined />}>Chọn tệp đính kèm</Button>
          </Upload>
        </Form.Item>

        <Form.Item className="text-right">
          <Button type="primary" htmlType="submit" loading={loading}>
            Giao Bài Tập
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
}

export default AssignHomework; 