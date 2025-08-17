import { Modal, Table, Button, message, Tag, Alert, Form, Input, Upload, Typography, Row, Col, Card, Divider } from 'antd';
import { useState, useEffect } from 'react';
import { UploadOutlined, DollarOutlined, CalendarOutlined, UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined } from '@ant-design/icons';
import apiClient from '../config/axiosInstance';
import { recruitmentService } from '../services/recruitmentService';
import { validatePhoneNumber } from '../utils/validation';

const { Title, Text, Paragraph } = Typography;

const RecruitmentModal = ({ visible, onCancel }) => {
  
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      fetchJobs();
    }
  }, [visible]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/job-positions/all');
      // Lọc các job có recruitmentPlanStatus === 'OPEN'
      // Việc scan và đóng kế hoạch tương lai đã được thực hiện tự động ở backend
      const filtered = (res.data || []).filter(job => 
        job.recruitmentPlanStatus === 'OPEN'
      );
      setJobs(filtered);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      message.error('Không thể tải danh sách vị trí tuyển dụng!');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = (job) => {
    setSelectedJob(job);
    setShowApplyForm(true);
    setCvFile(null);
    form.resetFields();
  };

  const handleSubmitApplication = async (values) => {
    console.log('🚀 handleSubmitApplication called with values:', values);
    console.log('📁 CV values:', values.cv);
    console.log('📁 CV length:', values.cv?.length);
    console.log('📁 CV[0]:', values.cv?.[0]);
    console.log('📁 CV[0].originFileObj:', values.cv?.[0]?.originFileObj);
    console.log('📁 cvFile state:', cvFile);
    console.log('📁 cvFile.originFileObj:', cvFile?.originFileObj);
    
    try {
      const formData = new FormData();
      formData.append('jobPositionId', selectedJob.id);
      formData.append('fullName', values.fullName);
      formData.append('email', values.email);
      formData.append('phoneNumber', values.phoneNumber);
      formData.append('address', values.address);
      
      console.log('📦 FormData before CV:', formData);
      
      // Kiểm tra và append CV file - ưu tiên cvFile state
      let cvFileToAppend = null;
      
      if (cvFile && cvFile.originFileObj) {
        cvFileToAppend = cvFile.originFileObj;
        console.log('✅ Using cvFile state:', cvFileToAppend);
      } else if (values.cv && values.cv.length > 0 && values.cv[0].originFileObj) {
        cvFileToAppend = values.cv[0].originFileObj;
        console.log('✅ Using values.cv:', cvFileToAppend);
      }
      
      if (cvFileToAppend) {
        console.log('✅ Appending CV file:', cvFileToAppend);
        console.log('✅ File name:', cvFileToAppend.name);
        console.log('✅ File size:', cvFileToAppend.size);
        console.log('✅ File type:', cvFileToAppend.type);
        formData.append('cv', cvFileToAppend);
      } else {
        console.log('❌ No CV file to append');
        console.log('❌ values.cv:', values.cv);
        console.log('❌ cvFile state:', cvFile);
        throw new Error('CV file is required');
      }
      
      console.log('📦 FormData after CV:', formData);
      console.log('📋 FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(`   ${key}:`, value);
      }

      console.log('🌐 Calling recruitmentService.apply...');
      await recruitmentService.apply(formData);
      
      message.success('Đã gửi đơn ứng tuyển thành công!');
      setShowApplyForm(false);
      setSelectedJob(null);
      onCancel();
    } catch (err) {
      console.error('Error submitting application:', err);
      
      // Xử lý thông báo lỗi cơ bản
      let errorMessage = `Không thể gửi đơn ứng tuyển: ${err.response?.data?.message || err.message}`;

      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }

      message.error(errorMessage);
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    
    if (e && e.fileList) {
      return e.fileList;
    }
    
    if (e && e.file) {
      return [e.file];
    }
    
    return [];
  };

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
            <Input prefix={<UserOutlined />} placeholder="Nhập họ và tên đầy đủ" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="example@email.com" />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
            rules={[{ required: true, validator: validatePhoneNumber }]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="0987654321" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input.TextArea prefix={<HomeOutlined />} rows={3} placeholder="Nhập địa chỉ chi tiết" />
          </Form.Item>

          <Form.Item
            name="cv"
            label="CV/Resume"
            valuePropName="fileList"
            getValueFromEvent={normFile}
            rules={[
              {
                validator: (_, fileList) => {
                  console.log('🔍 CV validator called with fileList:', fileList);
                  console.log('🔍 cvFile state:', cvFile);
                  
                  // Check if we have a valid file - ưu tiên cvFile state
                  let hasFile = false;
                  let file = null;
                  
                  if (cvFile && cvFile.originFileObj) {
                    hasFile = true;
                    file = cvFile.originFileObj;
                    console.log('✅ Using cvFile state for validation');
                  } else if (fileList && fileList.length > 0 && fileList[0].originFileObj) {
                    hasFile = true;
                    file = fileList[0].originFileObj;
                    console.log('✅ Using fileList for validation');
                  }
                  
                  if (!hasFile) {
                    console.log('❌ No valid CV file found');
                    return Promise.reject(new Error('Vui lòng upload CV!'));
                  }
                  
                  console.log('✅ Valid CV file found:', file);
                  
                  // Kiểm tra định dạng file
                  const fileName = file.name.toLowerCase();
                  if (!fileName.endsWith('.pdf')) {
                    console.log('❌ Invalid file format:', fileName);
                    return Promise.reject(new Error('Chỉ hỗ trợ file PDF !'));
                  }
                  
                  if (file.size > 10 * 1024 * 1024) {
                    console.log('❌ File too large:', file.size);
                    return Promise.reject(new Error('File CV không được lớn hơn 10MB!'));
                  }
                  
                  console.log('✅ CV validation passed');
                  return Promise.resolve();
                }
              }
            ]}
          >
            <Upload
              beforeUpload={(file) => {
                // Kiểm tra định dạng file
                const fileName = file.name.toLowerCase();
                if (!fileName.endsWith('.pdf')) {
                  message.error('Chỉ hỗ trợ file PDF !');
                  return Upload.LIST_IGNORE;
                }
                
                // Kiểm tra kích thước file
                if (file.size > 10 * 1024 * 1024) {
                  message.error('File CV không được lớn hơn 10MB!');
                  return Upload.LIST_IGNORE;
                }
                
                return false; // Prevent auto upload
              }}
              onChange={(info) => {
                console.log('📁 Upload onChange called with info:', info);
                console.log('📁 info.fileList:', info.fileList);
                console.log('📁 info.fileList[0]:', info.fileList[0]);
                setCvFile(info.fileList[0] || null);
                // Trigger form validation after file change
                setTimeout(() => {
                  form.validateFields(['cv']);
                }, 100);
              }}
              onRemove={() => {
                console.log('🗑️ Upload onRemove called');
                setCvFile(null);
                // Trigger form validation after file removal
                setTimeout(() => {
                  form.validateFields(['cv']);
                }, 100);
              }}
              maxCount={1}
              accept=".pdf"
              listType="text"
            >
              <Button icon={<UploadOutlined />}>Chọn file CV</Button>
            </Upload>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              Hỗ trợ: PDF (tối đa 10MB)
            </div>
          </Form.Item>

          <Form.Item>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              
              <Button onClick={() => {
                setShowApplyForm(false);
                setSelectedJob(null);
              }}>
                Hủy
              </Button>
              <Button 
                type="primary" 
                htmlType="submit"
              >
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
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={1000}
      className="recruitment-modal"
    >
      <div className="recruitment-content">
        {/* Header with Image and Message */}
        <div className="recruitment-header" style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '12px 12px 0 0',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            backgroundImage: 'url(/anh-tuyen-dung.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.3,
            zIndex: 1
          }} />
          <div style={{ position: 'relative', zIndex: 2 }}>
            <Title level={1} style={{ color: 'white', marginBottom: '10px' }}>
              🎓 Tuyển Dụng Giáo Viên
            </Title>
            <Paragraph style={{ color: 'white', fontSize: '18px', marginBottom: '20px' }}>
              Tham gia đội ngũ giáo viên chuyên nghiệp của chúng tôi
            </Paragraph>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <DollarOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>Mức lương hấp dẫn</div>
                <Text strong style={{ color: 'white' }}>12-25 triệu VNĐ</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <CalendarOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>Làm việc linh hoạt</div>
                <Text strong style={{ color: 'white' }}>Full-time/Part-time</Text>
              </div>
              <div style={{ textAlign: 'center' }}>
                <UserOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                <div>Cơ hội thăng tiến</div>
                <Text strong style={{ color: 'white' }}>Không giới hạn</Text>
              </div>
            </div>
          </div>
        </div>

        {/* Job Positions Section */}
        <div style={{ padding: '30px' }}>
          <Title level={3} style={{ marginBottom: '20px', textAlign: 'center' }}>
            📋 Các Vị Trí Tuyển Dụng
          </Title>
          
          {jobs.length === 0 && !loading && (
            <Alert
              message="Hiện tại không có vị trí tuyển dụng nào"
              description="Tất cả kế hoạch tuyển dụng đã đóng hoặc chưa đến ngày mở. Vui lòng quay lại sau khi có kế hoạch tuyển dụng mới."
              type="info"
              showIcon
              className="mb-4"
            />
          )}
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div>Đang tải danh sách tuyển dụng...</div>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {jobs.map((job) => (
                <Col xs={24} md={12} key={job.id}>
                  <Card
                    hoverable
                    style={{ height: '100%' }}
                    actions={[
                      <Button type="primary" onClick={() => handleApply(job)}>
                        Ứng tuyển ngay
                      </Button>
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span>{job.title}</span>
                          <Tag color="green">{job.quantity} vị trí</Tag>
                        </div>
                      }
                      description={
                        <div>
                          <Paragraph style={{ marginBottom: '10px' }}>
                            {job.description}
                          </Paragraph>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text strong style={{ color: '#1890ff' }}>
                               {job.salaryRange} VNĐ/giờ
                            </Text>
                          </div>
                        </div>
                      }
                    />
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default RecruitmentModal; 