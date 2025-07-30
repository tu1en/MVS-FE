import React, { useState } from 'react';
import { Card, Typography, Button, Input, Space, Divider, Alert, Table, Tag } from 'antd';
import { 
  parseTimestamp, 
  formatTimestamp, 
  formatMessageTime, 
  formatDateDivider, 
  formatFullDateTime,
  isValidTimestamp,
  getTimeAgo,
  debugTimestamp
} from '../utils/dateUtils';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const DateUtilsDemo = () => {
  const [testInput, setTestInput] = useState('');
  const [results, setResults] = useState(null);

  // Sample test data
  const sampleData = [
    {
      name: 'Array Format (Java LocalDateTime)',
      value: [2025, 7, 12, 12, 13, 22, 153221000],
      description: 'Format: [year, month, day, hour, minute, second, nanosecond]'
    },
    {
      name: 'ISO String',
      value: '2025-07-12T12:13:22.153Z',
      description: 'Standard ISO 8601 format'
    },
    {
      name: 'Date Object',
      value: new Date('2025-07-12T12:13:22.153Z'),
      description: 'JavaScript Date object'
    },
    {
      name: 'Unix Timestamp',
      value: 1721649202153,
      description: 'Milliseconds since epoch'
    },
    {
      name: 'Invalid Input',
      value: 'invalid-date',
      description: 'Should return fallback values'
    },
    {
      name: 'Null Input',
      value: null,
      description: 'Should handle gracefully'
    }
  ];

  const testAllFormats = () => {
    const testResults = sampleData.map(sample => {
      const parsed = parseTimestamp(sample.value);
      
      return {
        name: sample.name,
        input: JSON.stringify(sample.value),
        description: sample.description,
        parsed: parsed ? parsed.toString() : 'null',
        isValid: isValidTimestamp(sample.value),
        formatTimestamp: formatTimestamp(sample.value),
        formatMessageTime: formatMessageTime(sample.value),
        formatDateDivider: formatDateDivider(sample.value),
        formatFullDateTime: formatFullDateTime(sample.value),
        getTimeAgo: getTimeAgo(sample.value)
      };
    });

    setResults(testResults);
  };

  const testCustomInput = () => {
    try {
      let inputValue;
      
      // Try to parse as JSON first (for arrays)
      try {
        inputValue = JSON.parse(testInput);
      } catch {
        // If not JSON, use as string
        inputValue = testInput;
      }

      const parsed = parseTimestamp(inputValue);
      
      const customResult = {
        name: 'Custom Input',
        input: testInput,
        description: 'User provided input',
        parsed: parsed ? parsed.toString() : 'null',
        isValid: isValidTimestamp(inputValue),
        formatTimestamp: formatTimestamp(inputValue),
        formatMessageTime: formatMessageTime(inputValue),
        formatDateDivider: formatDateDivider(inputValue),
        formatFullDateTime: formatFullDateTime(inputValue),
        getTimeAgo: getTimeAgo(inputValue)
      };

      setResults([customResult]);
      
      // Debug output to console
      debugTimestamp(inputValue, 'Custom input test');
      
    } catch (error) {
      console.error('Error testing custom input:', error);
      setResults([{
        name: 'Custom Input',
        input: testInput,
        description: 'Error parsing input',
        parsed: 'Error: ' + error.message,
        isValid: false,
        formatTimestamp: 'Error',
        formatMessageTime: 'Error',
        formatDateDivider: 'Error',
        formatFullDateTime: 'Error',
        getTimeAgo: 'Error'
      }]);
    }
  };

  const columns = [
    {
      title: 'Test Case',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: 'Input',
      dataIndex: 'input',
      key: 'input',
      width: 200,
      render: (text) => <Text code style={{ fontSize: '11px' }}>{text}</Text>
    },
    {
      title: 'Valid',
      dataIndex: 'isValid',
      key: 'isValid',
      width: 60,
      render: (valid) => <Tag color={valid ? 'green' : 'red'}>{valid ? 'Yes' : 'No'}</Tag>
    },
    {
      title: 'Parsed Date',
      dataIndex: 'parsed',
      key: 'parsed',
      width: 200,
      render: (text) => <Text style={{ fontSize: '11px' }}>{text}</Text>
    },
    {
      title: 'formatTimestamp',
      dataIndex: 'formatTimestamp',
      key: 'formatTimestamp',
      width: 120,
    },
    {
      title: 'formatMessageTime',
      dataIndex: 'formatMessageTime',
      key: 'formatMessageTime',
      width: 120,
    },
    {
      title: 'formatDateDivider',
      dataIndex: 'formatDateDivider',
      key: 'formatDateDivider',
      width: 120,
    },
    {
      title: 'getTimeAgo',
      dataIndex: 'getTimeAgo',
      key: 'getTimeAgo',
      width: 120,
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <Title level={2}>🕐 DateUtils Testing Demo</Title>
      
      <Alert
        message="Testing Date/Time Utility Functions"
        description="This demo tests the robust timestamp parsing and formatting functions designed to handle both Java LocalDateTime array format and ISO string format from the backend."
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      <Card title="Quick Tests" style={{ marginBottom: '24px' }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button type="primary" onClick={testAllFormats} size="large">
            Test All Sample Formats
          </Button>
          
          <Divider>Custom Input Test</Divider>
          
          <Paragraph>
            Enter a timestamp to test. Examples:
            <br />
            • Array format: <Text code>[2025, 7, 14, 12, 30, 0, 0]</Text>
            <br />
            • ISO string: <Text code>"2025-07-14T12:30:00.000Z"</Text>
            <br />
            • Unix timestamp: <Text code>1721649202153</Text>
          </Paragraph>
          
          <TextArea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder='Enter timestamp (e.g., [2025, 7, 14, 12, 30, 0, 0] or "2025-07-14T12:30:00.000Z")'
            rows={3}
          />
          
          <Button onClick={testCustomInput} disabled={!testInput.trim()}>
            Test Custom Input
          </Button>
        </Space>
      </Card>

      {results && (
        <Card title="Test Results" style={{ marginBottom: '24px' }}>
          <Table
            dataSource={results}
            columns={columns}
            pagination={false}
            scroll={{ x: 1200 }}
            size="small"
            rowKey="name"
          />
        </Card>
      )}

      <Card title="Sample Backend Response Simulation">
        <Paragraph>
          <Text strong>Simulated backend response with array format timestamps:</Text>
        </Paragraph>
        
        <pre style={{ 
          background: '#f5f5f5', 
          padding: '12px', 
          borderRadius: '4px',
          fontSize: '12px'
        }}>
{`{
  "id": 1,
  "senderId": 296,
  "recipientId": 101,
  "subject": "Thông báo về bài tập",
  "content": "Nhớ nộp bài tập toán trước ngày mai nhé.",
  "createdAt": [2025, 7, 12, 12, 13, 22, 153221000],
  "updatedAt": [2025, 7, 14, 10, 30, 0, 0],
  "readAt": null,
  "repliedAt": [2025, 7, 14, 11, 0, 0, 0]
}`}
        </pre>

        <Button 
          onClick={() => {
            const mockResponse = {
              id: 1,
              senderId: 296,
              recipientId: 101,
              subject: "Thông báo về bài tập",
              content: "Nhớ nộp bài tập toán trước ngày mai nhé.",
              createdAt: [2025, 7, 12, 12, 13, 22, 153221000],
              updatedAt: [2025, 7, 14, 10, 30, 0, 0],
              readAt: null,
              repliedAt: [2025, 7, 14, 11, 0, 0, 0]
            };

            console.log('🧪 Testing mock backend response:');
            console.log('Original response:', mockResponse);
            console.log('Parsed createdAt:', parseTimestamp(mockResponse.createdAt));
            console.log('Formatted createdAt:', formatTimestamp(mockResponse.createdAt));
            console.log('Parsed updatedAt:', parseTimestamp(mockResponse.updatedAt));
            console.log('Formatted updatedAt:', formatTimestamp(mockResponse.updatedAt));
            console.log('Parsed repliedAt:', parseTimestamp(mockResponse.repliedAt));
            console.log('Formatted repliedAt:', formatTimestamp(mockResponse.repliedAt));
            
            alert('Check console for detailed test results!');
          }}
          style={{ marginTop: '12px' }}
        >
          Test Mock Response (Check Console)
        </Button>
      </Card>
    </div>
  );
};

export default DateUtilsDemo;
