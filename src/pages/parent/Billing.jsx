import {
  CheckCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  MoneyCollectOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Empty,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Typography
} from 'antd';
import moment from 'moment';
import 'moment/locale/vi';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

moment.locale('vi');

/**
 * Parent Billing Page - View paid amount and invoices only
 * Simplified version showing only paid amount and invoice list
 */
const ParentBilling = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [billingData, setBillingData] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [payments, setPayments] = useState([]);
  const [dateRange, setDateRange] = useState([
    moment().subtract(6, 'months'),
    moment()
  ]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingDoc, setDownloadingDoc] = useState(null);

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChild && dateRange) {
      loadBillingData();
    }
  }, [selectedChild, dateRange]);

  const loadChildren = async () => {
    try {
      setLoading(true);
      const response = await api.get('/parent/children');
      setChildren(response.data);
      
      if (response.data.length > 0) {
        setSelectedChild(response.data[0]);
      }
    } catch (error) {
      console.error('Error loading children:', error);
      message.error('Không thể tải danh sách con');
    } finally {
      setLoading(false);
    }
  };

  const loadBillingData = async () => {
    if (!selectedChild || !dateRange) return;

    try {
      setLoading(true);
      
      const [startDate, endDate] = dateRange;
      const response = await api.get(`/parent/children/${selectedChild.studentId}/billing`, {
        params: {
          startDate: startDate.format('YYYY-MM-DD'),
          endDate: endDate.format('YYYY-MM-DD')
        }
      });
      
      setBillingData(response.data);
      setInvoices(response.data.invoices || []);
      setPayments(response.data.payments || []);
    } catch (error) {
      console.error('Error loading billing data:', error);
      message.error('Không thể tải thông tin tài chính');
      setBillingData(null);
      setInvoices([]);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  const downloadDocument = async (documentId, type, filename) => {
    try {
      setDownloadingDoc(documentId);
      
      // Try different possible endpoints and approaches
      let response;
      let downloadUrl;
      
      try {
        // First try the original endpoint with type parameter
        response = await api.get(`/parent/billing/download/${documentId}`, {
          params: { type },
          responseType: 'blob'
        });
        downloadUrl = response.data;
      } catch (firstError) {
        console.log('First attempt failed, trying alternative endpoint...');
        
        try {
          // Try alternative endpoint structure
          response = await api.get(`/parent/billing/${documentId}/download`, {
            params: { type },
            responseType: 'blob'
          });
          downloadUrl = response.data;
        } catch (secondError) {
          console.log('Second attempt failed, trying without type parameter...');
          
          try {
            // Try without type parameter
            response = await api.get(`/parent/billing/${documentId}/download`, {
              responseType: 'blob'
            });
            downloadUrl = response.data;
          } catch (thirdError) {
            // Try getting the download URL instead of blob
            try {
              const urlResponse = await api.get(`/parent/billing/${documentId}/download-url`);
              if (urlResponse.data?.downloadUrl) {
                // If we get a URL, download from that URL
                const link = document.createElement('a');
                link.href = urlResponse.data.downloadUrl;
                link.setAttribute('download', filename || `${type}_${documentId}.pdf`);
                link.setAttribute('target', '_blank');
                document.body.appendChild(link);
                link.click();
                link.remove();
                message.success('Tải xuống thành công');
                return;
              }
            } catch (urlError) {
              console.log('URL approach also failed');
            }
            
            // If all attempts fail, throw the last error
            throw thirdError;
          }
        }
      }
      
      if (!downloadUrl) {
        throw new Error('No data received from server');
      }
      
      // Create blob link to download
      const blob = new Blob([downloadUrl], { 
        type: response.headers['content-type'] || 'application/pdf' 
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename || `${type}_${documentId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Tải xuống thành công');
    } catch (error) {
      console.error('Error downloading document:', error);
      
      // More specific error messages based on error type
      if (error.response?.status === 404) {
        message.error('Tài liệu không tồn tại');
      } else if (error.response?.status === 403) {
        message.error('Không có quyền tải xuống tài liệu này');
      } else if (error.response?.status === 500) {
        message.error('Lỗi server - vui lòng liên hệ admin để kiểm tra');
      } else if (error.response?.status >= 500) {
        message.error('Lỗi server, vui lòng thử lại sau');
      } else if (error.message === 'No data received from server') {
        message.error('Server không trả về dữ liệu, vui lòng thử lại');
      } else {
        message.error('Không thể tải xuống tài liệu. Vui lòng thử lại sau.');
      }
    } finally {
      setDownloadingDoc(null);
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PARTIAL': return 'warning';
      case 'OVERDUE': return 'error';
      case 'PENDING': return 'processing';
      default: return 'default';
    }
  };

  const getPaymentStatusText = (status) => {
    switch (status) {
      case 'PAID': return 'Đã thanh toán';
      case 'PARTIAL': return 'Thanh toán một phần';
      case 'OVERDUE': return 'Quá hạn';
      case 'PENDING': return 'Chờ thanh toán';
      default: return status;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const invoiceColumns = [
    {
      title: 'Số hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text, record) => (
        <Space>
          <Text strong>{text}</Text>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setSelectedInvoice(record);
              setDetailModalVisible(true);
            }}
          >
            Xem
          </Button>
        </Space>
      )
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY')
    },

    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => <Text strong>{formatCurrency(amount)}</Text>
    },
    {
      title: 'Đã thanh toán',
      dataIndex: 'paidAmount',
      key: 'paidAmount',
      render: (amount) => formatCurrency(amount || 0)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)}>
          {getPaymentStatusText(status)}
        </Tag>
      )
    },
    // {
    //   title: 'Thao tác',
    //   key: 'actions',
    //   render: (_, record) => (
    //     <Space>
    //       <Tooltip title="Tải hóa đơn">
    //         <Button
    //           type="primary"
    //           size="small"
    //           icon={<DownloadOutlined />}
    //           loading={downloadingDoc === record.id}
    //           onClick={() => downloadDocument(
    //             record.id, 
    //             'invoice', 
    //             `hoa_don_${record.invoiceNumber}.pdf`
    //           )}
    //         />
    //       </Tooltip>
    //       {record.status === 'PAID' && record.receiptId && (
    //         <Tooltip title="Tải biên lai">
    //           <Button
    //             size="small"
    //             icon={<FileTextOutlined />}
    //             loading={downloadingDoc === record.id}
    //             onClick={() => downloadDocument(
    //               record.receiptId, 
    //             'receipt', 
    //             `bien_lai_${record.invoiceNumber}.pdf`
    //           )}
    //         />
    //       </Tooltip>
    //     )}
    //   </Space>
    //   )
    // }
  ];

  const paymentColumns = [
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
    },
    {
      title: 'Hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber'
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => <Text strong>{formatCurrency(amount)}</Text>
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      render: (method) => {
        const methodMap = {
          'CASH': 'Tiền mặt',
          'BANK_TRANSFER': 'Chuyển khoản',
          'CARD': 'Thẻ',
          'ONLINE': 'Thanh toán online'
        };
        return methodMap[method] || method;
      }
    },
    {
      title: 'Ghi chú',
      dataIndex: 'note',
      key: 'note'
    },
    {
      title: 'Biên lai',
      key: 'receipt',
      render: (_, record) => (
        record.receiptId && (
          <Button
            size="small"
            icon={<DownloadOutlined />}
            loading={downloadingDoc === record.receiptId}
            onClick={() => downloadDocument(
              record.receiptId, 
              'receipt', 
              `bien_lai_${record.id}.pdf`
            )}
          >
            Tải
          </Button>
        )
      )
    }
  ];

  const renderSummaryCards = () => {
    if (!billingData) return null;

    const summary = billingData.summary || {};
    
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} lg={8}>
          <Card>
            <Statistic
              title="Đã thanh toán"
              value={summary.totalPaid || 0}
              formatter={(value) => formatCurrency(value)}
              valueStyle={{ color: '#3f8600' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>
    );
  };

  const renderInvoiceDetail = () => {
    if (!selectedInvoice) return null;

    const items = selectedInvoice.items || [];

    return (
      <Modal
        title={`Chi tiết hóa đơn ${selectedInvoice.invoiceNumber}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          // <Button
          //   key="download"
          //   type="primary"
          //   icon={<DownloadOutlined />}
          //   onClick={() => downloadDocument(
          //     selectedInvoice.id, 
          //     'invoice', 
          //     `hoa_don_${selectedInvoice.invoiceNumber}.pdf`
          //   )}
          // >
          //   Tải hóa đơn
          // </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={700}
      >
                 <Descriptions bordered column={2} size="small">
           <Descriptions.Item label="Số hóa đơn" span={2}>
             {selectedInvoice.invoiceNumber}
           </Descriptions.Item>
           <Descriptions.Item label="Ngày tạo">
             {moment(selectedInvoice.createdAt).format('DD/MM/YYYY HH:mm')}
           </Descriptions.Item>
           <Descriptions.Item label="Trạng thái">
             <Tag color={selectedInvoice.status === 'PAID' ? 'success' : 'processing'}>
               {selectedInvoice.status === 'PAID' ? 'Đã thanh toán' : 'Chờ thanh toán'}
             </Tag>
           </Descriptions.Item>
           <Descriptions.Item label="Tổng tiền">
             <Text strong>{formatCurrency(selectedInvoice.totalAmount)}</Text>
           </Descriptions.Item>
         </Descriptions>

        <Divider>Chi tiết các khoản</Divider>
        
        <Table
          dataSource={items}
          pagination={false}
          size="small"
          columns={[
            {
              title: 'Mô tả',
              dataIndex: 'description',
              key: 'description'
            },
            {
              title: 'Số lượng',
              dataIndex: 'quantity',
              key: 'quantity',
              width: 80,
              align: 'center'
            },
            {
              title: 'Đơn giá',
              dataIndex: 'unitPrice',
              key: 'unitPrice',
              width: 120,
              align: 'right',
              render: (price) => formatCurrency(price)
            },
            {
              title: 'Thành tiền',
              dataIndex: 'amount',
              key: 'amount',
              width: 120,
              align: 'right',
              render: (amount) => <Text strong>{formatCurrency(amount)}</Text>
            }
          ]}
        />

        {selectedInvoice.note && (
          <>
            <Divider>Ghi chú</Divider>
            <Paragraph>{selectedInvoice.note}</Paragraph>
          </>
        )}
      </Modal>
    );
  };

  if (loading && children.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Đang tải thông tin tài chính...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                <MoneyCollectOutlined /> Tài chính học phí
              </Title>
              <Text type="secondary">
                Xem số tiền đã đóng và hóa đơn của con em
              </Text>
            </div>
            <Space>
              <Select
                style={{ width: 200 }}
                placeholder="Chọn con"
                value={selectedChild?.studentId}
                onChange={(value) => {
                  const child = children.find(c => c.studentId === value);
                  setSelectedChild(child);
                }}
              >
                {children.map(child => (
                  <Option key={child.studentId} value={child.studentId}>
                    {child.student?.fullName || child.studentName || 'Học sinh'}
                  </Option>
                ))}
              </Select>
              <RangePicker
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
                placeholder={['Từ ngày', 'Đến ngày']}
              />
              <Button 
                icon={<ReloadOutlined />}
                onClick={loadBillingData}
                loading={loading}
              >
                Làm mới
              </Button>
            </Space>
          </Space>
        </Col>
      </Row>

      {!selectedChild ? (
        <Card>
          <Empty 
            description="Vui lòng chọn con để xem thông tin tài chính"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      ) : !billingData ? (
        <Alert
          message="Không có quyền truy cập"
          description="Bạn không có quyền xem thông tin tài chính của học sinh này hoặc chưa có dữ liệu."
          type="warning"
          showIcon
        />
      ) : (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Summary Cards */}
          {/* {renderSummaryCards()} */}

          {/* Invoices Table */}
          <Card 
            title={
              <Space>
                <FileTextOutlined />
                <span>Danh sách hóa đơn</span>
              </Space>
            }
            loading={loading}
          >
            <Table
              dataSource={invoices}
              columns={invoiceColumns}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total) => `Tổng ${total} hóa đơn`
              }}
              locale={{
                emptyText: <Empty description="Chưa có hóa đơn nào" />
              }}
            />
          </Card>
        </Space>
      )}

      {/* Invoice Detail Modal */}
      {renderInvoiceDetail()}
    </div>
  );
};

export default ParentBilling;