import React, { useState, useEffect } from 'react';
import { Button, Card, Typography, Space, Alert, Divider, Tag } from 'antd';
import { useAuth } from '../context/AuthContext';
import { testMessagingAPIs, quickMessagingTest, checkAPIConnection } from '../utils/messagingApiTest';

const { Title, Text, Paragraph } = Typography;

/**
 * Quick messaging test page to debug loading issues
 */
const QuickMessagingTest = () => {
  const { user } = useAuth();
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [quickTestResult, setQuickTestResult] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);

  const userId = user?.id;
  const userRole = user?.role;

  // Auto-run quick test on mount
  useEffect(() => {
    if (userId) {
      runQuickTest();
      checkConnection();
    }
  }, [userId]);

  const runQuickTest = async () => {
    if (!userId) return;
    
    console.log('🚀 Running quick messaging test...');
    try {
      const result = await quickMessagingTest(userId);
      setQuickTestResult(result);
      console.log(`⚡ Quick test result: ${result ? 'PASS' : 'FAIL'}`);
    } catch (error) {
      console.error('❌ Quick test error:', error);
      setQuickTestResult(false);
    }
  };

  const checkConnection = async () => {
    console.log('🔗 Checking API connection...');
    try {
      const status = await checkAPIConnection();
      setConnectionStatus(status);
      console.log('🔗 Connection status:', status);
    } catch (error) {
      console.error('❌ Connection check error:', error);
      setConnectionStatus({ connected: false, error: error.message });
    }
  };

  const runFullTest = async () => {
    if (!userId) return;
    
    setLoading(true);
    console.log('🧪 Running full messaging API test...');
    
    try {
      const results = await testMessagingAPIs(userId, userRole);
      setTestResults(results);
      console.log('🧪 Full test completed:', results);
    } catch (error) {
      console.error('❌ Full test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (success) => {
    return success ? 'success' : 'error';
  };

  const getStatusText = (success) => {
    return success ? 'PASS' : 'FAIL';
  };

  if (!userId) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Authentication Required"
          description="Please login to run messaging tests"
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
          <Title level={2}>⚡ Quick Messaging Test</Title>
          <Text type="secondary">
            Fast diagnosis of messaging API issues
          </Text>
        </div>

        {/* User Info */}
        <Card title="👤 Current User" size="small">
          <Space direction="vertical">
            <Text><strong>ID:</strong> {userId}</Text>
            <Text><strong>Role:</strong> {userRole}</Text>
            <Text><strong>Name:</strong> {user?.fullName || user?.username || 'N/A'}</Text>
          </Space>
        </Card>

        {/* Connection Status */}
        {connectionStatus && (
          <Card title="🔗 API Connection" size="small">
            <Space>
              <Tag color={connectionStatus.connected ? 'green' : 'red'}>
                {connectionStatus.connected ? 'CONNECTED' : 'DISCONNECTED'}
              </Tag>
              <Tag color={connectionStatus.authenticated ? 'green' : 'orange'}>
                {connectionStatus.authenticated ? 'AUTHENTICATED' : 'AUTH ISSUE'}
              </Tag>
              {connectionStatus.error && (
                <Text type="danger">{connectionStatus.error}</Text>
              )}
            </Space>
          </Card>
        )}

        {/* Quick Test Result */}
        {quickTestResult !== null && (
          <Card title="⚡ Quick Test Result" size="small">
            <Space>
              <Tag color={getStatusColor(quickTestResult)}>
                {getStatusText(quickTestResult)}
              </Tag>
              <Text>
                {quickTestResult 
                  ? 'Essential messaging endpoints are working' 
                  : 'Essential messaging endpoints have issues'
                }
              </Text>
            </Space>
          </Card>
        )}

        {/* Action Buttons */}
        <Card>
          <Space>
            <Button onClick={runQuickTest} loading={loading}>
              Re-run Quick Test
            </Button>
            <Button onClick={checkConnection} loading={loading}>
              Check Connection
            </Button>
            <Button type="primary" onClick={runFullTest} loading={loading}>
              Run Full Test
            </Button>
          </Space>
        </Card>

        {/* Full Test Results */}
        {testResults && (
          <Card title="🧪 Full Test Results">
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* Summary */}
              <div>
                <Title level={4}>📊 Summary</Title>
                <Space>
                  <Tag color="blue">Total: {testResults.summary.total}</Tag>
                  <Tag color="green">Passed: {testResults.summary.passed}</Tag>
                  <Tag color="red">Failed: {testResults.summary.failed}</Tag>
                  <Tag color="purple">Success Rate: {testResults.summary.successRate}%</Tag>
                  {testResults.summary.criticalErrors > 0 && (
                    <Tag color="red">Critical Errors: {testResults.summary.criticalErrors}</Tag>
                  )}
                </Space>
              </div>

              <Divider />

              {/* Individual Test Results */}
              <div>
                <Title level={4}>📋 Test Details</Title>
                <Space direction="vertical" style={{ width: '100%' }}>
                  {Object.entries(testResults.tests).map(([name, test]) => (
                    <Card key={name} size="small" style={{ width: '100%' }}>
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <div>
                          <Space>
                            <Tag color={getStatusColor(test.success)}>
                              {getStatusText(test.success)}
                            </Tag>
                            <Text strong>{name}</Text>
                            <Text type="secondary">({test.duration}ms)</Text>
                            {test.critical && <Tag color="orange">CRITICAL</Tag>}
                          </Space>
                        </div>
                        
                        <Text type="secondary">{test.description}</Text>
                        <Text code style={{ fontSize: '11px' }}>{test.url}</Text>
                        
                        {test.success ? (
                          <div>
                            <Text type="success">
                              Status: {test.status} | 
                              Data: {test.dataType} ({test.dataLength} items)
                            </Text>
                          </div>
                        ) : (
                          <div>
                            <Text type="danger">
                              Status: {test.status} | Error: {test.error}
                            </Text>
                          </div>
                        )}
                      </Space>
                    </Card>
                  ))}
                </Space>
              </div>

              {/* Recommendations */}
              {testResults.summary.criticalErrors > 0 && (
                <>
                  <Divider />
                  <Alert
                    message="Critical Issues Found"
                    description="Some critical endpoints are failing. This will cause loading issues in the messaging interface."
                    type="error"
                    showIcon
                  />
                </>
              )}

              {testResults.summary.successRate < 80 && (
                <>
                  <Divider />
                  <Alert
                    message="Low Success Rate"
                    description="Many endpoints are failing. Check backend server status and authentication."
                    type="warning"
                    showIcon
                  />
                </>
              )}
            </Space>
          </Card>
        )}
      </Space>
    </div>
  );
};

export default QuickMessagingTest;
