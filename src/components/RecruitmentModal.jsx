import { Modal, List, Button, Form, Input, Upload, message, Spin } from 'antd';
import { useEffect, useState } from 'react';
import { UploadOutlined } from '@ant-design/icons';
import axiosInstance from '../config/axiosInstance';
import RecruitmentApplyForm from './RecruitmentApplyForm';

// Hàm chuẩn hóa giá trị file cho Upload
const normFile = (e) => {
  if (Array.isArray(e)) {
    return e;
  }
  return e && e.fileList;
};

const RecruitmentModal = ({ open, onClose }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [form] = Form.useForm();
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (open) {
      fetchJobs();
      // Không resetFields và không setSelectedJob(null) ở đây!
    }
  }, [open]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/job-positions');
      setJobs(res.data);
    } catch (err) {
      message.error('Không thể tải danh sách vị trí tuyển dụng!');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectJob = (job) => {
    setSelectedJob(job);
    form.resetFields();
  };

  const handleBack = () => {
    setSelectedJob(null);
    form.resetFields();
  };

  const handleFinish = async (values) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('jobPositionId', selectedJob.id);
      formData.append('email', values.email);
      formData.append('fullName', values.fullName);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('address', values.address);
      if (values.cv && values.cv.length > 0) {
        formData.append('cv', values.cv[0].originFileObj);
      }
      await axiosInstance.post('/recruitments/apply', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      message.success('Nộp CV thành công!');
      onClose();
    } catch (err) {
      message.error('Nộp CV thất bại!');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => { onClose(); setSelectedJob(null); form.resetFields(); }}
      title="Đăng Ký Tuyển Dụng"
      footer={null}
      width={600}
      destroyOnClose
    >
      {loading ? (
        <div className="text-center py-10"><Spin /></div>
      ) : selectedJob ? (
        <div>
          <Button onClick={handleBack} className="mb-4">← Quay lại danh sách vị trí</Button>
          <h3 className="text-xl font-bold mb-2">{selectedJob.title}</h3>
          <p className="mb-2 text-gray-600">{selectedJob.description}</p>
          <p className="mb-2 text-yellow-700 font-semibold">Mức lương: {selectedJob.salaryRange}</p>
          <p className="mb-4 text-blue-600 font-semibold">Số lượng tuyển dụng: {selectedJob.quantity || 1}</p>
          
          <Form form={form} onFinish={handleFinish} layout="vertical">
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
              label="Tải lên CV"
              valuePropName="fileList"
              getValueFromEvent={normFile}
              rules={[{ required: true, message: 'Vui lòng tải lên CV!' }]}
            >
              <Upload
                beforeUpload={() => false}
                accept=".pdf,.doc,.docx"
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>Chọn file CV</Button>
              </Upload>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={uploading} block>
                Nộp đơn ứng tuyển
              </Button>
            </Form.Item>
          </Form>
        </div>
      ) : (
        <List
          header={<div className="font-bold text-lg">Các vị trí đang tuyển dụng</div>}
          bordered
          dataSource={jobs}
          renderItem={job => (
            <List.Item actions={[<Button type="link" onClick={() => handleSelectJob(job)}>Ứng tuyển</Button>]}> 
              <div>
                <div className="font-semibold text-base">{job.title}</div>
                <div className="text-gray-600 text-sm">{job.description}</div>
                <div className="text-yellow-700 font-medium">Mức lương: {job.salaryRange}</div>
                <div className="text-blue-600 font-medium">Số lượng tuyển dụng: {job.quantity || 1}</div>
              </div>
            </List.Item>
          )}
        />
      )}
    </Modal>
  );
};

export default RecruitmentModal; 