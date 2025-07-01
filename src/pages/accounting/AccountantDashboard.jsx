import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message } from 'antd';
import axios from 'axios';

const { RangePicker } = DatePicker;

const API_URL = '/api/labor-contracts';

const initialForm = {
  employeeName: '',
  employeeType: '',
  contractNumber: '',
  description: '',
  startDate: null,
  endDate: null,
};

const AccountantDashboard = () => {
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [editing, setEditing] = useState(null);

  const fetchContracts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setContracts(res.data);
    } catch (err) {
      message.error('Không thể tải danh sách hợp đồng');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContracts();
  }, []);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record) => {
    setEditing(record.id);
    form.setFieldsValue({
      ...record,
      dateRange: [record.startDate ? record.startDate : null, record.endDate ? record.endDate : null],
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      message.success('Đã xóa hợp đồng');
      fetchContracts();
    } catch {
      message.error('Không thể xóa hợp đồng');
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const data = {
        ...values,
        startDate: values.dateRange[0],
        endDate: values.dateRange[1],
      };
      delete data.dateRange;
      if (editing) {
        await axios.put(`${API_URL}/${editing}`, data);
        message.success('Cập nhật thành công');
      } else {
        await axios.post(API_URL, data);
        message.success('Tạo mới thành công');
      }
      setModalOpen(false);
      fetchContracts();
    } catch (err) {
      message.error('Có lỗi khi lưu hợp đồng');
    }
  };

  const columns = [
    { title: 'Tên', dataIndex: 'employeeName' },
    { title: 'Loại', dataIndex: 'employeeType' },
    { title: 'Số hợp đồng', dataIndex: 'contractNumber' },
    { title: 'Ngày bắt đầu', dataIndex: 'startDate' },
    { title: 'Ngày kết thúc', dataIndex: 'endDate' },
    {
      title: 'Hành động',
      render: (_, record) => (
        <>
          <Button onClick={() => openEdit(record)} type="link">Sửa</Button>
          <Button onClick={() => handleDelete(record.id)} type="link" danger>Xóa</Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <h2>Quản lý hợp đồng lao động</h2>
      <Button type="primary" onClick={openCreate} style={{ marginBottom: 16 }}>Tạo hợp đồng mới</Button>
      <Table columns={columns} dataSource={contracts} rowKey="id" loading={loading} />
      <Modal
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={handleOk}
        title={editing ? 'Cập nhật hợp đồng' : 'Tạo hợp đồng mới'}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="employeeName" label="Tên nhân viên/giáo viên" rules={[{ required: true, message: 'Nhập tên' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="employeeType" label="Loại (TEACHER/STAFF)" rules={[{ required: true, message: 'Nhập loại' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="contractNumber" label="Số hợp đồng" rules={[{ required: true, message: 'Nhập số hợp đồng' }]}> 
            <Input />
          </Form.Item>
          <Form.Item name="dateRange" label="Thời hạn hợp đồng" rules={[{ required: true, message: 'Chọn thời gian' }]}> 
            <RangePicker format="YYYY-MM-DD" />
          </Form.Item>
          <Form.Item name="description" label="Mô tả">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AccountantDashboard;
