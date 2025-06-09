import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Input, Modal, Form, message, Tag, Space, Spin } from 'antd';
import { EyeOutlined, FileTextOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import axios from 'axios';
import { validators, handleFormErrors } from '../../utils/formValidation';

const { TextArea } = Input;

function GradeHomework() {
  // State for classes
  const [classes, setClasses] = useState([
    {
      id: 1,
      name: 'Toán 12A1',
      subject: 'Toán',
      grade: '12',
      totalSubmissions: 15,
      pendingSubmissions: 5
    },
    {
      id: 2,
      name: 'Vật lý 12A2',
      subject: 'Vật lý',
      grade: '12',
      totalSubmissions: 12,
      pendingSubmissions: 3
    },
    {
      id: 3,
      name: 'Hóa 11A1',
      subject: 'Hóa học',
      grade: '11',
      totalSubmissions: 18,
      pendingSubmissions: 7
    }
  ]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [submissions, setSubmissions] = useState([
    {
      id: 1,
      studentName: 'Nguyễn Văn A',
      studentId: '2024001',
      assignmentTitle: 'Bài tập Toán học:lớp 12',
      submissionDate: '2024-03-15T10:30:00',
      attachmentUrls: ['https://example.com/homework1.pdf'],
      status: 'SUBMITTED',
      score: null,
      feedback: '',
      className: 'Toán 12A1'
    },
    {
      id: 2,
      studentName: 'Trần Thị B',
      studentId: '2024002',
      assignmentTitle: 'Bài tập Toán học: lớp 12',
      submissionDate: '2024-03-15T09:45:00',
      attachmentUrls: ['https://example.com/homework2.pdf', 'https://example.com/attachment2.jpg'],
      status: 'SUBMITTED',
      score: null,
      feedback: '',
      className: 'Toán 12A1'
    },
    {
      id: 3,
      studentName: 'Lê Văn C',
      studentId: '2024003',
      assignmentTitle: 'Bài tập Vật lý: Điện từ học',
      submissionDate: '2024-03-14T15:20:00',
      attachmentUrls: ['https://example.com/physics1.pdf'],
      status: 'GRADED',
      score: 8.5,
      feedback: 'Bài làm tốt, cần cải thiện phần giải thích',
      className: 'Vật lý 12A2'
    },
    {
      id: 4,
      studentName: 'Phạm Thị D',
      studentId: '2024004',
      assignmentTitle: 'Bài tập Vật lý: Điện từ học',
      submissionDate: '2024-03-14T16:00:00',
      attachmentUrls: [],
      status: 'SUBMITTED',
      score: null,
      feedback: '',
      className: 'Vật lý 12A2'
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [gradeModalVisible, setGradeModalVisible] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/classrooms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setClasses(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách lớp học');
    } finally {
      setLoading(false);
    }
  };

  const handleClassSelect = (classInfo) => {
    setSelectedClass(classInfo);
    fetchSubmissions(classInfo.id);
  };

  const handleBackToClasses = () => {
    setSelectedClass(null);
    setSubmissions([]);
  };

  const fetchSubmissions = async (classId) => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/classrooms/${classId}/submissions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setSubmissions(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách bài nộp');
    } finally {
      setLoading(false);
    }
  };

  const handleGrade = (submission) => {
    setSelectedSubmission(submission);
    form.setFieldsValue({
      score: submission.score,
      feedback: submission.feedback
    });
    setGradeModalVisible(true);
  };

  const handleGradeSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Validate score format
      const score = parseFloat(values.score);
      if (isNaN(score) || score < 0 || score > 10) {
        throw new Error('Điểm không hợp lệ');
      }
      // Kiểm tra số thập phân
      if (values.score.includes('.')) {
        const decimals = values.score.split('.')[1];
        if (decimals.length > 2) {
          throw new Error('Điểm chỉ được có tối đa 2 chữ số thập phân');
        }
      }

      // Call API to update grade
      await axios.put(`/api/submissions/${selectedSubmission.id}`, {
        score: score,
        feedback: values.feedback.trim()
      });

      // Update local state
      const updatedSubmissions = submissions.map(sub => 
        sub.id === selectedSubmission.id 
          ? {
              ...sub,
              score: score,
              feedback: values.feedback.trim(),
              status: 'GRADED'
            }
          : sub
      );
      
      setSubmissions(updatedSubmissions);
      message.success('Đã chấm điểm thành công!');
      setGradeModalVisible(false);
      
    } catch (error) {
      if (error.response) {
        handleFormErrors(error, form, message);
      } else {
        message.error(error.message || 'Không thể chấm điểm. Vui lòng thử lại!');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">MSSV: {record.studentId}</div>
          <div className="text-sm text-gray-500">{record.className}</div>
        </div>
      ),
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
      render: (date) => new Date(date).toLocaleString('vi-VN'),
    },
    {
      title: 'Tệp đính kèm',
      dataIndex: 'attachmentUrls',
      key: 'attachmentUrls',
      render: (urls) => (
        <Space>
          {urls?.map((url, index) => (
            <Button
              key={index}
              icon={<FileTextOutlined />}
              size="small"
              onClick={() => window.open(url, '_blank')}
            >
              Tệp {index + 1}
            </Button>
          ))}
          {(!urls || urls.length === 0) && <span>Không có tệp đính kèm</span>}
        </Space>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <div>
          <Tag color={status === 'GRADED' ? 'green' : 'gold'}>
            {status === 'GRADED' ? 'Đã chấm' : 'Chưa chấm'}
          </Tag>
          {status === 'GRADED' && (
            <div className="mt-1 text-sm">
              Điểm: <span className="font-medium">{record.score}</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          icon={<EyeOutlined />}
          onClick={() => handleGrade(record)}
          type={record.status === 'SUBMITTED' ? 'primary' : 'default'}
        >
          {record.status === 'SUBMITTED' ? 'Chấm điểm' : 'Xem/Sửa điểm'}
        </Button>
      ),
    },
  ];

  const classColumns = [
    {
      title: 'Tên lớp',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Khối',
      dataIndex: 'grade',
      key: 'grade',
    },
    {
      title: 'Tổng số bài nộp',
      dataIndex: 'totalSubmissions',
      key: 'totalSubmissions',
    },
    {
      title: 'Bài chưa chấm',
      dataIndex: 'pendingSubmissions',
      key: 'pendingSubmissions',
      render: (text) => (
        <Tag color={text > 0 ? 'gold' : 'green'}>
          {text}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => handleClassSelect(record)}
        >
          Xem bài nộp
        </Button>
      ),
    },
  ];

  return (
    <>
      {!selectedClass ? (
        <Card 
          title="Danh sách lớp học" 
          className="shadow-md"
        >
          <Table
            columns={classColumns}
            dataSource={classes}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} lớp`
            }}
          />
        </Card>
      ) : (
        <Card 
          title={
            <Space>
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBackToClasses}
                type="link"
              />
              Chấm điểm bài tập - {selectedClass.name}
            </Space>
          }
          className="shadow-md"
          extra={
            <div className="text-gray-600">
              Tổng số bài nộp: {submissions.length} | 
              Chưa chấm: {submissions.filter(s => s.status === 'SUBMITTED').length}
            </div>
          }
        >
          <Table
            columns={columns}
            dataSource={submissions}
            loading={loading}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài nộp`
            }}
          />
        </Card>
      )}

      <Modal
        title={`Chấm điểm - ${selectedSubmission?.studentName}`}
        open={gradeModalVisible}
        onCancel={() => setGradeModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleGradeSubmit}
        >
          <div className="mb-4">
            <div className="text-gray-600 mb-2">Thông tin bài nộp:</div>
            <div>Lớp: {selectedSubmission?.className}</div>
            <div>Bài tập: {selectedSubmission?.assignmentTitle}</div>
            <div>Ngày nộp: {selectedSubmission?.submissionDate && new Date(selectedSubmission.submissionDate).toLocaleString('vi-VN')}</div>
          </div>

          <Form.Item
            name="score"
            label="Điểm số"
            rules={[{ validator: validators.validateScore }]}
            validateTrigger={['onChange', 'onBlur']}
            help="Điểm phải là số từ 0-10, chấp nhận số thập phân (ví dụ: 7.25, 8.5, 9.75)"
          >
            <Input 
              type="number" 
              min={0} 
              max={10} 
              step={0.01}
              onKeyPress={(e) => {
                const chars = ['0','1','2','3','4','5','6','7','8','9','.'];
                if (!chars.includes(e.key)) {
                  e.preventDefault();
                }
                // Chỉ cho phép 1 dấu chấm
                if (e.key === '.' && e.target.value.includes('.')) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                let value = e.target.value;
                // Nếu có hơn 2 chữ số thập phân, cắt bắt
                if (value.includes('.')) {
                  const [integer, decimal] = value.split('.');
                  if (decimal.length > 2) {
                    value = `${integer}.${decimal.slice(0, 2)}`;
                    e.target.value = value;
                  }
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="feedback"
            label="Nhận xét"
            rules={[{ validator: validators.validateFeedback }]}
            validateTrigger={['onChange', 'onBlur']}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập nhận xét về bài làm (tối thiểu 10 ký tự)..."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item className="text-right mb-0">
            <Button type="default" onClick={() => setGradeModalVisible(false)} className="mr-2">
              Hủy
            </Button>
            <Button type="primary" htmlType="submit">
              Lưu điểm
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

export default GradeHomework; 