import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Collapse, Tag, Alert, Spin } from 'antd';
import { BugOutlined, PlayCircleOutlined, DownloadOutlined, ClearOutlined } from '@ant-design/icons';
import AssignmentDebugUtils from '../../utils/assignmentDebugUtils';
import { useAuth } from '../../context/AuthContext';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * Debug panel component for assignment functionality testing
 * Only shows in development mode or when explicitly enabled
 */
const AssignmentDebugPanel = ({ visible = false, classroomId = null }) => {
  const [isVisible, setIsVisible] = useState(visible);
  const [testResults, setTestResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [debugReport, setDebugReport] = useState(null);
  const { user } = useAuth();

  // Only show in development or when explicitly enabled
  const shouldShow = process.env.NODE_ENV === 'development' || visible;

  useEffect(() => {
    // Auto-run basic tests when component mounts in development
    if (shouldShow && process.env.NODE_ENV === 'development') {
      setTimeout(() => {
        runBasicTests();
      }, 2000);
    }
  }, [shouldShow]);

  const runBasicTests = async () => {
    setIsRunning(true);
    try {
      const results = await AssignmentDebugUtils.runComprehensiveTest();
      setTestResults(results);
    } catch (error) {
      console.error('Debug test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const runAssignmentCreationTest = async () => {
    if (!classroomId) {
      alert('Classroom ID is required for assignment creation test');
      return;
    }
    
    setIsRunning(true);
    try {
      const results = await AssignmentDebugUtils.testAssignmentCreation(classroomId);
      console.log('Assignment creation test results:', results);
    } catch (error) {
      console.error('Assignment creation test failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const generateFullReport = async () => {
    setIsRunning(true);
    try {
      const report = await AssignmentDebugUtils.generateDebugReport();
      setDebugReport(report);
    } catch (error) {
      console.error('Debug report generation failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadReport = () => {
    if (!debugReport) return;
    
    const dataStr = JSON.stringify(debugReport, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `assignment-debug-report-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const clearResults = () => {
    setTestResults(null);
    setDebugReport(null);
  };

  if (!shouldShow) {
    return null;
  }

  return (
    <Card
      title={
        <Space>
          <BugOutlined />
          <Title level={4} style={{ margin: 0 }}>Assignment Debug Panel</Title>
          <Tag color="orange">Development Mode</Tag>
        </Space>
      }
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 400,
        maxHeight: '70vh',
        overflow: 'auto',
        zIndex: 1000,
        display: isVisible ? 'block' : 'none'
      }}
      extra={
        <Button 
          size="small" 
          onClick={() => setIsVisible(!isVisible)}
          type={isVisible ? 'primary' : 'default'}
        >
          {isVisible ? 'Hide' : 'Show'}
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <Alert
          message="Debug Mode Active"
          description="This panel helps debug assignment functionality. It's only visible in development mode."
          type="info"
          showIcon
          closable
        />

        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlayCircleOutlined />}
            onClick={runBasicTests}
            loading={isRunning}
            size="small"
          >
            Run Basic Tests
          </Button>
          
          {classroomId && (
            <Button 
              icon={<PlayCircleOutlined />}
              onClick={runAssignmentCreationTest}
              loading={isRunning}
              size="small"
            >
              Test Creation
            </Button>
          )}
          
          <Button 
            icon={<DownloadOutlined />}
            onClick={generateFullReport}
            loading={isRunning}
            size="small"
          >
            Full Report
          </Button>
          
          <Button 
            icon={<ClearOutlined />}
            onClick={clearResults}
            size="small"
          >
            Clear
          </Button>
        </Space>

        {/* User Context Info */}
        <Card size="small" title="User Context">
          <Text strong>User ID:</Text> {user?.id || 'Not available'}<br/>
          <Text strong>Role:</Text> {user?.role || 'Not available'}<br/>
          <Text strong>Email:</Text> {user?.email || 'Not available'}<br/>
          <Text strong>Token:</Text> {localStorage.getItem('token') ? 'Present' : 'Missing'}<br/>
          {classroomId && (
            <>
              <Text strong>Classroom ID:</Text> {classroomId}
            </>
          )}
        </Card>

        {/* Test Results */}
        {testResults && (
          <Collapse size="small">
            <Panel header="Test Results" key="1">
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text strong>All Assignments:</Text> 
                  <Tag color={testResults.getAllAssignments ? 'green' : 'red'}>
                    {testResults.getAllAssignments ? `${testResults.getAllAssignments.length} found` : 'Failed'}
                  </Tag>
                </div>
                
                <div>
                  <Text strong>Teacher Assignments:</Text> 
                  <Tag color={testResults.getCurrentTeacherAssignments ? 'green' : 'red'}>
                    {testResults.getCurrentTeacherAssignments ? `${testResults.getCurrentTeacherAssignments.length} found` : 'Failed'}
                  </Tag>
                </div>
                
                <div>
                  <Text strong>Student Assignments:</Text> 
                  <Tag color={testResults.getCurrentStudentAssignments ? 'green' : 'red'}>
                    {testResults.getCurrentStudentAssignments ? `${testResults.getCurrentStudentAssignments.length} found` : 'Failed'}
                  </Tag>
                </div>

                {testResults.errors.length > 0 && (
                  <div>
                    <Text strong>Errors:</Text>
                    {testResults.errors.map((error, index) => (
                      <div key={index}>
                        <Tag color="red">{error.method}</Tag>
                        <Text type="danger">{error.error}</Text>
                      </div>
                    ))}
                  </div>
                )}
              </Space>
            </Panel>
          </Collapse>
        )}

        {/* Debug Report */}
        {debugReport && (
          <Collapse size="small">
            <Panel header="Debug Report" key="2">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button 
                  type="link" 
                  icon={<DownloadOutlined />}
                  onClick={downloadReport}
                  size="small"
                >
                  Download Full Report
                </Button>
                
                <div>
                  <Text strong>Timestamp:</Text> {debugReport.timestamp}
                </div>
                
                <div>
                  <Text strong>Total Errors:</Text> 
                  <Tag color={debugReport.tests.comprehensive.errors.length > 0 ? 'red' : 'green'}>
                    {debugReport.tests.comprehensive.errors.length}
                  </Tag>
                </div>

                {debugReport.dataAnalysis && (
                  <div>
                    <Text strong>Data Analysis:</Text>
                    <div style={{ marginLeft: 16 }}>
                      <div>Valid: <Tag color={debugReport.dataAnalysis.valid ? 'green' : 'red'}>{debugReport.dataAnalysis.valid ? 'Yes' : 'No'}</Tag></div>
                      <div>Count: {debugReport.dataAnalysis.count}</div>
                      {debugReport.dataAnalysis.issues.length > 0 && (
                        <div>Issues: {debugReport.dataAnalysis.issues.join(', ')}</div>
                      )}
                    </div>
                  </div>
                )}
              </Space>
            </Panel>
          </Collapse>
        )}

        {isRunning && (
          <div style={{ textAlign: 'center' }}>
            <Spin />
            <Text style={{ marginLeft: 8 }}>Running tests...</Text>
          </div>
        )}
      </Space>
    </Card>
  );
};

export default AssignmentDebugPanel;
