import React from 'react';
import { Table } from 'antd';
import { safeDataSource } from '../utils/tableUtils';
import TableErrorBoundary from './TableErrorBoundary';

/**
 * A wrapper around Ant Design Table that ensures dataSource is always an array
 * and provides error boundary protection
 */
const SafeTable = ({ dataSource, componentName = 'SafeTable', ...props }) => {
  const safeData = safeDataSource(dataSource, componentName);
  
  return (
    <TableErrorBoundary>
      <Table
        {...props}
        dataSource={safeData}
      />
    </TableErrorBoundary>
  );
};

export default SafeTable;