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
      message.success('Đã xóa kế hoạch cùng tất cả dữ liệu liên quan thành công!');
      fetchPlans();
    } catch (err) {
      const detail = err.response?.data || 'Không thể xóa kế hoạch!';
      message.error(typeof detail === 'string' ? detail : 'Không thể xóa kế hoạch!');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      // Lấy thông tin kế hoạch hiện tại
      const plan = plans.find(p => p.id === id);
      if (!plan) {
        message.error('Không tìm thấy kế hoạch!');
        return;
      }
      
      // Kiểm tra nếu muốn mở kế hoạch đã kết thúc
      const now = dayjs();
      if (status === 'OPEN' && plan.endDate && dayjs(plan.endDate).isBefore(now, 'day')) {
        message.error('Đã quá ngày tuyển dụng, hãy cập nhật lại!');
        return;
      }
      
      await axiosInstance.put(`/recruitment-plans/${id}/status`, { status });
      message.success('Cập nhật trạng thái thành công!');
      fetchPlans();
    } catch (err) {
      // Xử lý lỗi validation từ backend
      if (err.response && err.response.status === 400) {
        message.error(err.response.data || 'Không thể cập nhật trạng thái!');
      } else {
        message.error('Không thể cập nhật trạng thái!');
      }
    }
  };

  const handleSubmit = async (values) => {
    try {
      // Validation cho thời gian
      const now = dayjs();
      const startDate = values.startDate;
      const endDate = values.endDate;
      
      // Chỉ kiểm tra ngày bắt đầu không được trong quá khứ khi tạo mới kế hoạch
      // hoặc khi startDate không bị khóa (không phải kế hoạch đã bắt đầu)
      if (!editingPlan && startDate && startDate.isBefore(now, 'day')) {
        message.error('Ngày bắt đầu không được trong quá khứ!');
        return;
      }
      
      // Chỉ kiểm tra ngày kết thúc không được trong quá khứ khi tạo mới kế hoạch
      if (!editingPlan && endDate && endDate.isBefore(now, 'day')) {
        message.error('Ngày kết thúc không được trong quá khứ!');
        return;
      }
      
      // Kiểm tra ngày bắt đầu phải trước ngày kết thúc
      if (startDate && endDate && startDate.isAfter(endDate, 'day')) {
        message.error('Ngày bắt đầu phải trước ngày kết thúc!');
        return;
      }

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
      // Xử lý lỗi validation từ backend
      if (err.response && err.response.status === 400) {
        const errorMessage = err.response.data || 'Trùng ngày với kế hoạch khác !';
        message.error(errorMessage);
      } else {
        message.error('Trùng ngày với kế hoạch khác !');
      }
    }
  };

  const columns = [
    {
      title: 'Thứ tự',
      dataIndex: 'index',
      key: 'index',
      width: 80,
      render: (_, __, index) => <span className="vietnamese-text">{index + 1}</span>
    },
    {
      title: 'Tên kế hoạch',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <span 
          className={`${record.status === 'OPEN' ? 'cursor-pointer text-blue-600 hover:text-blue-800 hover:underline' : 'text-gray-500'} vietnamese-text vietnamese-diacritics-fix`}
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
      render: (text) => <span className="vietnamese-text">{dayjs(text).format('DD/MM/YYYY')}</span>
    },
    {
      title: 'Ngày kết thúc',
      dataIndex: 'endDate',
      key: 'endDate',
      render: (text) => <span className="vietnamese-text">{dayjs(text).format('DD/MM/YYYY')}</span>
    },
    {
      title: 'Số lượng',
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      render: (text, record) => {
        // Số lượng được tính từ tổng các vị trí trong kế hoạch
        return <span className="vietnamese-text">{text || 0}</span>;
      }
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'OPEN' ? 'green' : 'red'} className="vietnamese-text">
          {status === 'OPEN' ? 'Đang mở' : 'Đã đóng'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <div className="space-x-2">
          <Button type="link" onClick={() => openEditPlan(record)} className="vietnamese-text">
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa kế hoạch này?"
            description="Hành động này sẽ xóa kế hoạch cùng tất cả vị trí tuyển dụng, đơn ứng tuyển và lịch phỏng vấn liên quan. Không thể hoàn tác!"
            onConfirm={() => handleDeletePlan(record.id)}
            okText="Xóa tất cả"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" danger className="vietnamese-text">
              Xóa
            </Button>
          </Popconfirm>
          <Select
            value={record.status}
            style={{ width: 100 }}
            onChange={(value) => handleStatusChange(record.id, value)}
            className="vietnamese-text"
          >
            <Select.Option value="OPEN" className="vietnamese-text">Mở</Select.Option>
            <Select.Option value="CLOSED" className="vietnamese-text">Đóng</Select.Option>
          </Select>
        </div>
      )
    }
  ];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 vietnamese-heading">Quản Lý Kế Hoạch Tuyển Dụng</h2>
      <Button type="primary" className="mb-4 vietnamese-text" onClick={openAddPlan}>
        Thêm kế hoạch mới
      </Button>
      <Table columns={columns} dataSource={plans} rowKey="id" loading={loading} />
      
      <Modal 
        open={showModal} 
        onCancel={() => setShowModal(false)} 
        title={editingPlan ? 'Cập nhật kế hoạch' : 'Thêm kế hoạch mới'} 
        onOk={() => form.submit()} 
        okText={editingPlan ? 'Cập nhật' : 'Thêm mới'}
        className="form-vietnamese"
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="form-vietnamese">
          <Form.Item name="title" label="Tên kế hoạch" rules={[{ required: true, message: 'Nhập tên kế hoạch' }, { max: 50, message: 'Tên kế hoạch tối đa 50 ký tự!' }]}>
            <Input className="vietnamese-text" maxLength={50} />
          </Form.Item>
          <Form.Item name="startDate" label="Ngày bắt đầu" rules={[{ required: true, message: 'Chọn ngày bắt đầu' }]}>
            <DatePicker 
              style={{ width: '100%' }} 
              className="vietnamese-text"
              disabled={!!editingPlan && dayjs(editingPlan.startDate).isBefore(dayjs(), 'day')}
            />
          </Form.Item>
          <Form.Item name="endDate" label="Ngày kết thúc" rules={[{ required: true, message: 'Chọn ngày kết thúc' }]}>
            <DatePicker style={{ width: '100%' }} className="vietnamese-text" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RecruitmentPlanManagement;