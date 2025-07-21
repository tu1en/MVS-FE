import { ApiOutlined, PlayCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { Alert, Card, Tabs } from 'antd';
import { useState } from 'react';
import SystemSettingsPage from './SystemSettingsPage';
import SystemWorkflowEditor from './SystemWorkflowEditor';

const { TabPane } = Tabs;

/**
 * AdminModulesDemo - Trang demo cho 2 modules admin
 * Bao gồm hướng dẫn sử dụng và test credentials
 */
const AdminModulesDemo = () => {
  const [activeTab, setActiveTab] = useState('settings');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <Card className="shadow-lg mb-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">
              🚀 Admin Modules Demo
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              System Settings & Workflow Editor - Hoàn chỉnh Backend + Frontend
            </p>
            
            <Alert
              message="Demo Credentials"
              description={
                <div className="text-left">
                  <p><strong>Username:</strong> admin</p>
                  <p><strong>Password:</strong> admin123</p>
                  <p><strong>API Base:</strong> http://localhost:8088</p>
                </div>
              }
              type="info"
              showIcon
              className="text-left max-w-md mx-auto"
            />
          </div>
        </Card>

        {/* Main Content */}
        <Card className="shadow-lg">
          <Tabs 
            activeKey={activeTab} 
            onChange={setActiveTab}
            size="large"
            centered
            items={[
              {
                key: 'settings',
                label: (
                  <span>
                    <SettingOutlined />
                    System Settings
                  </span>
                ),
                children: <SystemSettingsPage />
              },
              {
                key: 'workflow',
                label: (
                  <span>
                    <PlayCircleOutlined />
                    Workflow Editor
                  </span>
                ),
                children: <SystemWorkflowEditor />
              },
              {
                key: 'api',
                label: (
                  <span>
                    <ApiOutlined />
                    API Documentation
                  </span>
                ),
                children: (
                  <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-3">System Settings APIs</h3>
                        <div className="space-y-2 text-sm">
                          <div className="bg-green-100 p-2 rounded">
                            <span className="font-mono">GET /api/admin/system-settings</span>
                          </div>
                          <div className="bg-blue-100 p-2 rounded">
                            <span className="font-mono">PUT /api/admin/system-settings</span>
                          </div>
                          <div className="bg-yellow-100 p-2 rounded">
                            <span className="font-mono">POST /api/admin/system-settings/test-smtp</span>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-3">Workflow APIs</h3>
                        <div className="space-y-2 text-sm">
                          <div className="bg-green-100 p-2 rounded">
                            <span className="font-mono">GET /api/admin/workflows</span>
                          </div>
                          <div className="bg-blue-100 p-2 rounded">
                            <span className="font-mono">POST /api/admin/workflows</span>
                          </div>
                          <div className="bg-purple-100 p-2 rounded">
                            <span className="font-mono">GET /api/admin/workflows/{id}/export</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-gray-100 rounded">
                      <h4 className="font-semibold mb-2">Quick Test:</h4>
                      <p className="text-sm text-gray-600">
                        1. Start backend: <code className="bg-white px-2 py-1 rounded">mvn spring-boot:run</code><br/>
                        2. Start frontend: <code className="bg-white px-2 py-1 rounded">npm start</code><br/>
                        3. Access: <code className="bg-white px-2 py-1 rounded">http://localhost:3000</code>
                      </p>
                    </div>
                  </div>
                )
              }
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

export default AdminModulesDemo;

export default AdminModulesDemo;
