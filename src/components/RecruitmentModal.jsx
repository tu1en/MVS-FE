import { Modal, Table, Button, message, Tag, Alert, Form, Input, Upload } from 'antd';
import { useState, useEffect } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import axiosInstance from '../config/axiosInstance';

const RecruitmentModal = ({ visible, onCancel }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      fetchJobs();
    }
  }, [visible]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/job-positions/all');
      // Lọc các job có recruitmentPlanStatus === 'OPEN'
      const filtered = (res.data || []).filter(job => 
        job.recruitmentPlanStatus === 'OPEN'
      );
      setJobs(filtered);
    } catch (err) {
      message.error('Không thể tải danh sách vị trí tuyển dụng!');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplyForm(true);
    form.resetFields();
  };

  const handleSubmitApplication = async (values) => {
    try {
      const formData = new FormData();
      formData.append('jobPositionId', selectedJob.id);
      formData.append('fullName', values.fullName);
      formData.append('email', values.email);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('address', values.address);
      
      if (values.cv && values.cv.length > 0) {
        formData.append('cv', values.cv[0].originFileObj);
      }

      await axiosInstance.post('/recruitment-applications/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      message.success('Đã gửi đơn ứng tuyển thành công!');
      setShowApplyForm(false);
      setSelectedJob(null);
      onCancel();
    } catch (err) {
      message.error('Không thể gửi đơn ứng tuyển!');
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const columns = [
    {
      title: 'Vị trí',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Mức lương',
      dataIndex: 'salaryRange',
      key: 'salaryRange',
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Button type="primary" onClick={() => handleApply(record)}>
          Ứng tuyển
        </Button>
      ),
    },
  ];

  if (showApplyForm && selectedJob) {
    return (
      <Modal
        title={`Ứng tuyển - ${selectedJob.title}`}
        open={visible}
        onCancel={() => {
          setShowApplyForm(false);
          setSelectedJob(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitApplication}>
          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            name="cv"
            label="CV/Resume"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[{ required: true, message: 'Vui lòng upload CV!' }]}
          >
            <Upload
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf,.doc,.docx"
            >
              <Button icon={<UploadOutlined />}>Chọn file CV</Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <Button onClick={() => {
                setShowApplyForm(false);
                setSelectedJob(null);
              }}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                Gửi đơn ứng tuyển
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    );
  }

  return (
    <Modal
      title="Tuyển dụng"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
    >
      {jobs.length === 0 && !loading && (
        <Alert
          message="Hiện tại không có vị trí tuyển dụng nào"
          description="Tất cả kế hoạch tuyển dụng đã đóng hoặc chưa có vị trí nào được tạo."
          type="info"
          showIcon
          className="mb-4"
        />
      )}
      
      <Table
        columns={columns}
        dataSource={jobs}
        rowKey="id"
        loading={loading}
        pagination={false}
      />
    </Modal>
  );
};

export default RecruitmentModal; 