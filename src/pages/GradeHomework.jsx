import React, { useState } from 'react';
import { Card, Table, Input, Button, Select, Modal, Form, Rate, message } from 'antd';
import { CheckOutlined, CommentOutlined } from '@ant-design/icons';

const { TextArea } = Input;

/**
 * GradeHomework component for teachers to grade student submissions
 * @returns {JSX.Element} GradeHomework component
 */
function GradeHomework() {
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      studentName: 'Nguyễn Văn A',
      assignmentTitle: 'Bài Tập Toán Số 1',
      submissionDate: '2024-03-20',
      status: 'Chưa chấm',
      attachmentUrl: 'baitap1.pdf',
      score: null,
      feedback: ''
    },
    {
      id: 2,
      studentName: 'Trần Thị B',
      assignmentTitle: 'Bài Tập Toán Số 1',
      submissionDate: '2024-03-19',
      status: 'Đã chấm',
      attachmentUrl: 'baitap2.pdf',
      score: 8.5,
      feedback: 'Bài làm tốt, cần cải thiện phần giải thích'
    },
    {
      id: 3,
      studentName: 'Lê Văn C',
      assignmentTitle: 'Bài Tập Toán Số 1',
      submissionDate: '2024-03-21',
      status: 'Chưa chấm',
      attachmentUrl: 'baitap3.pdf',
      score: null,
      feedback: ''
    },
  ]);

  const [isGradingModalVisible, setIsGradingModalVisible] = useState(false);
  const [currentSubmission, setCurrentSubmission] = useState(null);
  const [form] = Form.useForm();

  const handleGrade = (submission) => {
    setCurrentSubmission(submission);
    form.setFieldsValue({
      score: submission.score,
      feedback: submission.feedback
    });
    setIsGradingModalVisible(true);
  };

  const handleGradeSubmit = () => {
    form.validateFields().then(values => {
      const updatedSubmissions = submissions.map(sub => {
        if (sub.id === currentSubmission.id) {
          return {
            ...sub,
            score: values.score,
            feedback: values.feedback,
            status: 'Đã chấm'
          };
        }
        return sub;
      });
      setSubmissions(updatedSubmissions);
      setIsGradingModalVisible(false);
      message.success('Đã chấm điểm thành công!');
    });
  };

  const columns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
    },
    {
      title: 'Bài tập',
      dataIndex: 'assignmentTitle',
      key: 'assignmentTitle',
    },
    {
      title: 'Ngày nộp',
      dataIndex: 'submissionDate',
      key: 'submissionDate',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <span className={status === 'Đã chấm' ? 'text-green-600' : 'text-yellow-600'}>
          {status}
        </span>
      ),
    },
    {
      title: 'Điểm',
      dataIndex: 'score',
      key: 'score',
      render: (score) => score ? score : '-',
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button 
          type="primary"
          icon={record.status === 'Đã chấm' ? <CommentOutlined /> : <CheckOutlined />}
          onClick={() => handleGrade(record)}
        >
          {record.status === 'Đã chấm' ? 'Sửa đánh giá' : 'Chấm điểm'}
        </Button>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card title="Chấm điểm bài tập" className="shadow-md">
        <div className="mb-4 flex justify-between items-center">
          <Select
            defaultValue="all"
            style={{ width: 200 }}
            options={[
              { value: 'all', label: 'Tất cả bài tập' },
              { value: 'pending', label: 'Chưa chấm' },
              { value: 'graded', label: 'Đã chấm' },
            ]}
          />
          <span className="text-gray-600">
            Tổng số bài nộp: {submissions.length} | 
            Chưa chấm: {submissions.filter(s => s.status === 'Chưa chấm').length}
          </span>
        </div>

        <Table 
          columns={columns} 
          dataSource={submissions}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={`Chấm điểm - ${currentSubmission?.studentName}`}
        open={isGradingModalVisible}
        onOk={handleGradeSubmit}
        onCancel={() => setIsGradingModalVisible(false)}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          className="mt-4"
        >
          <Form.Item
            name="score"
            label="Điểm số"
            rules={[{ required: true, message: 'Vui lòng nhập điểm' }]}
          >
            <Rate 
              count={10}
              allowHalf
            />
          </Form.Item>

          <Form.Item
            name="feedback"
            label="Nhận xét"
          >
            <TextArea rows={4} placeholder="Nhập nhận xét cho học sinh..." />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default GradeHomework; 