import { InboxOutlined } from '@ant-design/icons';
import { Button, Form, Input, message, Upload } from 'antd';
import axios from 'axios';
import { useCallback, useEffect, useState } from 'react';

const { TextArea } = Input;
const { Dragger } = Upload;

const TeacherRequestForm = ({ onClose, initialEmail = '' }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasActiveRequest, setHasActiveRequest] = useState(false);
  const [fileList, setFileList] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8088';

  // Hàm validate số điện thoại
  const validatePhoneNumber = (_, value) => {
    if (!value) {
      return Promise.reject('Vui lòng nhập số điện thoại');
    }
    
    // Kiểm tra chỉ chứa số
    if (!/^\d+$/.test(value)) {
      return Promise.reject('Số điện thoại chỉ được chứa số');
    }
    
    // Kiểm tra độ dài (10-11 chữ số)
    if (value.length !== 10 && value.length !== 11) {
      return Promise.reject('Số điện thoại phải có 10 hoặc 11 chữ số');
    }
    
    // Kiểm tra đầu số (03, 05, 07, 08, 09)
    const validPrefixes = ['03', '05', '07', '08', '09'];
    const prefix = value.substring(0, 2);
    if (!validPrefixes.includes(prefix)) {
      return Promise.reject('Số điện thoại phải bắt đầu bằng 03, 05, 07, 08, 09');
    }
    
    return Promise.resolve();
  };

  const checkActiveRequest = useCallback(async (email) => {
    try {
      console.log(`Checking request status for email: ${email}`);
      const response = await fetch(`${baseUrl}/role-requests/check?email=${email}&role=TEACHER`, {
        mode: 'cors', // Add explicit CORS mode
        credentials: 'omit' // Don't send cookies
      });
      if (response.ok) {
        const hasRequest = await response.json();
        setHasActiveRequest(hasRequest);
        if (hasRequest) {
          message.info('Bạn đã có yêu cầu đăng ký làm giáo viên đang chờ xử lý');
        }
      }
    } catch (error) {
      console.error('Error checking request status:', error);
    }
  }, [baseUrl]);

  useEffect(() => {
    // Ưu tiên sử dụng initialEmail từ prop nếu có
    const emailToUse = initialEmail || localStorage.getItem('email');
    if (emailToUse) {
      form.setFieldsValue({ email: emailToUse });
      checkActiveRequest(emailToUse);
    }
  }, [form, checkActiveRequest, initialEmail]);

  // Function to convert file to base64
  const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
    fileList,
    beforeUpload: (file) => {
      console.log('Selected file:', file.name, file.type, file.size);
      
      // Restrict file size to 5MB
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        message.error(`File phải nhỏ hơn 5MB!`);
        return Upload.LIST_IGNORE;
      }
      
      // Update fileList
      setFileList([file]);
      setUploadError(null);
      
      // Return false to prevent automatic upload
      return false;
    },
    onRemove: () => {
      setFileList([]);
      setUploadError(null);
    }
  };

  const onFinish = async (values) => {
    console.log('Starting form submission with values:', values);
    setLoading(true);
    
    try {
      // Upload CV file first if it exists
      if (fileList.length > 0) {
        setUploading(true);
        const cvFile = fileList[0];
        console.log('Starting CV upload for file:', cvFile.name);
        
        try {
          // Convert file to base64 to avoid CORS issues
          const base64File = await getBase64(cvFile);
          console.log('File converted to base64, attempting to submit with form');
          
          // We'll pass the base64 data directly in the form
          values.cvFileData = base64File;
          values.cvFileName = cvFile.name;
          values.cvFileType = cvFile.type;
          
          // Not setting cvFileUrl as we'll handle the upload on the backend
          console.log('Added file data to form values');
        } catch (uploadError) {
          console.error('Failed to process file:', uploadError);
          setUploadError(`Lỗi khi xử lý file: ${uploadError.message || 'Không rõ lỗi'}`);
          message.error('Đã xảy ra lỗi khi xử lý file');
          setLoading(false);
          setUploading(false);
          return;
        } finally {
          setUploading(false);
        }
      } else {
        message.error('Vui lòng tải lên CV của bạn');
        setLoading(false);
        return;
      }
      
      // Submit the form with the CV file data
      console.log('Submitting form with CV data included');
      
      // Use axios instead of fetch for better error handling
      try {
        const response = await axios.post(`${baseUrl}/role-requests/teacher`, values, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        console.log('Registration successful:', response.data);
        message.success('Đăng ký thành công! Yêu cầu của bạn đang được xử lý.');
        localStorage.setItem('email', values.email); // Save email for future use
        onClose();
      } catch (error) {
        console.error('Error submitting form:', error);
        
        if (error.response?.status === 500) {
          // Kiểm tra nếu là lỗi liên quan đến xử lý file
          if (error.response?.data?.message?.includes('CV') || 
              error.response?.data?.message?.includes('Firebase') || 
              error.response?.data?.message?.includes('Storage')) {
            console.warn('CV file upload issue detected');
            message.warning('Hệ thống đang gặp vấn đề với việc lưu trữ file. Yêu cầu của bạn vẫn được ghi nhận, nhưng chúng tôi có thể liên hệ để yêu cầu CV sau.');
            // Thử gửi lại form không có file CV
            try {
              // Lưu tên file nhưng không gửi data để giảm dung lượng request
              const simplifiedValues = {
                ...values,
                cvFileData: "File upload skipped due to server issues",
                cvFileUrl: "pending://file-upload/" + values.cvFileName
              };
              
              console.log('Retrying submission without full file data');
              const retryResponse = await axios.post(`${baseUrl}/role-requests/teacher`, simplifiedValues, {
                headers: {
                  'Content-Type': 'application/json'
                }
              });
              
              console.log('Registration successful with simplified data:', retryResponse.data);
              message.success('Đăng ký thành công! Yêu cầu của bạn đang được xử lý.');
              localStorage.setItem('email', values.email);
              onClose();
              return;
            } catch (retryError) {
              console.error('Retry also failed:', retryError);
            }
          }
        }
        
        const errorMsg = error.response?.data?.message || 'Vui lòng thử lại sau';
        setUploadError(`Đăng ký thất bại: ${errorMsg}`);
        message.error(`Đăng ký thất bại: ${errorMsg}`);
      }
    } catch (error) {
      console.error('Error during submission process:', error);
      setUploadError(`Lỗi: ${error.message || 'Không rõ lỗi'}`);
      message.error('Đã xảy ra lỗi khi gửi yêu cầu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      name="teacherRequestForm"
      layout="vertical"
      onFinish={onFinish}
      autoComplete="off"
      disabled={hasActiveRequest || loading}
    >
      <Form.Item
        name="email"
        label="Email"
        rules={[
          { required: true, message: 'Vui lòng nhập email' },
          { type: 'email', message: 'Email không hợp lệ' }
        ]}
      >
        <Input placeholder="Nhập email của bạn" disabled={!!initialEmail} />
      </Form.Item>

      <Form.Item
        name="fullName"
        label="Họ tên"
        rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}
      >
        <Input placeholder="Nhập họ tên đầy đủ" />
      </Form.Item>

      <Form.Item
        name="phoneNumber"
        label="Số điện thoại"
        rules={[
          { required: true, message: 'Vui lòng nhập số điện thoại' },
          { validator: validatePhoneNumber }
        ]}
      >
        <Input placeholder="Nhập số điện thoại liên hệ" maxLength={11} />
      </Form.Item>

      <Form.Item
        name="cvFile"
        label="Tải lên CV"
        rules={[{ required: true, message: 'Vui lòng tải lên CV' }]}
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Nhấp hoặc kéo file vào khu vực này để tải lên</p>
          <p className="ant-upload-hint">
            Hỗ trợ các file PDF, DOC, DOCX, JPG, PNG. Kích thước tối đa 5MB.
          </p>
        </Dragger>
      </Form.Item>

      {uploadError && (
        <div style={{ color: 'red', marginBottom: '16px' }}>
          {uploadError}
        </div>
      )}

      <Form.Item
        name="additionalInfo"
        label="Thông tin thêm"
      >
        <TextArea rows={3} placeholder="Thông tin thêm (nếu có)" />
      </Form.Item>

      {hasActiveRequest ? (
        <div className="text-orange-500 mb-4">
          Bạn đã có yêu cầu đăng ký đang chờ xử lý. Vui lòng chờ phản hồi.
        </div>
      ) : (
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Gửi yêu cầu
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

export default TeacherRequestForm; 