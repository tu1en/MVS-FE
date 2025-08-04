import React from 'react';
import { Card, Typography } from 'antd';

const { Title } = Typography;

const AccountantPayrollGeneration = () => {
  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <Title level={2}>Accountant Payroll Generation</Title>
        <p>Payroll generation functionality for accountants will be implemented here.</p>
      </Card>
    </div>
  );
};

export default AccountantPayrollGeneration;