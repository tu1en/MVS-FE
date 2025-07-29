import React, { useState, useEffect } from 'react';
import { Tabs, Card, Space, Button, Tooltip } from 'antd';
import { CalendarOutlined, DashboardOutlined, ClockCircleOutlined, PlusOutlined } from '@ant-design/icons';
import ShiftDashboard from '../../components/shift/ShiftDashboard';
import ShiftCalendar from '../../components/shift/ShiftCalendar';
import ShiftManagement from '../../components/hr/ShiftManagement';

const { TabPane } = Tabs;

/**
 * ManagerShifts Component - Trang quản lý ca làm việc cho Manager
 * Tích hợp dashboard overview, calendar view và shift management
 */
const ManagerShifts = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  const renderTabBar = (props, DefaultTabBar) => (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      marginBottom: 16,
      padding: '12px 24px',
      backgroundColor: '#fff',
      borderRadius: 8,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <DefaultTabBar {...props}>
        {node => (
          <div style={{ fontSize: 16, fontWeight: 500 }}>
            {node}
          </div>
        )}
      </DefaultTabBar>
      <Space>
        <Tooltip title="Làm mới dữ liệu">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              if (activeTab === 'calendar') {
                // Trigger calendar refresh
                window.dispatchEvent(new CustomEvent('refresh-shift-calendar'));
              } else if (activeTab === 'management') {
                // Trigger management refresh
                window.dispatchEvent(new CustomEvent('refresh-shift-management'));
              } else {
                handleRefresh();
              }
            }}
          >
            Ca Làm Mới
          </Button>
        </Tooltip>
        <Button
          icon={<ClockCircleOutlined />}
          onClick={handleRefresh}
        >
          Làm mới
        </Button>
      </Space>
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: '#f5f7fa', 
      minHeight: '100vh', 
      padding: '24px' 
    }}>
      <Card 
        title={
          <Space>
            <DashboardOutlined />
            <span>Quản Lý Ca Làm Việc</span>
          </Space>
        }
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: 'none'
        }}
        className="manager-shifts-container"
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          tabBarStyle={{ 
            marginBottom: 24,
            backgroundColor: '#fff',
            padding: '12px 16px',
            borderRadius: 8
          }}
        >
          <TabPane 
            tab={
              <Space>
                <DashboardOutlined />
                <span>Tổng quan</span>
              </Space>
            } 
            key="dashboard"
            className="shift-dashboard-tab"
          >
            <div key={`dashboard-${refreshKey}`}>
              <ShiftDashboard />
            </div>
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <CalendarOutlined />
                <span>Lịch Ca Làm Việc</span>
              </Space>
            } 
            key="calendar"
            className="shift-calendar-tab"
          >
            <div key={`calendar-${refreshKey}`}>
              <ShiftCalendar />
            </div>
          </TabPane>

          <TabPane 
            tab={
              <Space>
                <ClockCircleOutlined />
                <span>Quản Lý Ca</span>
              </Space>
            } 
            key="management"
            className="shift-management-tab"
          >
            <div key={`management-${refreshKey}`}>
              <ShiftManagement />
            </div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

// Add styles
const styles = `
  .manager-shifts-container .ant-card-head {
    border-bottom: 2px solid #f0f0f0;
  }
  
  .manager-shifts-container .ant-card-head-title {
    font-size: 24px;
    font-weight: 600;
    color: #262626;
  }
  
  .shift-dashboard-tab,
  .shift-calendar-tab,
  .shift-management-tab {
    margin-top: 16px;
  }
  
  .ant-tabs-nav {
    margin-bottom: 0 !important;
  }
  
  .ant-tabs-tab-active {
    font-weight: 600 !important;
  }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.type = 'text/css';
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

export default ManagerShifts;