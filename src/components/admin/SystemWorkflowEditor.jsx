import {
  CodeOutlined,
  CopyOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  PlayCircleOutlined,
  PlusOutlined,
  SaveOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Drawer,
  Form,
  Input,
  Modal,
  Popconfirm,
  Space,
  Table,
  Tag,
  Tooltip
} from 'antd';
import { useEffect, useState } from 'react';
import { App } from 'antd'; // Import App for proper message context
import adminService from '../../services/adminService';

const { TextArea } = Input;

/**
 * SystemWorkflowEditor - Editor cho workflow dạng JSON
 * Hỗ trợ CRUD operations và JSON validation
 */
const SystemWorkflowEditor = () => {
  const { message } = App.useApp(); // Get message from context
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const [jsonDrawerVisible, setJsonDrawerVisible] = useState(false);
  const [currentJsonData, setCurrentJsonData] = useState('');
  const [form] = Form.useForm();

  // Load workflows khi component mount
  useEffect(() => {
    loadWorkflows();
  }, []);

  /**
   * Load tất cả workflows từ backend
   */
  const loadWorkflows = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAllWorkflows();
      
      if (response.data.success) {
        setWorkflows(response.data.data);
        message.success('Tải danh sách workflow thành công');
      } else {
        message.error(response.data.message || 'Không thể tải workflow');
      }
    } catch (error) {
      console.error('Error loading workflows:', error);
      message.error('Lỗi khi tải danh sách workflow');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Tạo workflow mới
   */
  const handleCreateWorkflow = () => {
    setEditingWorkflow(null);
    form.resetFields();
    form.setFieldsValue({
      jsonData: JSON.stringify({
        nodes: [
          {
            id: 'start',
            type: 'input',
            position: { x: 250, y: 25 },
            data: { label: 'Start Node' }
          }
        ],
        edges: []
      }, null, 2)
    });
    setModalVisible(true);
  };

  /**
   * Edit workflow
   */
  const handleEditWorkflow = (workflow) => {
    setEditingWorkflow(workflow);
    form.setFieldsValue({
      name: workflow.name,
      description: workflow.description,
      jsonData: JSON.stringify(JSON.parse(workflow.jsonData), null, 2),
      isActive: workflow.isActive
    });
    setModalVisible(true);
  };

  /**
   * Save workflow (create hoặc update)
   */
  const handleSaveWorkflow = async (values) => {
    try {
      // Validate JSON
      if (!adminService.validateWorkflowJSON(values.jsonData)) {
        message.error('JSON data không hợp lệ. Phải có nodes và edges.');
        return;
      }

      const workflowData = {
        name: values.name,
        description: values.description,
        jsonData: values.jsonData,
        isActive: values.isActive !== false,
        createdBy: 'admin' // Có thể lấy từ auth context
      };

      let response;
      if (editingWorkflow) {
        response = await adminService.updateWorkflow(editingWorkflow.id, workflowData);
      } else {
        response = await adminService.createWorkflow(workflowData);
      }

      if (response.data.success) {
        message.success(editingWorkflow ? 'Cập nhật workflow thành công' : 'Tạo workflow thành công');
        setModalVisible(false);
        loadWorkflows();
      } else {
        message.error(response.data.message || 'Lỗi khi lưu workflow');
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
      message.error('Lỗi khi lưu workflow');
    }
  };

  /**
   * Xóa workflow
   */
  const handleDeleteWorkflow = async (id) => {
    try {
      const response = await adminService.deleteWorkflow(id);
      
      if (response.data.success) {
        message.success('Xóa workflow thành công');
        loadWorkflows();
      } else {
        message.error(response.data.message || 'Lỗi khi xóa workflow');
      }
    } catch (error) {
      console.error('Error deleting workflow:', error);
      message.error('Lỗi khi xóa workflow');
    }
  };

  /**
   * Duplicate workflow
   */
  const handleDuplicateWorkflow = async (workflow) => {
    try {
      const newName = `${workflow.name} (Copy)`;
      const response = await adminService.duplicateWorkflow(workflow.id, newName);
      
      if (response.data.success) {
        message.success('Duplicate workflow thành công');
        loadWorkflows();
      } else {
        message.error(response.data.message || 'Lỗi khi duplicate workflow');
      }
    } catch (error) {
      console.error('Error duplicating workflow:', error);
      message.error('Lỗi khi duplicate workflow');
    }
  };

  /**
   * Export workflow as JSON file
   */
  const handleExportWorkflow = async (workflow) => {
    try {
      const response = await adminService.exportWorkflow(workflow.id);
      
      // Download file
      adminService.downloadFile(response.data, `workflow_${workflow.name}.json`);
      message.success('Export workflow thành công');
    } catch (error) {
      console.error('Error exporting workflow:', error);
      message.error('Lỗi khi export workflow');
    }
  };

  /**
   * View JSON data
   */
  const handleViewJson = (jsonData) => {
    setCurrentJsonData(JSON.stringify(JSON.parse(jsonData), null, 2));
    setJsonDrawerVisible(true);
  };

  /**
   * Validate JSON trong form
   */
  const validateJson = (_, value) => {
    if (!value) {
      return Promise.reject(new Error('JSON data không được để trống'));
    }
    
    if (!adminService.validateWorkflowJSON(value)) {
      return Promise.reject(new Error('JSON data không hợp lệ. Phải có nodes và edges.'));
    }
    
    return Promise.resolve();
  };

  // Table columns
  const columns = [
    {
      title: 'Tên Workflow',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-sm text-gray-500">{record.description}</div>
        </div>
      )
    },
    {
      title: 'Version',
      dataIndex: 'version',
      key: 'version',
      width: 80,
      render: (version) => <Tag color="blue">v{version}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Active' : 'Inactive'}
        </Tag>
      )
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120
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
      width: 250,
      render: (_, record) => (
        <Space>
          <Tooltip title="Xem JSON">
            <Button
              icon={<CodeOutlined />}
              size="small"
              onClick={() => handleViewJson(record.jsonData)}
            />
          </Tooltip>
          
          <Tooltip title="Chỉnh sửa">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEditWorkflow(record)}
            />
          </Tooltip>
          
          <Tooltip title="Duplicate">
            <Button
              icon={<CopyOutlined />}
              size="small"
              onClick={() => handleDuplicateWorkflow(record)}
            />
          </Tooltip>
          
          <Tooltip title="Export JSON">
            <Button
              icon={<DownloadOutlined />}
              size="small"
              onClick={() => handleExportWorkflow(record)}
            />
          </Tooltip>
          
          <Popconfirm
            title="Bạn có chắc muốn xóa workflow này?"
            onConfirm={() => handleDeleteWorkflow(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Tooltip title="Xóa">
              <Button
                icon={<DeleteOutlined />}
                size="small"
                danger
              />
            </Tooltip>
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card
        title={
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <PlayCircleOutlined className="mr-2" />
              <span>Workflow Editor</span>
            </div>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreateWorkflow}
              size="large"
            >
              Tạo Workflow Mới
            </Button>
          </div>
        }
        className="shadow-lg"
      >
        <Alert
          message="Workflow Editor"
          description="Quản lý các workflow của hệ thống. Workflow được lưu trữ dưới dạng JSON với nodes và edges."
          type="info"
          showIcon
          className="mb-4"
        />

        <Table
          columns={columns}
          dataSource={workflows}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} workflows`
          }}
        />
      </Card>

      {/* Modal Create/Edit Workflow */}
      <Modal
        title={editingWorkflow ? 'Chỉnh sửa Workflow' : 'Tạo Workflow Mới'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        width={800}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveWorkflow}
        >
          <Form.Item
            name="name"
            label="Tên Workflow"
            rules={[
              { required: true, message: 'Vui lòng nhập tên workflow' },
              { max: 255, message: 'Tên không được vượt quá 255 ký tự' }
            ]}
          >
            <Input placeholder="Nhập tên workflow" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
          >
            <TextArea rows={3} placeholder="Mô tả workflow" />
          </Form.Item>

          <Form.Item
            name="jsonData"
            label="JSON Data"
            rules={[
              { required: true, message: 'Vui lòng nhập JSON data' },
              { validator: validateJson }
            ]}
          >
            <TextArea
              rows={15}
              placeholder="Nhập JSON data cho workflow"
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>

          <div className="flex justify-end space-x-3">
            <Button onClick={() => setModalVisible(false)}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
              {editingWorkflow ? 'Cập nhật' : 'Tạo mới'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Drawer xem JSON */}
      <Drawer
        title="JSON Data"
        open={jsonDrawerVisible}
        onClose={() => setJsonDrawerVisible(false)}
        width={600}
      >
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {currentJsonData}
        </pre>
      </Drawer>
    </div>
  );
};

export default SystemWorkflowEditor;
