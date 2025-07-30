import React, { useState } from 'react';
import { Tabs, Card } from 'antd';
import {
  ClockCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import ShiftManagement from './ShiftManagement';
import ShiftAssignment from './ShiftAssignment';

const { TabPane } = Tabs;

/**
 * Dashboard chính cho HR Management
 * Chỉ dành cho Manager và Admin
 */
const HRDashboard = () => {
  const [activeTab, setActiveTab] = useState('shifts');

  const tabItems = [
    {
      key: 'shifts',
      label: (
        <span>
          <ClockCircleOutlined />
          Quản lý Ca làm việc
        </span>
      ),
      children: <ShiftManagement />
    },
    {
      key: 'assignments',
      label: (
        <span>
          <UserOutlined />
          Phân công Ca
        </span>
      ),
      children: <ShiftAssignment />
    },
    {
      key: 'schedule',
      label: (
        <span>
          <CalendarOutlined />
          Lịch làm việc
        </span>
      ),
      children: (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CalendarOutlined style={{ fontSize: '48px', color: '#ccc' }} />
            <h3 style={{ color: '#999', marginTop: '16px' }}>
              Tính năng Lịch làm việc đang được phát triển
            </h3>
            <p style={{ color: '#999' }}>
              Sẽ hiển thị lịch làm việc của tất cả nhân viên theo ca
            </p>
          </div>
        </Card>
      )
    },
    {
      key: 'reports',
      label: (
        <span>
          <BarChartOutlined />
          Báo cáo
        </span>
      ),
      children: (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <BarChartOutlined style={{ fontSize: '48px', color: '#ccc' }} />
            <h3 style={{ color: '#999', marginTop: '16px' }}>
              Tính năng Báo cáo đang được phát triển
            </h3>
            <p style={{ color: '#999' }}>
              Sẽ hiển thị các báo cáo về ca làm việc và chấm công
            </p>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div style={{ padding: '24px', minHeight: '100vh', backgroundColor: '#f0f2f5' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
          Hệ thống Quản lý Nhân sự (HR)
        </h1>
        <p style={{ margin: '8px 0 0 0', color: '#666' }}>
          Quản lý ca làm việc và phân công nhân viên
        </p>
      </div>

      <Card>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          size="large"
          items={tabItems}
        />
      </Card>
    </div>
  );
};

export default HRDashboard;
