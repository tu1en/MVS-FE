import { Button, Card, Divider, Typography } from 'antd';
import React from 'react';
import TestClassroomDropdown from '../components/TestClassroomDropdown';

const { Title, Paragraph } = Typography;

/**
 * Trang test để verify các chức năng đã sửa
 */
const TestPage = () => {

  // Setup test functions on window object
  React.useEffect(() => {
    // Test messaging endpoints
    window.testMessagingEndpoints = async () => {
      console.log('🧪 Testing Messaging Endpoints...');

      try {
        // Test teacher conversations endpoint
        console.log('Testing: GET /api/student-messages/teacher/2/conversations');
        const conversationsResponse = await fetch('http://localhost:8088/api/student-messages/teacher/2/conversations', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Conversations Response Status:', conversationsResponse.status);
        const conversationsData = await conversationsResponse.text();
        console.log('Conversations Response:', conversationsData);

        // Test teacher messages endpoint
        console.log('Testing: GET /api/student-messages/teacher/2');
        const messagesResponse = await fetch('http://localhost:8088/api/student-messages/teacher/2', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Messages Response Status:', messagesResponse.status);
        const messagesData = await messagesResponse.text();
        console.log('Messages Response:', messagesData);

      } catch (error) {
        console.error('❌ Error testing messaging endpoints:', error);
      }
    };

    // Test teacher endpoints helper
    window.testTeacherEndpoints = async () => {
      console.log('🧪 Testing Teacher Endpoints...');

      try {
        const endpoints = [
          '/api/student-messages/teacher/2/conversations',
          '/api/student-messages/teacher/2',
          '/api/student-messages/sent/2',
          '/api/student-messages/received/2'
        ];

        for (const endpoint of endpoints) {
          console.log(`Testing: GET ${endpoint}`);
          const response = await fetch(`http://localhost:8088${endpoint}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          console.log(`${endpoint} - Status: ${response.status}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`${endpoint} - Data:`, data);
          } else {
            const errorText = await response.text();
            console.log(`${endpoint} - Error:`, errorText);
          }
        }

      } catch (error) {
        console.error('❌ Error testing teacher endpoints:', error);
      }
    };

    // Test all teachers helper
    window.testAllTeachers = async () => {
      console.log('🧪 Testing All Teachers...');

      try {
        // Get all teachers first
        const teachersResponse = await fetch('http://localhost:8088/api/users/teachers', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (teachersResponse.ok) {
          const teachers = await teachersResponse.json();
          console.log('Found teachers:', teachers);

          // Test first few teachers
          for (let i = 0; i < Math.min(3, teachers.length); i++) {
            const teacher = teachers[i];
            console.log(`Testing teacher ${teacher.id}: ${teacher.fullName}`);

            const conversationsResponse = await fetch(`http://localhost:8088/api/student-messages/teacher/${teacher.id}/conversations`, {
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
              }
            });

            console.log(`Teacher ${teacher.id} conversations - Status: ${conversationsResponse.status}`);
            if (conversationsResponse.ok) {
              const data = await conversationsResponse.json();
              console.log(`Teacher ${teacher.id} conversations:`, data);
            }
          }
        }

      } catch (error) {
        console.error('❌ Error testing all teachers:', error);
      }
    };

    // Test UI components specifically
    window.testTeacherMessagesUI = async () => {
      console.log('🎨 Testing Teacher Messages UI components...');

      try {
        // Test students dropdown data
        console.log('1. Testing students API for dropdown...');
        const studentsResponse = await fetch('http://localhost:8088/api/users/students', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (studentsResponse.ok) {
          const students = await studentsResponse.json();
          console.log('✅ Students data for dropdown:', students);
          console.log(`Found ${students.length} students for dropdown options`);

          if (students.length === 0) {
            console.warn('⚠️ No students found - dropdown will be empty!');
          }
        } else {
          console.error('❌ Students API failed:', studentsResponse.status);
        }

        // Test teacher conversations
        const teacherId = localStorage.getItem('userId') || '2';
        console.log(`2. Testing conversations for teacher ${teacherId}...`);

        const conversationsResponse = await fetch(`http://localhost:8088/api/student-messages/teacher/${teacherId}/conversations`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (conversationsResponse.ok) {
          const conversations = await conversationsResponse.json();
          console.log('✅ Conversations data:', conversations);
          console.log(`Found ${conversations.length} conversations`);
        } else {
          console.error('❌ Conversations API failed:', conversationsResponse.status);
        }

        // Test auth state
        console.log('3. Testing auth state...');
        console.log('Token:', localStorage.getItem('token') ? 'Present' : 'Missing');
        console.log('User ID:', localStorage.getItem('userId'));
        console.log('User data:', localStorage.getItem('user'));

      } catch (error) {
        console.error('❌ Error testing UI components:', error);
      }
    };

    return () => {
      delete window.testMessagingEndpoints;
      delete window.testTeacherEndpoints;
      delete window.testAllTeachers;
      delete window.testTeacherMessagesUI;
    };
  }, []);
  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>🔧 Test Assignment Creation Fix</Title>
      
      <Card>
        <Title level={4}>Mục tiêu test:</Title>
        <Paragraph>
          <ul>
            <li>✅ Sửa lỗi biến <code>classroomId</code> không tồn tại</li>
            <li>✅ Cải thiện error handling cho API calls</li>
            <li>✅ Thêm loading state và search cho dropdown</li>
            <li>🔄 Test end-to-end tạo assignment</li>
          </ul>
        </Paragraph>
      </Card>

      <Divider />

      <TestClassroomDropdown />

      <Divider />

      <Card>
        <Title level={4}>Hướng dẫn test:</Title>
        <Paragraph>
          <ol>
            <li><strong>Test API:</strong> Click "Reload Classrooms" để test API call</li>
            <li><strong>Test Dropdown:</strong> Chọn lớp từ dropdown, thử search</li>
            <li><strong>Test Data:</strong> Click "Test Assignment Data" để xem format dữ liệu</li>
            <li><strong>Test Real:</strong> Vào trang Assignments thực tế để test tạo assignment</li>
            <li><strong>Test Messaging:</strong> Click "Test Messaging API" để test messaging endpoints</li>
          </ol>
        </Paragraph>

        <Paragraph>
          <strong>Kiểm tra Console:</strong> Mở DevTools → Console để xem logs chi tiết
        </Paragraph>

        <Paragraph>
          <strong>Kiểm tra Network:</strong> Mở DevTools → Network để xem API calls
        </Paragraph>

        <Paragraph>
          <Button
            type="primary"
            onClick={() => window.testMessagingEndpoints && window.testMessagingEndpoints()}
            style={{ marginRight: '8px' }}
          >
            Test Messaging API
          </Button>
          <Button
            onClick={() => window.testTeacherEndpoints && window.testTeacherEndpoints()}
            style={{ marginRight: '8px' }}
          >
            Test Teacher Endpoints
          </Button>
          <Button
            onClick={() => window.testAllTeachers && window.testAllTeachers()}
            style={{ marginRight: '8px' }}
          >
            Test All Teachers
          </Button>
          <Button
            onClick={() => window.testTeacherMessagesUI && window.testTeacherMessagesUI()}
            type="primary"
          >
            Test Teacher Messages UI
          </Button>
        </Paragraph>
      </Card>
    </div>
  );
};

export default TestPage;
