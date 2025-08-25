import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  Space,
  Typography,
  Row,
  Col,
  Tag,
  message,
  Divider,
  Popconfirm,
  Upload
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoneyCollectOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const InvoiceManagement = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [invoices, setInvoices] = useState([]);
  const [students, setStudents] = useState([]);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [form] = Form.useForm();
  const [invoiceItems, setInvoiceItems] = useState([{ description: '', quantity: 1, unitPrice: 0 }]);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    loadInvoices();
    loadStudents();
  }, []);

  const loadInvoices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/manager/invoices');
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
      message.error('Không thể tải danh sách hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const loadStudents = async () => {
    try {
      const response = await api.get('/manager/students');
      setStudents(response.data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      message.error('Không thể tải danh sách học sinh');
    }
  };

  const handleCreateInvoice = async (values) => {
    try {
      setLoading(true);

      // Validate invoice items
      const validItems = invoiceItems.filter(item => item.description && item.unitPrice > 0);

      if (validItems.length === 0) {
        message.error('Vui lòng thêm ít nhất một khoản phí với đơn giá lớn hơn 0');
        setLoading(false);
        return;
      }

      // Calculate total amount
      const totalAmount = validItems.reduce((total, item) => {
        return total + (item.quantity * item.unitPrice);
      }, 0);

      if (totalAmount <= 0) {
        message.error('Tổng tiền hóa đơn phải lớn hơn 0 VND');
        setLoading(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();

      const invoiceData = {
        ...values,
        // issueDate và dueDate sẽ được tự động set ở backend
        items: validItems,
        status: 'PENDING'
      };

      // Add invoice data as JSON
      formData.append('invoiceData', JSON.stringify(invoiceData));

      // Add file if uploaded
      if (uploadedFile) {
        formData.append('invoiceFile', uploadedFile);
      }

      await api.post('/manager/invoices', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      message.success('Tạo hóa đơn thành công');
      setCreateModalVisible(false);
      form.resetFields();
      setInvoiceItems([{ description: '', quantity: 1, unitPrice: 0 }]);
      setUploadedFile(null);
      setFileList([]);
      loadInvoices();
    } catch (error) {
      console.error('Error creating invoice:', error);
      message.error('Không thể tạo hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInvoiceStatus = async (invoiceId, newStatus) => {
    try {
      setLoading(true);
      await api.put(`/manager/invoices/${invoiceId}/status`, { status: newStatus });
      message.success('Cập nhật trạng thái hóa đơn thành công');
      loadInvoices();
    } catch (error) {
      console.error('Error updating invoice status:', error);
      message.error('Không thể cập nhật trạng thái hóa đơn');
    } finally {
      setLoading(false);
    }
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeInvoiceItem = (index) => {
    const newItems = invoiceItems.filter((_, i) => i !== index);
    setInvoiceItems(newItems);
  };

  const updateInvoiceItem = (index, field, value) => {
    const newItems = [...invoiceItems];
    newItems[index][field] = value;
    setInvoiceItems(newItems);
  };

  const calculateTotalAmount = () => {
    return invoiceItems.reduce((total, item) => {
      return total + (item.quantity * item.unitPrice);
    }, 0);
  };

  const handleFileUpload = (info) => {
    const { status, file } = info;
    
    if (status === 'uploading') {
      return;
    }
    
    if (status === 'done' || status === 'error' || !status) {
      // Store the actual file object for FormData
      setUploadedFile(file.originFileObj || file);
      setFileList([file]);
      message.success('File đã được chọn thành công');
    }
  };

  const beforeUpload = (file) => {
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      message.error('Chỉ có thể tải lên file PDF!');
      return false;
    }
    
    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      message.error('File phải nhỏ hơn 10MB!');
      return false;
    }
    
    return false; // Prevent auto upload, we'll handle it manually
  };

  const downloadInvoiceFile = async (invoiceId, fileName) => {
    try {
      const response = await api.get(`/manager/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName || `invoice_${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      message.success('Tải file thành công');
    } catch (error) {
      console.error('Error downloading file:', error);
      message.error('Không thể tải file');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PAID': return 'success';
      case 'PARTIAL': return 'warning';
      case 'OVERDUE': return 'error';
      case 'PENDING': return 'processing';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
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

  const columns = [
    {
      title: 'Số hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Học sinh',
      dataIndex: 'studentName',
      key: 'studentName'
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => moment(date).format('DD/MM/YYYY HH:mm')
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
        <Tag color={getStatusColor(status)}>
          {getStatusText(status)}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          {record.documentPath && (
            <Button
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => downloadInvoiceFile(record.id, `${record.invoiceNumber}.pdf`)}
            >
              Tải file
            </Button>
          )}
          {record.status === 'PENDING' && (
            <Popconfirm
              title="Xác nhận thanh toán"
              description="Bạn có chắc muốn đánh dấu hóa đơn này đã được thanh toán?"
              onConfirm={() => handleUpdateInvoiceStatus(record.id, 'PAID')}
              okText="Có"
              cancelText="Không"
            >
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
              >
                Đã thanh toán
              </Button>
            </Popconfirm>
          )}
          {record.status === 'PENDING' && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setSelectedInvoice(record);
                setEditModalVisible(true);
              }}
            >
              Sửa
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col span={24}>
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <div>
              <Title level={2} style={{ margin: 0 }}>
                <FileTextOutlined /> Quản lý hóa đơn
              </Title>
              <Text type="secondary">
                Tạo và quản lý hóa đơn học phí cho học sinh
              </Text>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Tạo hóa đơn mới
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Invoices Table */}
      <Card>
        <Table
          dataSource={invoices}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} hóa đơn`
          }}
        />
      </Card>

      {/* Create Invoice Modal */}
      <Modal
        title="Tạo hóa đơn mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
          setInvoiceItems([{ description: '', quantity: 1, unitPrice: 0 }]);
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateInvoice}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="invoiceNumber"
                label="Số hóa đơn"
                rules={[{ required: true, message: 'Vui lòng nhập số hóa đơn' }]}
              >
                <Input placeholder="VD: HĐ-2025-010" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="studentId"
                label="Học sinh"
                rules={[{ required: true, message: 'Vui lòng chọn học sinh' }]}
              >
                <Select placeholder="Chọn học sinh">
                  {students.map(student => (
                    <Option key={student.id} value={student.id}>
                      {student.fullName} - {student.username}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          {/* Ngày phát hành và hạn thanh toán sẽ được tự động tạo ở backend */}

          <Form.Item
            name="note"
            label="Ghi chú"
          >
            <TextArea rows={3} placeholder="Ghi chú về hóa đơn (tùy chọn)" />
          </Form.Item>

          <Form.Item
            label="Tải lên file hóa đơn (PDF)"
            extra="Chỉ chấp nhận file PDF, tối đa 10MB"
          >
            <Upload
              fileList={fileList}
              beforeUpload={beforeUpload}
              onChange={handleFileUpload}
              onRemove={() => {
                setUploadedFile(null);
                setFileList([]);
              }}
              accept=".pdf"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>
                Chọn file hóa đơn
              </Button>
            </Upload>
          </Form.Item>

          <Divider>Chi tiết các khoản</Divider>

          {invoiceItems.map((item, index) => (
            <Card key={index} size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16} align="middle">
                <Col span={10}>
                  <Input
                    placeholder="Mô tả khoản phí"
                    value={item.description}
                    onChange={(e) => updateInvoiceItem(index, 'description', e.target.value)}
                  />
                </Col>
                <Col span={4}>
                  <InputNumber
                    placeholder="Số lượng"
                    min={1}
                    value={item.quantity}
                    onChange={(value) => updateInvoiceItem(index, 'quantity', value)}
                    style={{ width: '100%' }}
                  />
                </Col>
                <Col span={6}>
                  <InputNumber
                    placeholder="Đơn giá"
                    min={0}
                    value={item.unitPrice}
                    onChange={(value) => updateInvoiceItem(index, 'unitPrice', value)}
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value.replace(/\$\s?|(,*)/g, '')}
                  />
                </Col>
                <Col span={3}>
                  <Text strong>{formatCurrency(item.quantity * item.unitPrice)}</Text>
                </Col>
                <Col span={1}>
                  {invoiceItems.length > 1 && (
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => removeInvoiceItem(index)}
                    />
                  )}
                </Col>
              </Row>
            </Card>
          ))}

          <Button
            type="dashed"
            icon={<PlusOutlined />}
            onClick={addInvoiceItem}
            style={{ width: '100%', marginBottom: 16 }}
          >
            Thêm khoản phí
          </Button>

          <div style={{ textAlign: 'right', marginBottom: 16 }}>
            <Text strong>Tổng cộng: {formatCurrency(calculateTotalAmount())}</Text>
          </div>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCreateModalVisible(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Tạo hóa đơn
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default InvoiceManagement;