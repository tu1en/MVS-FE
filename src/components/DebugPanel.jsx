import { Button, Card, Collapse, Descriptions, Divider, Space, Table, Typography } from 'antd';
import React, { useState } from 'react';
import { safeDataSource } from '../utils/tableUtils';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

/**
 * Debug panel component for testing and debugging
 * @param {Object} props - Component props
 * @param {Object} props.data - Debug data
 * @param {Function} props.onRunTest - Function to run test
 * @returns {JSX.Element} DebugPanel component
 */
const DebugPanel = ({ 
  data = {}, 
  onRunTest,
  onRefresh,
  title = "Debug Panel",
  showControls = true,
  collapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapsed);

  const renderObjectAsTable = (obj) => {
    if (!obj) return <Text type="secondary">No data</Text>;
    
    const dataSource = Object.entries(obj).map(([key, value], index) => ({
      key: index,
      property: key,
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }));
    
    const columns = [
      { title: 'Property', dataIndex: 'property', key: 'property', width: '30%' },
      { title: 'Value', dataIndex: 'value', key: 'value', ellipsis: true }
    ];
    
    return (
      <Table 
        dataSource={safeDataSource(dataSource, 'DebugPanel')} 
        columns={columns} 
        size="small" 
        pagination={false} 
      />
    );
  };
  
  const renderArray = (array, title) => {
    if (!Array.isArray(array) || array.length === 0) {
      return <Text type="secondary">No items in {title}</Text>;
    }
    
    return (
      <>
        <Text strong>{title} ({array.length} items)</Text>
        <Collapse ghost>
          {array.map((item, index) => (
            <Panel header={`Item ${index + 1}`} key={index}>
              {typeof item === 'object' ? renderObjectAsTable(item) : item}
            </Panel>
          ))}
        </Collapse>
      </>
    );
  };

  return (
    <Card 
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>{title}</span>
          <Button size="small" onClick={() => setIsCollapsed(!isCollapsed)}>
            {isCollapsed ? 'Expand' : 'Collapse'}
          </Button>
        </div>
      }
      style={{ marginBottom: 16, opacity: 0.9 }}
    >
      {!isCollapsed && (
        <>
          {showControls && (
            <Space style={{ marginBottom: 16 }}>
              <Button 
                type="primary" 
                onClick={() => onRunTest && onRunTest()} 
                size="small"
              >
                Run Test
              </Button>
              
              <Button 
                onClick={() => onRefresh && onRefresh()} 
                size="small"
              >
                Refresh Data
              </Button>
            </Space>
          )}
          
          <Divider orientation="left">Current State</Divider>
          
          {Object.entries(data).map(([key, value]) => {
            if (Array.isArray(value)) {
              return (
                <div key={key} style={{ marginBottom: 16 }}>
                  {renderArray(value, key)}
                </div>
              );
            }
            
            if (typeof value === 'object' && value !== null) {
              return (
                <div key={key} style={{ marginBottom: 16 }}>
                  <Title level={5}>{key}</Title>
                  {renderObjectAsTable(value)}
                </div>
              );
            }
            
            return (
              <Descriptions key={key} size="small" column={1} bordered style={{ marginBottom: 16 }}>
                <Descriptions.Item label={key}>{value}</Descriptions.Item>
              </Descriptions>
            );
          })}
        </>
      )}
    </Card>
  );
};

export default DebugPanel; 