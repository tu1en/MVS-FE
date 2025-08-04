import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const AccountantAttendanceReports = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>Accountant Attendance Reports</Title>
        <p>Attendance reporting functionality for accountants will be implemented here.</p>
      </Card>
    </div>
  );
};

export default AccountantAttendanceReports;