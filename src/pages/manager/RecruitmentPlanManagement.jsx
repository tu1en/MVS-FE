import { Table, Button, Modal, Form, Input, DatePicker, InputNumber, Tag, message, Popconfirm, Select } from 'antd';
import { useEffect, useState } from 'react';
import axiosInstance from '../../config/axiosInstance';
import dayjs from 'dayjs';

const RecruitmentPlanManagement = ({ onPlanSelect }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/recruitment-plans');
      setPlans(res.data);
    } catch (err) {
      message.error('Không thể tải danh sách kế hoạch tuyển dụng!');
    } finally {
      setLoading(false);
    }
  };

  const openAddPlan = () => {
    setEditingPlan(null);
    form.resetFields();
    setShowModal(true);
  };

  const openEditPlan = (plan) => {
    setEditingPlan(plan);
    form.setFieldsValue({
      ...plan,
      startDate: plan.startDate ? dayjs(plan.startDate) : null,
      endDate: plan.endDate ? dayjs(plan.endDate) : null
    });
    setShowModal(true);
  };

  const handleDeletePlan = async (id) => {
    try {
      await axiosInstance.delete(`/recruitment-plans/${id}`);
      message.success('Xóa kế hoạch thành công!');
      fetchPlans();
    } catch (err) {
      message.error('Không thể xóa kế hoạch!');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await axiosInstance.put(`/recruitment-plans/${id}/status`, { status });
      message.success('Cập nhật trạng thái thành công!');
      fetchPlans();
    } catch (err) {
      message.error('Không thể cập nhật trạng thái!');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const data = {
        ...values,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD')
      };

      if (editingPlan) {
        await axiosInstance.put(`/recruitment-plans/${editingPlan.id}`, data);
        message.success('Cập nhật kế hoạch thành công!');
      } else {
        await axiosInstance.post('/recruitment-plans', data);
        message.success('Tạo kế hoạch thành công!');
      }
      
      setShowModal(false);
      fetchPlans();
    } catch (err) {
      message.error('Có lỗi xảy ra!');
    }
  };

  const columns = [
    {
      title: 'Tên kế hoạch',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <span 
          className={record.status === 'OPEN' ? 'cursor-pointer text-blue-600 hover:text-blue-800 hover:underline' : 'text-gray-500'}
          onClick={() => record.status === 'OPEN' && onPlanSelect && onPlanSelect(record)}
        >
          {text}
        </span>
      )
    },
    {
      title: 'Ngày bắt đầu',
      dataIndex: 'startDate',
      key: 'startDate',
      render: (text) => dayjs(text).format('DD/MM/YYYY')
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text) => dayjs(text).format('DD/MM/YYYY')
    },
    {
      title: 'Số lượng',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'OPEN' ? 'green' : 'red'}>
          {status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <div className="space-x-2">
          <Button type="link" onClick={() => openEditPlan(record)}>
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa kế hoạch này?"
            onConfirm={() => handleDeletePlan(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger>
              Xóa
            </Button>
          </Popconfirm>
          <Select
            value={record.status}
            style={{ width: 100 }}
            onChange={(value) => handleStatusChange(record.id, value)}
          >
            <Select.Option value="OPEN">Mở</Select.Option>
            <Select.Option value="CLOSED">Đóng</Select.Option>
          </Select>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Quản Lý Kế Hoạch Tuyển Dụng</h2>
      <Button type="primary" className="mb-4" onClick={openAddPlan}>
        Thêm kế hoạch mới
      </Button>
      <Table columns={columns} dataSource={plans} rowKey="id" loading={loading} />
      
      <Modal 
        open={showModal} 
        onCancel={() => setShowModal(false)} 
        title={editingPlan ? 'Cập nhật kế hoạch' : 'Thêm kế hoạch mới'} 
        onOk={() => form.submit()} 
        okText={editingPlan ? 'Cập nhật' : 'Thêm mới'}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="title" label="Tên kế hoạch" rules={[{ required: true, message: 'Nhập tên kế hoạch' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true, message: 'Chọn ngày kết thúc' }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="totalQuantity" label="Số lượng tuyển dụng" rules={[{ required: true, message: 'Nhập số lượng' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecruitmentPlanManagement;