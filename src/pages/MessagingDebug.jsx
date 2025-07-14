import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Space, Spin, Alert, Divider } from 'antd';
import { useAuth } from '../context/AuthContext';
import apiClient from '../services/apiClient';

const { Title, Text, Paragraph } = Typography;

/**
 * Debug component to test messaging API endpoints
 */
const MessagingDebug = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({});
  const [error, setError] = useState(null);

  const userId = user?.id;
  const userRole = user?.role;

  const testEndpoint = async (name, url, description) => {
    console.log(`🧪 Testing ${name}: ${url}`);
    setLoading(true);
    
    try {
      const response = await apiClient.get(url);
      const result = {
        success: true,
        status: response.status,
        data: response.data,
        dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        timestamp: new Date().toLocaleTimeString()
      };
      
      setResults(prev => ({
        ...prev,
        [name]: result
      }));
      
      console.log(`✅ ${name} success:`, result);
      
    } catch (err) {
      const result = {
        success: false,
        status: err.response?.status || 'Network Error',
        error: err.message,
        errorData: err.response?.data,
        timestamp: new Date().toLocaleTimeString()
      };
      
      setResults(prev => ({
        ...prev,
        [name]: result
      }));
      
      console.error(`❌ ${name} failed:`, result);
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    setResults({});
    setError(null);
    
    if (!userId) {
      setError('User ID not found. Please login first.');
      return;
    }

    console.log(`🚀 Starting messaging API tests for User ID: ${userId}, Role: ${userRole}`);

    // Test endpoints sequentially
    await testEndpoint(
      'Student Messages', 
      `/student-messages/student/${userId}`,
      'Get messages received by student'
    );

    await testEndpoint(
      'Sent Messages', 
      `/student-messages/by-sender/${userId}`,
      'Get messages sent by user'
    );

    await testEndpoint(
      'Teachers List', 
      '/users/teachers',
      'Get list of all teachers'
    );

    await testEndpoint(
      'Student Classrooms', 
      `/classrooms/student/${userId}`,
      'Get classrooms for student'
    );

    await testEndpoint(
      'User Info', 
      `/users/${userId}`,
      'Get current user information'
    );

    console.log('🏁 All tests completed');
  };

  const renderResult = (name, result) => {
    if (!result) return null;

    return (
      <Card 
        key={name}
        size="small" 
        title={name}
        style={{ marginBottom: 16 }}
        extra={<Text type="secondary">{result.timestamp}</Text>}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Status: </Text>
            <Text type={result.success ? 'success' : 'danger'}>
              {result.status} {result.success ? '✅' : '❌'}
            </Text>
          </div>
          
          {result.success ? (
            <>
              <div>
                <Text strong>Data Type: </Text>
                <Text code>{result.dataType}</Text>
              </div>
              
              {result.dataLength !== 'N/A' && (
                <div>
                  <Text strong>Data Length: </Text>
                  <Text code>{result.dataLength}</Text>
                </div>
              )}
              
              <div>
                <Text strong>Sample Data:</Text>
                <Paragraph>
                  <pre style={{ 
                    fontSize: '11px', 
                    maxHeight: '200px', 
                    overflow: 'auto',
                    background: '#f5f5f5',
                    padding: '8px',
                    borderRadius: '4px'
                  }}>
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </Paragraph>
              </div>
            </>
          ) : (
            <>
              <div>
                <Text strong>Error: </Text>
                <Text type="danger">{result.error}</Text>
              </div>
              
              {result.errorData && (
                <div>
                  <Text strong>Error Details:</Text>
                  <Paragraph>
                    <pre style={{ 
                      fontSize: '11px', 
                      maxHeight: '100px', 
                      overflow: 'auto',
                      background: '#fff2f0',
                      padding: '8px',
                      borderRadius: '4px'
                    }}>
                      {JSON.stringify(result.errorData, null, 2)}
                    </pre>
                  </Paragraph>
                </div>
              )}
            </>
          )}
        </Space>
      </Card>
    );
  };

  if (!userId) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Authentication Required"
          description="Please login to test messaging APIs"
          type="warning"
          showIcon
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>🧪 Messaging API Debug Tool</Title>
          <Text type="secondary">
            Test messaging endpoints to debug loading issues
          </Text>
        </div>

        <Card>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Current User:</Text>
              <div style={{ marginLeft: 16 }}>
                <Text>ID: {userId}</Text><br/>
                <Text>Role: {userRole}</Text><br/>
                <Text>Name: {user?.fullName || user?.username || 'N/A'}</Text>
              </div>
            </div>
            
            <Divider />
            
            <Button 
              type="primary" 
              onClick={runAllTests}
              loading={loading}
              size="large"
            >
              {loading ? 'Testing APIs...' : 'Run All Tests'}
            </Button>
          </Space>
        </Card>

        {error && (
          <Alert
            message="Test Error"
            description={error}
            type="error"
            showIcon
          />
        )}

        {Object.keys(results).length > 0 && (
          <div>
            <Title level={3}>Test Results</Title>
            {Object.entries(results).map(([name, result]) => 
              renderResult(name, result)
            )}
          </div>
        )}

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>Testing APIs...</div>
          </div>
        )}
      </Space>
    </div>
  );
};

export default MessagingDebug;
