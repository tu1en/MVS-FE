import { Button, DatePicker, Form, Input, message, Modal, Popconfirm, Space, Table } from 'antd';
import { format, parseISO } from "date-fns";
import moment from 'moment';
import React, { useEffect, useState } from "react";
import { accomplishmentService } from "../services/accomplishmentService";

const AccomplishmentFormModal = ({ visible, onCancel, onFinish, initialData }) => {
    const [form] = Form.useForm();
    
    useEffect(() => {
        if (initialData) {
            form.setFieldsValue({
                ...initialData,
                issueDate: initialData.issueDate ? moment(initialData.issueDate, 'YYYY-MM-DD') : null
            });
        } else {
            form.resetFields();
        }
    }, [initialData, form]);


    return (
        <Modal
            title={initialData ? "Sửa thành tích" : "Thêm thành tích"}
            open={visible}
            onCancel={onCancel}
            onOk={() => form.submit()}
            destroyOnClose
        >
            <Form form={form} onFinish={onFinish} layout="vertical">
                <Form.Item name="title" label="Tên thành tích/Chứng chỉ" rules={[{ required: true }]}>
                    <Input />
                </Form.Item>
                <Form.Item name="description" label="Mô tả">
                    <Input.TextArea />
                </Form.Item>
                <Form.Item name="issueDate" label="Ngày cấp" rules={[{ required: true }]}>
                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                </Form.Item>
            </Form>
        </Modal>
    );
};


const StudentAccomplishments = () => {
  const [accomplishments, setAccomplishments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const fetchData = () => {
    setLoading(true);
    accomplishmentService.getMyAccomplishments()
        .then(res => {
            setAccomplishments(res.data);
        })
        .catch(() => message.error("Không thể tải danh sách thành tích"))
        .finally(() => setLoading(false));
  };

  useEffect(() => {
      fetchData();
  }, []);

  const handleFinish = (values) => {
    const dataToSubmit = {
        ...values,
        issueDate: values.issueDate ? values.issueDate.format('YYYY-MM-DD') : null,
    };

    const promise = editingItem
        ? accomplishmentService.updateAccomplishment(editingItem.id, dataToSubmit)
        : accomplishmentService.createAccomplishment(dataToSubmit);

    promise.then(() => {
        message.success("Thao tác thành công!");
        setIsModalVisible(false);
        setEditingItem(null);
        fetchData();
    }).catch((err) => {
        const errorMsg = err.response?.data?.message || "Đã có lỗi xảy ra!";
        message.error(errorMsg);
    });
  };
    
  const handleDelete = (id) => {
    accomplishmentService.deleteAccomplishment(id)
        .then(() => {
            message.success("Xóa thành tích thành công!");
            fetchData();
        })
        .catch(() => message.error("Xóa thất bại!"));
  };

  const columns = [
    {
        title: 'Thành tích',
        dataIndex: 'title',
        key: 'title',
    },
    {
        title: 'Mô tả',
        dataIndex: 'description',
        key: 'description',
    },
    {
        title: 'Ngày cấp',
        dataIndex: 'issueDate',
        key: 'issueDate',
        render: (text) => text ? format(parseISO(text), "dd/MM/yyyy") : 'N/A'
    },
    {
        title: 'Hành động',
        key: 'action',
        render: (_, record) => (
            <Space size="middle">
                <Button onClick={() => { setEditingItem(record); setIsModalVisible(true); }}>Sửa</Button>
                <Popconfirm
                    title="Bạn có chắc muốn xóa?"
                    onConfirm={() => handleDelete(record.id)}
                    okText="Có"
                    cancelText="Không"
                >
                    <Button danger>Xóa</Button>
                </Popconfirm>
            </Space>
        ),
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 bg-[#e7f6e7] min-h-screen">
      <div className="flex justify-between items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Quản lý Thành tích Cá nhân</h1>
        <Button type="primary" onClick={() => { setEditingItem(null); setIsModalVisible(true); }}>
            Thêm mới
        </Button>
      </div>
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        <Table
            columns={columns}
            dataSource={accomplishments}
            rowKey="id"
            loading={loading}
        />
      </div>
      <AccomplishmentFormModal
          visible={isModalVisible}
          onCancel={() => { setIsModalVisible(false); setEditingItem(null); }}
          onFinish={handleFinish}
          initialData={editingItem}
      />
    </div>
  );
};

export default StudentAccomplishments;
