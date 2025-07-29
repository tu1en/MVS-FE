import { DownloadOutlined, FileExcelOutlined, FilePdfOutlined } from '@ant-design/icons';
import { Button, Card, Col, DatePicker, Row, Space, Table, Typography } from 'antd';
import { useEffect, useState } from 'react';
import api from '../../services/api.js';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const FinancialReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState([]);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await api.get('/accountant/reports/summary');
      setReports(response.data || []);
    } catch (error) {
      console.error('Lỗi khi lấy báo cáo:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (reportType, dateRange) => {
    try {
      const params = {
        reportType,
        startDate: dateRange[0],
        endDate: dateRange[1]
      };
      
      const response = await api.get(`/accountant/reports/generate`, { params });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report.pdf`;
      a.click();
    } catch (error) {
      console.error('Lỗi khi tạo báo cáo:', error);
    }
  };

  const reportTypes = [
    {
      title: 'Báo cáo doanh thu',
      description: 'Phân tích doanh thu hàng tháng',
      icon: <FileExcelOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
    },
    {
      title: 'Báo cáo thu tiền',
      description: 'Theo dõi các khoản thu và còn nợ',
      icon: <FilePdfOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
    },
    {
      title: 'Báo cáo tài khoản học viên',
      description: 'Xem số dư và hoạt động của học viên',
      icon: <FileExcelOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
    },
    {
      title: 'Báo cáo tùy chỉnh',
      description: 'Tạo báo cáo theo thông số tùy chỉnh',
      icon: <DownloadOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
    },
  ];

  const recentReports = [
    {
      key: '1',
      name: 'Báo cáo doanh thu tháng',
      date: '2024-01-15',
      type: 'Doanh thu',
      size: '2.3 MB',
    },
    {
      key: '2',
      name: 'Tổng hợp thu tiền',
      date: '2024-01-10',
      type: 'Thu tiền',
      size: '1.8 MB',
    },
  ];

  const columns = [
    {
      title: 'Tên báo cáo',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Dung lượng',
      dataIndex: 'size',
      key: 'size',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<DownloadOutlined />} type="link">
            Tải xuống
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>Báo cáo tài chính</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col span={24}>
          <Card title="Tạo báo cáo">
            <Space direction="vertical" size="middle" style={{ width: '100%' }}>
              <Space>
                <RangePicker onChange={setDateRange} placeholder={['Ngày bắt đầu', 'Ngày kết thúc']} />
              </Space>
              <Row gutter={[16, 16]}>
                {reportTypes.map((report, index) => (
                  <Col xs={24} sm={12} md={6} key={index}>
                    <Card 
                      hoverable 
                      style={{ textAlign: 'center', cursor: 'pointer' }}
                      onClick={() => dateRange && dateRange.length === 2 && generateReport(report.title.split(' ')[0], dateRange)}
                    >
                      {report.icon}
                      <Title level={4} style={{ marginTop: 12, fontSize: 16 }}>
                        {report.title}
                      </Title>
                      <div style={{ fontSize: 12, color: '#666' }}>
                        {report.description}
                      </div>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Space>
          </Card>
        </Col>
      </Row>

      <Card title="Báo cáo gần đây">
        <Table
          columns={columns}
          dataSource={recentReports}
          pagination={false}
          loading={loading}
        />
      </Card>
    </div>
  );
};

export default FinancialReports;
