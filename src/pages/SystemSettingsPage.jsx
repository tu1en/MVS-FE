import {
  ApiOutlined,
  MailOutlined,
  SaveOutlined,
  SecurityScanOutlined,
  SettingOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Alert,
  App,
  Button,
  Card,
  Divider,
  Form,
  Input,
  InputNumber,
  Spin,
  Switch,
  Tabs,
  Upload
} from 'antd';
import { useEffect, useState } from 'react';
import adminService from '../services/adminService';

const { TextArea } = Input;

const SystemSettingsPage = () => {
  const { message } = App.useApp(); // Get message from context
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const response = await adminService.getSystemSettings();
      if (response.data.success) {
        const settings = response.data.data;
        const formData = {
          ...settings,
          smtpPort: parseInt(settings.smtpPort) || null,
          sessionTimeout: parseInt(settings.sessionTimeout) || null,
          maxLoginAttempts: parseInt(settings.maxLoginAttempts) || null,
          lockoutDuration: parseInt(settings.lockoutDuration) || null,
          enable2FA: settings.enable2FA === 'true',
          smtpTls: settings.smtpTls === 'true',
          smtpAuth: settings.smtpAuth === 'true'
        };
        form.setFieldsValue(formData);
        message.success('Tải cấu hình thành công'); // Use context message
      } else {
        // Disabled error message for loading configuration
        console.warn('Failed to load configuration:', response.data.message || 'Không thể tải cấu hình');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      // Disabled error message for loading configuration
      console.warn('Error loading configuration:', 'Lỗi khi tải cấu hình');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (values) => {
    try {
      setSaving(true);
      const settingsData = {
        ...values,
        smtpPort: values.smtpPort?.toString(),
        sessionTimeout: values.sessionTimeout?.toString(),
        maxLoginAttempts: values.maxLoginAttempts?.toString(),
        lockoutDuration: values.lockoutDuration?.toString(),
        enable2FA: values.enable2FA?.toString(),
        smtpTls: values.smtpTls?.toString(),
        smtpAuth: values.smtpAuth?.toString()
      };
      const response = await adminService.updateSystemSettings(settingsData);
      if (response.data.success) {
        message.success('Lưu cấu hình thành công'); // Use context message
      } else {
        message.error(response.data.message || 'Lưu cấu hình thất bại');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Lỗi khi lưu cấu hình'); // Use context message
    } finally {
      setSaving(false);
    }
  };

  const testSMTP = async () => {
    try {
      setTestingSmtp(true);
      const response = await adminService.testSMTPConnection();
      if (response.data.success) {
        message.success('Kết nối SMTP thành công!'); // Use context message
      } else {
        message.error(response.data.message || 'Kết nối SMTP thất bại');
      }
    } catch (error) {
      console.error('Error testing SMTP:', error);
      message.error('Lỗi khi test SMTP'); // Use context message
    } finally {
      setTestingSmtp(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
        <span className="ml-3">Đang tải cấu hình hệ thống...</span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <Card title={<><SettingOutlined /> Cấu hình hệ thống</>} className="shadow-lg">
        <Alert message="Các thay đổi áp dụng ngay lập tức. Kiểm tra kỹ trước khi lưu." type="info" showIcon className="mb-4" />
        <Form form={form} layout="vertical" onFinish={saveSettings} className="max-w-4xl">
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'general',
                label: (<><SettingOutlined /> Cài đặt chung</>),
                children: (
                  <>
                    <Form.Item name="siteName" label="Tên website" rules={[{ required: true, message: 'Vui lòng nhập tên website' }]}>
                      <Input placeholder="Nhập tên website" size="large" />
                    </Form.Item>
                    <Form.Item name="language" label="Ngôn ngữ mặc định">
                      <Input placeholder="vi, en" size="large" />
                    </Form.Item>
                    <Form.Item name="logoUrl" label="URL Logo">
                      <Input placeholder="https://example.com/logo.png" size="large" />
                    </Form.Item>
                    <Upload name="logo" listType="picture" maxCount={1} beforeUpload={() => false}>
                      <Button icon={<UploadOutlined />} size="large">Chọn file logo</Button>
                    </Upload>
                  </>
                )
              },
              {
                key: 'email',
                label: (<><MailOutlined /> Cài đặt Email</>),
                children: (
                  <>
                    <Alert message="Cấu hình SMTP để gửi email" type="info" showIcon className="mb-4" />
                    <Form.Item name="smtpHost" label="SMTP Host" rules={[{ required: true, message: 'Vui lòng nhập SMTP Host' }]}>
                      <Input placeholder="smtp.gmail.com" size="large" />
                    </Form.Item>
                    <Form.Item name="smtpPort" label="SMTP Port" rules={[{ required: true, message: 'Vui lòng nhập SMTP Port' }]}>
                      <InputNumber placeholder="587" size="large" className="w-full" />
                    </Form.Item>
                    <Button type="default" icon={<ApiOutlined />} onClick={testSMTP} loading={testingSmtp}>Test SMTP</Button>
                  </>
                )
              },
              {
                key: 'security',
                label: (<><SecurityScanOutlined /> Bảo mật</>),
                children: (
                  <>
                    <Form.Item name="enable2FA" label="Bật xác thực 2FA" valuePropName="checked">
                      <Switch />
                    </Form.Item>
                    <Form.Item name="sessionTimeout" label="Timeout session (phút)">
                      <InputNumber min={5} max={1440} size="large" className="w-full" />
                    </Form.Item>
                    <Form.Item name="passwordPolicy" label="Chính sách mật khẩu">
                      <TextArea rows={4} placeholder="Mô tả chính sách mật khẩu..." />
                    </Form.Item>
                  </>
                )
              }
            ]}
          />
          <Divider />
          <div className="flex justify-end space-x-3">
            <Button onClick={loadSettings}>Khôi phục</Button>
            <Button type="primary" htmlType="submit" loading={saving} icon={<SaveOutlined />}>Lưu cấu hình</Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default SystemSettingsPage;
