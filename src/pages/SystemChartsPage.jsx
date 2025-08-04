import {
  BarChartOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Modal,
  Popconfirm,
  Row,
  Space,
  Table,
  Tag,
  Typography
} from 'antd';
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

const { Title } = Typography;

const SystemChartsPage = () => {
  const [charts, setCharts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0
  });

  const columns = [
    {
      title: 'Tiêu đề',
      dataIndex: 'title',
      key: 'title',
      width: 200
    },
    {
      title: 'Loại biểu đồ',
      dataIndex: 'chartType',
      key: 'chartType',
      width: 120,
      render: (type) => {
        const typeColors = {
          BAR: 'blue',
          LINE: 'green',
          PIE: 'orange',
          AREA: 'purple'
        };
        return <Tag color={typeColors[type] || 'default'}>{type}</Tag>;
      }
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublic',
      key: 'isPublic',
      width: 100,
      render: (isPublic) => (
        <Tag color={isPublic ? 'green' : 'default'}>
          {isPublic ? 'Công khai' : 'Riêng tư'}
        </Tag>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewChart(record)}
          />
          <Button
            type="text"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditChart(record)}
          />
          <Popconfirm
            title="Bạn có chắc muốn xóa biểu đồ này?"
            onConfirm={() => handleDeleteChart(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button
              type="text"
              size="small"
              icon={<DeleteOutlined />}
              danger
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  const fetchCharts = async (page = 1, size = 20) => {
    setLoading(true);
    try {
      const response = await adminService.getSystemCharts(page - 1, size);
      if (response.success) {
        setCharts(response.data.content || []);
        setPagination({
          current: page,
          pageSize: size,
          total: response.data.totalElements || 0
        });
      }
    } catch (error) {
      console.error('Error fetching charts:', error);
    }
    setLoading(false);
  };

  const handleTableChange = (pagination) => {
    fetchCharts(pagination.current, pagination.pageSize);
  };

  const handleViewChart = (chart) => {
    Modal.info({
      title: `Biểu đồ: ${chart.title}`,
      content: (
        <div>
          <p><strong>Loại:</strong> {chart.chartType}</p>
          <p><strong>Mô tả:</strong> {chart.description}</p>
          <p><strong>Dữ liệu:</strong></p>
          <pre style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px' }}>
            {JSON.stringify(JSON.parse(chart.chartData || '{}'), null, 2)}
          </pre>
        </div>
      ),
      width: 600
    });
  };

  const handleEditChart = (chart) => {
    // TODO: Implement edit functionality
    console.log('Edit chart:', chart);
  };

  const handleDeleteChart = async (chartId) => {
    try {
      const response = await adminService.deleteSystemChart(chartId);
      if (response.success) {
        fetchCharts(pagination.current, pagination.pageSize);
      }
    } catch (error) {
      console.error('Error deleting chart:', error);
    }
  };

  const handleCreateChart = () => {
    // TODO: Implement create functionality
    console.log('Create new chart');
  };

  useEffect(() => {
    fetchCharts();
  }, []);

  return (
    <div className="p-6">
      <Card>
        <div className="mb-4 flex justify-between items-center">
          <Title level={2}>
            <BarChartOutlined className="mr-2" />
            Quản lý biểu đồ hệ thống
          </Title>
          <Space>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={handleCreateChart}
            >
              Tạo biểu đồ mới
            </Button>
            <Button 
              icon={<ReloadOutlined />}
              onClick={() => fetchCharts(pagination.current, pagination.pageSize)}
            >
              Làm mới
            </Button>
          </Space>
        </div>

        {/* Statistics Cards */}
        <Row gutter={16} className="mb-4">
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{charts.length}</div>
                <div className="text-gray-500">Tổng số biểu đồ</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {charts.filter(c => c.isPublic).length}
                </div>
                <div className="text-gray-500">Biểu đồ công khai</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {charts.filter(c => c.chartType === 'BAR').length}
                </div>
                <div className="text-gray-500">Biểu đồ cột</div>
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {charts.filter(c => c.chartType === 'PIE').length}
                </div>
                <div className="text-gray-500">Biểu đồ tròn</div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Charts Table */}
        <Table
          columns={columns}
          dataSource={charts}
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} của ${total} biểu đồ`
          }}
          onChange={handleTableChange}
          scroll={{ x: 1000 }}
        />
      </Card>
    </div>
  );
};

export default SystemChartsPage;