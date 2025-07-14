import React, { useState, useEffect } from 'react';
import { Button, Select, Spin, message } from 'antd';
import ClassroomService from '../services/classroomService';

const { Option } = Select;

/**
 * Test component để verify dropdown classrooms hoạt động
 */
const TestClassroomDropdown = () => {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState(null);

  const fetchClassrooms = async () => {
    setLoading(true);
    try {
      console.log('Testing classroom API call...');
      const response = await ClassroomService.getClassroomsByCurrentTeacher();
      console.log('API Response:', response);
      
      if (response && response.length > 0) {
        setClassrooms(response);
        message.success(`Tải thành công ${response.length} lớp học`);
      } else {
        setClassrooms([]);
        message.warning('Không có lớp học nào');
      }
    } catch (error) {
      console.error('API Error:', error);
      setClassrooms([]);
      
      if (error.response?.status === 401) {
        message.error('Chưa đăng nhập hoặc phiên đã hết hạn');
      } else if (error.response?.status === 403) {
        message.error('Không có quyền truy cập');
      } else {
        message.error('Lỗi khi tải danh sách lớp học');
      }
    } finally {
      setLoading(false);
    }
  };

  const testCreateAssignment = () => {
    if (!selectedClassroom) {
      message.error('Vui lòng chọn lớp học trước');
      return;
    }

    const testData = {
      title: 'Test Assignment',
      description: 'Test description',
      classroomId: selectedClassroom,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      points: 10
    };

    console.log('Test assignment data:', testData);
    message.info('Dữ liệu test đã được log ra console');
  };

  useEffect(() => {
    fetchClassrooms();
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #d9d9d9', margin: '20px', borderRadius: '6px' }}>
      <h3>🧪 Test Classroom Dropdown</h3>
      
      <div style={{ marginBottom: '16px' }}>
        <Button onClick={fetchClassrooms} loading={loading}>
          Reload Classrooms
        </Button>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label>Chọn lớp học:</label>
        <Select
          style={{ width: '100%', marginTop: '8px' }}
          placeholder="Chọn lớp học"
          loading={loading}
          value={selectedClassroom}
          onChange={setSelectedClassroom}
          showSearch
          filterOption={(input, option) =>
            option?.children?.toLowerCase().includes(input.toLowerCase())
          }
          notFoundContent={
            loading ? (
              <div style={{ textAlign: 'center', padding: '8px' }}>
                <Spin size="small" /> Đang tải...
              </div>
            ) : classrooms.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '8px', color: '#999' }}>
                Không có lớp học nào
              </div>
            ) : (
              'Không tìm thấy lớp học phù hợp'
            )
          }
        >
          {classrooms.map(classroom => (
            <Option key={classroom.id} value={classroom.id}>
              {classroom.name} (ID: {classroom.id})
            </Option>
          ))}
        </Select>
      </div>

      <div style={{ marginBottom: '16px' }}>
        <Button 
          type="primary" 
          onClick={testCreateAssignment}
          disabled={!selectedClassroom}
        >
          Test Assignment Data
        </Button>
      </div>

      <div style={{ fontSize: '12px', color: '#666' }}>
        <p><strong>Status:</strong></p>
        <p>• Classrooms loaded: {classrooms.length}</p>
        <p>• Selected: {selectedClassroom || 'None'}</p>
        <p>• Loading: {loading ? 'Yes' : 'No'}</p>
      </div>
    </div>
  );
};

export default TestClassroomDropdown;
