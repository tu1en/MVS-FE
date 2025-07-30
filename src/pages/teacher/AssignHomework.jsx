import { UploadOutlined } from '@ant-design/icons';
import { App, Button, Card, DatePicker, Form, Input, Select, Upload } from 'antd';
import axios from 'axios';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import { notificationService } from '../../services/notificationService';
import teacherService from '../../services/teacherService';

// Enable dayjs plugins for timezone handling
dayjs.extend(utc);
dayjs.extend(timezone);

const { TextArea } = Input;

function AssignHomework() {
  const [form] = Form.useForm();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const { message } = App.useApp();

  // Fetch classes với AbortController ngắn gọn
  useEffect(() => {
    const controller = new AbortController();
    
    const loadClasses = async () => {
      try {
        const response = await teacherService.getClasses(controller.signal);
        console.log("Raw classes response:", response);
        console.log("Classes data:", response.data);
        
        // Handle different response formats
        let classesData = response.data;
        // Unwrap if response is axios format with data field
        if (response.data && response.data.data && Array.isArray(response.data.data)) {
          classesData = response.data.data;
        }
        
        if (Array.isArray(classesData)) {
          console.log("Loaded classes length:", classesData.length);
          setClasses(classesData);
          
          // Debug first item structure
          if (classesData.length > 0) {
            console.log("Sample class structure:", classesData[0]);
          }
        } else {
          console.warn("No classes data found", { actualData: response });
          setClasses([]);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching classes:", error);
          message.error('Không thể tải danh sách lớp học');
          setClasses([]);
        }
      }
    };
    
    loadClasses();
    return () => controller.abort();
  }, [message]);

  // Debug script - thêm vào AssignHomework.js để kiểm tra
  useEffect(() => {
    // Debug axios instance
    console.log('🔍 Axios Instance Config:', {
      baseURL: axiosInstance.defaults.baseURL,
      headers: axiosInstance.defaults.headers
    });
    
    // Test endpoint accessibility
    const testEndpoint = async () => {
      try {
        console.log('🧪 Testing file controller...');
        const response = await axiosInstance.get('/files/test');
        console.log('✅ File controller test success:', response.data);
      } catch (error) {
        console.error('❌ File controller test failed:', error.response?.data || error.message);
        console.error('Full error:', error);
      }
    };
    
    testEndpoint();
  }, []);

  // Updated handleSubmit với better debugging
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      console.log('🚀 Starting assignment creation process...');

      // 📎 Step 1: Upload files if any
      let uploadedFiles = [];
      
      if (fileList && fileList.length > 0) {
        console.log('🔄 Starting file upload process...');
        console.log('📁 Files to upload:', fileList);
        
        // Upload files sequentially to avoid overwhelming server
        for (const file of fileList) {
          try {
            console.log(`📤 Uploading file: ${file.name}`);
            
            const formData = new FormData();
            formData.append('file', file.originFileObj || file);
            formData.append('category', 'assignments');
            
            // Debug FormData
            console.log('📋 FormData entries:');
            for (let [key, value] of formData.entries()) {
              console.log(key, value);
            }
            
            const endpoint = '/files/upload';
            console.log('🎯 Upload endpoint:', endpoint);
            // Assuming axiosInstance is configured with a baseURL
            const API_BASE_URL = axiosInstance.defaults.baseURL; 
            console.log('🌐 Full URL will be:', `${API_BASE_URL}${endpoint}`);
            
            // ✨ FIXED: Improved response handling with proper try-catch
            const response = await axiosInstance.post(endpoint, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
              timeout: 30000,
              validateStatus: function (status) {
                return status >= 200 && status < 300;
              }
            });
            
            console.log('📦 Raw upload response:', response);
            console.log('📊 Response status:', response.status);
            console.log('📄 Response data:', response.data);
            
            // ✨ FIXED: Proper response validation
            if (response.status === 200 && response.data) {
              let responseData = response.data;
              
              // Handle nested response structure if needed
              if (responseData.data && typeof responseData.data === 'object') {
                responseData = responseData.data;
                console.log('🔄 Using nested data:', responseData);
              }
              
              // More flexible validation - check for required fields
              const hasValidResponse = (
                responseData.success === true || 
                (responseData.filename && responseData.fileUrl)
              );
              
              if (hasValidResponse) {
                console.log('✅ Upload success:', responseData);
                
                // Extract file info with fallbacks
                const fileInfo = {
                  originalName: file.name,
                  filename: responseData.filename || `unknown_${Date.now()}`,
                  fileUrl: responseData.fileUrl || '',
                  filePath: responseData.filePath || '',
                  size: responseData.size || file.size || 0
                };
                
                uploadedFiles.push(fileInfo);
                console.log(`✅ File uploaded successfully: ${file.name}`);
                console.log('📋 Added to uploadedFiles:', fileInfo);
              } else {
                console.error('❌ Invalid response structure:', responseData);
                message.error(`File ${file.name} upload failed - invalid response`);
                // Continue with other files instead of throwing
              }
            } else {
              console.error('❌ Invalid response status or empty data');
              message.error(`File ${file.name} upload failed - invalid status`);
              // Continue with other files instead of throwing
            }
            
          } catch (uploadError) {
            console.error(`❌ Upload failed for file: ${file.name}`, uploadError);
            
            // Better error message extraction
            let errorMsg = uploadError.message;
            if (uploadError.response?.data?.message) {
              errorMsg = uploadError.response.data.message;
            } else if (uploadError.response?.data?.error) {
              errorMsg = uploadError.response.data.error;
            }
            
            message.error(`Không thể tải lên file ${file.name}. Lỗi: ${errorMsg}`);
            // Continue with other files instead of failing completely
          }
        }
      }
      
      console.log('📚 Creating assignment with uploaded files:', uploadedFiles);

      // 📝 Step 2: Create assignment
      const assignmentData = {
        title: values.title,
        description: values.description,
        // ✨ FIXED: Remove timezone suffix to match backend expectation
        dueDate: values.dueDate.format('YYYY-MM-DDTHH:mm'),
        points: values.maxScore,
        classroomId: values.classId, // Include classroomId in payload
        attachments: uploadedFiles
      };

      console.log('📋 Assignment payload:', assignmentData);

      // ✨ FIXED: Use correct endpoint that matches backend logs
      const assignmentService = {
        createAssignment: async (classroomId, data) => {
          // Backend logs show POST /api/assignments is working
          const response = await axiosInstance.post('/assignments', data);
          return response.data;
        }
      }

      const assignmentResponse = await assignmentService.createAssignment(
        values.classId,
        assignmentData
      );

      console.log('Assignment created successfully:', assignmentResponse);

      // 📢 Step 3: Send notification
      const selectedClass = classes.find(c => c.id === values.classId);
      const classroomName = selectedClass ? selectedClass.name : 'Unknown Class';

      await notificationService.createNotification({
        title: `Bài tập mới: ${values.title}`,
        content: `Lớp ${classroomName}: ${values.description}\nHạn nộp: ${values.dueDate.format('DD/MM/YYYY HH:mm')}`,
        targetAudience: 'students'
      });

      // ✅ Success
      message.success('Tạo bài tập thành công!');
      form.resetFields();
      setFileList([]);

    } catch (error) {
      console.error('❌ Error creating assignment:', error);
      
      let errorMessage = 'Có lỗi xảy ra khi tạo bài tập';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 🔧 Additional helper function for file validation
  const validateFileBeforeUpload = (file) => {
    console.log('🔍 Validating file:', file.name);
    
    // Check file size (e.g., max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      message.error(`File ${file.name} quá lớn. Kích thước tối đa: 10MB`);
      return false;
    }
    
    // Check file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf',
      'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      message.error(`Loại file ${file.name} không được hỗ trợ`);
      return false;
    }
    
    return true;
  };

  // 🔧 Enhanced file upload props for Antd Upload component
  const uploadProps = {
    multiple: true,
    fileList: fileList,
    beforeUpload: (file) => {
      // Validate file before adding to list
      if (!validateFileBeforeUpload(file)) {
        return false;
      }
      
      // Add to file list but don't upload immediately
      setFileList(prev => [...prev, {
        uid: file.uid,
        name: file.name,
        status: 'done',
        originFileObj: file
      }]);
      
      return false; // Prevent auto upload
    },
    onRemove: (file) => {
      setFileList(prev => prev.filter(item => item.uid !== file.uid));
    },
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
      showDownloadIcon: false
    }
  };

  // Disable past dates and times - more restrictive
  const disabledDate = (current) => {
    return current && current < dayjs().startOf('day');
  };

  const disabledDateTime = (current) => {
    if (!current) return {};
    
    const now = dayjs();
    const selectedDate = dayjs(current);
    
    // If selected date is today
    if (selectedDate.format('YYYY-MM-DD') === now.format('YYYY-MM-DD')) {
      return {
        disabledHours: () => {
          const hours = [];
          for (let i = 0; i <= now.hour(); i++) {
            hours.push(i);
          }
          return hours;
        },
        disabledMinutes: (selectedHour) => {
          if (selectedHour === now.hour() + 1) {
            // For the next hour, disable past minutes
            const minutes = [];
            for (let i = 0; i <= now.minute(); i++) {
              minutes.push(i);
            }
            return minutes;
          }
          return [];
        }
      };
    }
    
    return {};
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
          rules={[
            { required: true, message: 'Vui lòng chọn thời hạn nộp!' },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                
                const dueDate = dayjs(value);
                const now = dayjs();
                const minimumFutureTime = now.add(1, 'minute');
                
                if (dueDate.isAfter(minimumFutureTime)) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Thời hạn nộp phải ít nhất 1 phút sau thời gian hiện tại!'));
              }
            }
          ]}
        >
          <DatePicker
            showTime
            format="DD/MM/YYYY HH:mm"
            placeholder="Chọn thời hạn nộp bài"
            className="w-full"
            disabledDate={disabledDate}
            disabledTime={disabledDateTime}
            showNow={false}
            // Set default time to next hour
            defaultPickerValue={dayjs().add(1, 'hour')}
          />
        </Form.Item>

        <Form.Item
          name="maxScore"
          label="Điểm Tối Đa"
          initialValue={10}
        >
          <Input type="number" min={1} max={100} />
        </Form.Item>

        <Form.Item
          label="Tệp Đính Kèm"
          name="attachments"
        >
          <Upload {...uploadProps}>
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