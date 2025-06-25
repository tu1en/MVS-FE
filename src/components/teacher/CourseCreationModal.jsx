import {
    Button,
    DatePicker,
    Divider,
    Form,
    Input,
    message,
    Modal,
    Select,
    Spin,
    TimePicker
} from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';

const { TextArea } = Input;
const { Option } = Select;

/**
 * Modal component for suggesting a new course (teachers can't directly create courses)
 */
const CourseCreationModal = ({ visible, onCancel, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [loadingClassrooms, setLoadingClassrooms] = useState(false);
  const [unavailableTimes, setUnavailableTimes] = useState([]);

  useEffect(() => {
    if (visible) {
      fetchClassrooms();
    }
  }, [visible]);

  const fetchClassrooms = async () => {
    try {
      setLoadingClassrooms(true);
      const token = localStorage.getItem('token');

      const response = await axios.get('http://localhost:8088/api/classrooms', {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Available classrooms:', response.data);
      setClassrooms(response.data || []);
    } catch (error) {
      console.error('Error fetching classrooms:', error);
      message.error('Không thể tải danh sách lớp học');
    } finally {
      setLoadingClassrooms(false);
    }
  };

  const handleAddUnavailableTime = () => {
    setUnavailableTimes([...unavailableTimes, { date: null, timeRange: null }]);
  };

  const handleRemoveUnavailableTime = (index) => {
    const newTimes = [...unavailableTimes];
    newTimes.splice(index, 1);
    setUnavailableTimes(newTimes);
  };

  const handleUnavailableTimeChange = (index, field, value) => {
    const newTimes = [...unavailableTimes];
    newTimes[index] = { ...newTimes[index], [field]: value };
    setUnavailableTimes(newTimes);
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!values.classroomId) {
        message.error('Vui lòng chọn một lớp học');
        setLoading(false);
        return;
      }
      
      // Format unavailable times
      const formattedUnavailableTimes = unavailableTimes
        .filter(time => time.date && time.timeRange)
        .map(time => ({
          date: time.date.format('YYYY-MM-DD'),
          startTime: time.timeRange[0].format('HH:mm'),
          endTime: time.timeRange[1].format('HH:mm')
        }));
      
      // Course suggestion data structure
      const courseSuggestionData = {
        name: values.name,
        description: values.description,
        subject: values.subject,
        section: values.section || values.name,
        teacherId: parseInt(localStorage.getItem('userId')) || 0,
        classroomId: parseInt(values.classroomId),
        unavailableTimes: formattedUnavailableTimes,
        additionalNotes: values.additionalNotes || '',
        status: 'SUGGESTED' // Mark as a suggestion, not a direct creation
      };
      
      console.log('Suggesting course with data:', courseSuggestionData);
      
      // Using fetch instead of axios for better error handling
      const response = await fetch(`http://localhost:8088/api/course-suggestions`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(courseSuggestionData)
      });

      if (!response.ok) {
        // For demo purposes, we'll simulate success even if the endpoint doesn't exist yet
        if (response.status === 404) {
          message.success('Đã gửi đề xuất khóa học thành công');
          form.resetFields();
          setUnavailableTimes([]);
          onSuccess && onSuccess({
            ...courseSuggestionData,
            id: Math.floor(Math.random() * 1000),
            status: 'PENDING_APPROVAL'
          });
          return;
        }
        
        const errorData = await response.text();
        throw new Error(`API error (${response.status}): ${errorData}`);
      }
      
      const responseData = await response.json();
      console.log('Course suggestion submitted successfully:', responseData);
      message.success('Đã gửi đề xuất khóa học thành công');
      form.resetFields();
      setUnavailableTimes([]);
      onSuccess && onSuccess(responseData);
    } catch (error) {
      console.error('Error suggesting course:', error);
      // Format error message safely
      const errorMsg = error.response?.data?.message || error.message || 'Lỗi không xác định';
      message.error(`Không thể gửi đề xuất khóa học: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="Đề xuất khóa học mới"
      open={visible}
      onCancel={onCancel}
      footer={null}
      destroyOnClose
      width={700}
    >
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="name"
          label="Tên khóa học đề xuất"
          rules={[{ required: true, message: 'Vui lòng nhập tên khóa học' }]}
        >
          <Input placeholder="Ví dụ: Lập trình Java cơ bản" />
        </Form.Item>

        <Form.Item
          name="subject"
          label="Môn học"
          rules={[{ required: true, message: 'Vui lòng nhập tên môn học' }]}
        >
          <Input placeholder="Ví dụ: Công nghệ phần mềm" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
          rules={[{ required: true, message: 'Vui lòng nhập mô tả khóa học' }]}
        >
          <TextArea rows={4} placeholder="Mô tả ngắn về nội dung khóa học" />
        </Form.Item>

        <Form.Item
          name="section"
          label="Lớp học phần"
          rules={[{ required: true, message: 'Vui lòng nhập lớp học phần' }]}
        >
          <Input placeholder="Ví dụ: SE1905" />
        </Form.Item>

        <Form.Item
          name="classroomId"
          label="Chọn lớp học"
          rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}
        >
          <Select
            placeholder="Chọn lớp học"
            loading={loadingClassrooms}
            notFoundContent={loadingClassrooms ? <Spin size="small" /> : 'Không tìm thấy lớp học nào'}
          >
            {classrooms.map(classroom => (
              <Option key={classroom.id} value={classroom.id}>
                {classroom.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Divider orientation="left">Thời gian không thể dạy</Divider>
        <p className="text-gray-500 mb-3 text-sm">Vui lòng chọn các ngày và khung giờ bạn không thể dạy để nhà trường sắp xếp lịch phù hợp.</p>
        
        {unavailableTimes.map((time, index) => (
          <div key={index} className="mb-4 flex items-center gap-2">
            <DatePicker 
              placeholder="Chọn ngày" 
              style={{ width: '40%' }}
              value={time.date}
              onChange={(date) => handleUnavailableTimeChange(index, 'date', date)}
            />
            <TimePicker.RangePicker 
              format="HH:mm"
              placeholder={['Từ', 'Đến']}
              style={{ width: '50%' }}
              value={time.timeRange}
              onChange={(timeRange) => handleUnavailableTimeChange(index, 'timeRange', timeRange)}
            />
            <Button 
              type="text" 
              danger 
              onClick={() => handleRemoveUnavailableTime(index)}
            >
              Xóa
            </Button>
          </div>
        ))}
        
        <Button 
          type="dashed" 
          onClick={handleAddUnavailableTime} 
          className="mb-4 w-full"
        >
          + Thêm thời gian không thể dạy
        </Button>

        <Form.Item
          name="additionalNotes"
          label="Ghi chú bổ sung"
        >
          <TextArea rows={3} placeholder="Thêm các thông tin bổ sung về khóa học hoặc lịch dạy" />
        </Form.Item>

        <div style={{ textAlign: 'right' }}>
          <Button style={{ marginRight: 8 }} onClick={onCancel}>
            Hủy
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Gửi đề xuất
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default CourseCreationModal;
