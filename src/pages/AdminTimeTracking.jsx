import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DownloadOutlined,
  EditOutlined,
  EnvironmentOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  SettingOutlined,
  WarningOutlined
} from '@ant-design/icons';
import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  InputNumber,
  message,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Tooltip
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';

const { TabPane } = Tabs;
const { Option } = Select;
const { RangePicker } = DatePicker;

const AdminTimeTracking = () => {
  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('work-hours');
  
  // Work Hours Configuration
  const [workHoursForm] = Form.useForm();
  const [workHoursConfig, setWorkHoursConfig] = useState({
    standardCheckIn: dayjs('08:00', 'HH:mm'),
    standardCheckOut: dayjs('17:00', 'HH:mm'),
    lateThreshold: 15, // minutes
    earlyLeaveThreshold: 15, // minutes
    overtimeThreshold: 30, // minutes after standard checkout
    enableFlexTime: false,
    flexTimeRange: 60 // minutes
  });

  // Network & Location Configuration
  const [ipWhitelist, setIpWhitelist] = useState([
    { id: 1, ip: '192.168.1.0/24', description: 'Mạng văn phòng chính', active: true },
    { id: 2, ip: '10.0.0.0/16', description: 'Mạng nội bộ', active: true }
  ]);
  
  const [gpsConfig, setGpsConfig] = useState({
    latitude: 21.0285,
    longitude: 105.8542,
    radius: 100, // meters
    enabled: true
  });

  const [wifiNetworks, setWifiNetworks] = useState([
    { id: 1, ssid: 'MVS-Office-Main', description: 'WiFi văn phòng chính', active: true },
    { id: 2, ssid: 'MVS-Office-Guest', description: 'WiFi khách', active: false }
  ]);

  // Attendance Rules
  const [attendanceRules, setAttendanceRules] = useState({
    maxLateMinutes: 30,
    maxEarlyLeaveMinutes: 30,
    penaltyPerLateMinute: 5000, // VND
    penaltyPerEarlyMinute: 5000, // VND
    requireCheckInPhoto: true,
    requireCheckOutPhoto: false,
    allowManualAdjustment: true
  });

  // Mock attendance data
  const [attendanceData, setAttendanceData] = useState([
    {
      id: 1,
      employeeName: 'Nguyễn Anh Nam',
      role: 'ACCOUNTANT',
      date: '2024-01-15',
      checkIn: '08:15',
      checkOut: '17:30',
      status: 'late',
      lateMinutes: 15,
      location: 'Office',
      notes: 'Tắc đường'
    },
    {
      id: 2,
      employeeName: 'Trần Thị Bình',
      role: 'MANAGER',
      date: '2024-01-15',
      checkIn: '07:55',
      checkOut: '17:00',
      status: 'on-time',
      lateMinutes: 0,
      location: 'Office',
      notes: ''
    }
  ]);

  // Modal states
  const [ipModalVisible, setIpModalVisible] = useState(false);
  const [wifiModalVisible, setWifiModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Forms
  const [ipForm] = Form.useForm();
  const [wifiForm] = Form.useForm();

  useEffect(() => {
    // TODO: Load configuration from API
    loadConfiguration();
  }, []);

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      // TODO: API calls to load configuration
      // const workHours = await api.get('/admin/time-tracking/work-hours');
      // const network = await api.get('/admin/time-tracking/network-config');
      // const rules = await api.get('/admin/time-tracking/rules');
      
      console.log('Loading time tracking configuration...');
    } catch (error) {
      message.error('Không thể tải cấu hình chấm công');
    } finally {
      setLoading(false);
    }
  };

  const saveWorkHours = async (values) => {
    try {
      setLoading(true);
      // TODO: API call to save work hours
      // await api.put('/admin/time-tracking/work-hours', values);
      
      setWorkHoursConfig(values);
      message.success('Đã lưu cấu hình giờ làm việc');
    } catch (error) {
      message.error('Không thể lưu cấu hình giờ làm việc');
    } finally {
      setLoading(false);
    }
  };

  const handleAddIP = () => {
    setEditingItem(null);
    ipForm.resetFields();
    setIpModalVisible(true);
  };

  const handleEditIP = (item) => {
    setEditingItem(item);
    ipForm.setFieldsValue(item);
    setIpModalVisible(true);
  };

  const handleDeleteIP = async (id) => {
    try {
      // TODO: API call to delete IP
      // await api.delete(`/admin/time-tracking/ip-whitelist/${id}`);
      
      setIpWhitelist(prev => prev.filter(item => item.id !== id));
      message.success('Đã xóa IP khỏi whitelist');
    } catch (error) {
      message.error('Không thể xóa IP');
    }
  };

  const handleSaveIP = async (values) => {
    try {
      if (editingItem) {
        // Update existing IP
        setIpWhitelist(prev => prev.map(item => 
          item.id === editingItem.id ? { ...item, ...values } : item
        ));
        message.success('Đã cập nhật IP');
      } else {
        // Add new IP
        const newIP = {
          id: Date.now(),
          ...values,
          active: true
        };
        setIpWhitelist(prev => [...prev, newIP]);
        message.success('Đã thêm IP vào whitelist');
      }
      
      setIpModalVisible(false);
      ipForm.resetFields();
    } catch (error) {
      message.error('Không thể lưu IP');
    }
  };

  // Similar handlers for WiFi networks
  const handleAddWifi = () => {
    setEditingItem(null);
    wifiForm.resetFields();
    setWifiModalVisible(true);
  };

  const handleEditWifi = (item) => {
    setEditingItem(item);
    wifiForm.setFieldsValue(item);
    setWifiModalVisible(true);
  };

  const handleDeleteWifi = async (id) => {
    try {
      setWifiNetworks(prev => prev.filter(item => item.id !== id));
      message.success('Đã xóa mạng WiFi');
    } catch (error) {
      message.error('Không thể xóa mạng WiFi');
    }
  };

  const handleSaveWifi = async (values) => {
    try {
      if (editingItem) {
        setWifiNetworks(prev => prev.map(item => 
          item.id === editingItem.id ? { ...item, ...values } : item
        ));
        message.success('Đã cập nhật mạng WiFi');
      } else {
        const newWifi = {
          id: Date.now(),
          ...values,
          active: true
        };
        setWifiNetworks(prev => [...prev, newWifi]);
        message.success('Đã thêm mạng WiFi');
      }
      
      setWifiModalVisible(false);
      wifiForm.resetFields();
    } catch (error) {
      message.error('Không thể lưu mạng WiFi');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'on-time': return 'success';
      case 'late': return 'warning';
      case 'early-leave': return 'error';
      case 'absent': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'on-time': return 'Đúng giờ';
      case 'late': return 'Muộn';
      case 'early-leave': return 'Về sớm';
      case 'absent': return 'Vắng mặt';
      default: return 'Không xác định';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Quản lý chấm công nhân viên</h1>
        <p className="text-gray-600">Cấu hình và quản lý hệ thống chấm công cho nhân viên hành chính</p>
      </div>

      <Alert
        message="Lưu ý"
        description="Hệ thống chấm công chỉ áp dụng cho nhân viên hành chính (ACCOUNTANT, MANAGER, ADMIN). Giáo viên và học sinh sử dụng hệ thống điểm danh riêng."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <ClockCircleOutlined />
                Cấu hình giờ làm việc
              </span>
            }
            key="work-hours"
          >
            <Row gutter={24}>
              <Col span={12}>
                <Card title="Giờ làm việc tiêu chuẩn" size="small">
                  <Form
                    form={workHoursForm}
                    layout="vertical"
                    initialValues={workHoursConfig}
                    onFinish={saveWorkHours}
                  >
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="standardCheckIn"
                          label="Giờ vào làm"
                          rules={[{ required: true, message: 'Vui lòng chọn giờ vào làm' }]}
                        >
                          <TimePicker
                            format="HH:mm"
                            placeholder="Chọn giờ vào làm"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="standardCheckOut"
                          label="Giờ tan làm"
                          rules={[{ required: true, message: 'Vui lòng chọn giờ tan làm' }]}
                        >
                          <TimePicker
                            format="HH:mm"
                            placeholder="Chọn giờ tan làm"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name="lateThreshold"
                          label="Ngưỡng muộn (phút)"
                          rules={[
                            { required: true, message: 'Vui lòng nhập ngưỡng muộn' },
                            { type: 'number', min: 1, max: 60, message: 'Ngưỡng muộn từ 1-60 phút' }
                          ]}
                        >
                          <InputNumber
                            min={1}
                            max={60}
                            placeholder="15"
                            style={{ width: '100%' }}
                            addonAfter="phút"
                          />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name="earlyLeaveThreshold"
                          label="Ngưỡng về sớm (phút)"
                          rules={[
                            { required: true, message: 'Vui lòng nhập ngưỡng về sớm' },
                            { type: 'number', min: 1, max: 60, message: 'Ngưỡng về sớm từ 1-60 phút' }
                          ]}
                        >
                          <InputNumber
                            min={1}
                            max={60}
                            placeholder="15"
                            style={{ width: '100%' }}
                            addonAfter="phút"
                          />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="overtimeThreshold"
                      label="Ngưỡng tăng ca (phút sau giờ tan làm)"
                      rules={[
                        { type: 'number', min: 0, max: 180, message: 'Ngưỡng tăng ca từ 0-180 phút' }
                      ]}
                    >
                      <InputNumber
                        min={0}
                        max={180}
                        placeholder="30"
                        style={{ width: '100%' }}
                        addonAfter="phút"
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit" loading={loading}>
                        Lưu cấu hình
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Cấu hình linh hoạt" size="small">
                  <Form layout="vertical">
                    <Form.Item
                      name="enableFlexTime"
                      label="Cho phép giờ làm việc linh hoạt"
                      valuePropName="checked"
                    >
                      <Switch
                        checkedChildren="Bật"
                        unCheckedChildren="Tắt"
                        checked={workHoursConfig.enableFlexTime}
                        onChange={(checked) => setWorkHoursConfig(prev => ({ ...prev, enableFlexTime: checked }))}
                      />
                    </Form.Item>

                    {workHoursConfig.enableFlexTime && (
                      <Form.Item
                        name="flexTimeRange"
                        label="Khoảng thời gian linh hoạt"
                        help="Nhân viên có thể vào/ra sớm/muộn trong khoảng này"
                      >
                        <InputNumber
                          min={15}
                          max={120}
                          value={workHoursConfig.flexTimeRange}
                          onChange={(value) => setWorkHoursConfig(prev => ({ ...prev, flexTimeRange: value }))}
                          style={{ width: '100%' }}
                          addonAfter="phút"
                        />
                      </Form.Item>
                    )}

                    <Alert
                      message="Lưu ý về giờ làm việc linh hoạt"
                      description="Khi bật tính năng này, nhân viên có thể vào/ra làm trong khoảng thời gian được phép mà không bị tính là muộn/về sớm."
                      type="info"
                      showIcon
                    />
                  </Form>
                </Card>

                <Card title="Thống kê hiện tại" size="small" style={{ marginTop: 16 }}>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Giờ vào làm"
                        value={workHoursConfig.standardCheckIn?.format('HH:mm') || '08:00'}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Giờ tan làm"
                        value={workHoursConfig.standardCheckOut?.format('HH:mm') || '17:00'}
                        prefix={<ClockCircleOutlined />}
                      />
                    </Col>
                  </Row>
                  <Row gutter={16} style={{ marginTop: 16 }}>
                    <Col span={12}>
                      <Statistic
                        title="Ngưỡng muộn"
                        value={workHoursConfig.lateThreshold}
                        suffix="phút"
                        valueStyle={{ color: '#faad14' }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Ngưỡng về sớm"
                        value={workHoursConfig.earlyLeaveThreshold}
                        suffix="phút"
                        valueStyle={{ color: '#ff4d4f' }}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <EnvironmentOutlined />
                Mạng và vị trí
              </span>
            } 
            key="network-location"
          >
            <div>Cấu hình mạng và vị trí sẽ được thêm vào đây</div>
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <SettingOutlined />
                Quy tắc chấm công
              </span>
            }
            key="rules"
          >
            <Row gutter={24}>
              <Col span={12}>
                <Card title="Quy tắc phạt tiền" size="small">
                  <Form
                    layout="vertical"
                    initialValues={attendanceRules}
                    onFinish={(values) => {
                      setAttendanceRules(prev => ({ ...prev, ...values }));
                      message.success('Đã lưu quy tắc phạt tiền');
                    }}
                  >
                    <Form.Item
                      name="maxLateMinutes"
                      label="Số phút muộn tối đa cho phép"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số phút muộn tối đa' },
                        { type: 'number', min: 1, max: 120, message: 'Từ 1-120 phút' }
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={120}
                        style={{ width: '100%' }}
                        addonAfter="phút"
                        placeholder="30"
                      />
                    </Form.Item>

                    <Form.Item
                      name="maxEarlyLeaveMinutes"
                      label="Số phút về sớm tối đa cho phép"
                      rules={[
                        { required: true, message: 'Vui lòng nhập số phút về sớm tối đa' },
                        { type: 'number', min: 1, max: 120, message: 'Từ 1-120 phút' }
                      ]}
                    >
                      <InputNumber
                        min={1}
                        max={120}
                        style={{ width: '100%' }}
                        addonAfter="phút"
                        placeholder="30"
                      />
                    </Form.Item>

                    <Form.Item
                      name="penaltyPerLateMinute"
                      label="Phạt tiền mỗi phút muộn (VNĐ)"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mức phạt' },
                        { type: 'number', min: 1000, max: 50000, message: 'Từ 1,000-50,000 VNĐ' }
                      ]}
                    >
                      <InputNumber
                        min={1000}
                        max={50000}
                        step={1000}
                        style={{ width: '100%' }}
                        addonAfter="VNĐ"
                        placeholder="5000"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>

                    <Form.Item
                      name="penaltyPerEarlyMinute"
                      label="Phạt tiền mỗi phút về sớm (VNĐ)"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mức phạt' },
                        { type: 'number', min: 1000, max: 50000, message: 'Từ 1,000-50,000 VNĐ' }
                      ]}
                    >
                      <InputNumber
                        min={1000}
                        max={50000}
                        step={1000}
                        style={{ width: '100%' }}
                        addonAfter="VNĐ"
                        placeholder="5000"
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>

                    <Form.Item>
                      <Button type="primary" htmlType="submit">
                        Lưu quy tắc phạt tiền
                      </Button>
                    </Form.Item>
                  </Form>
                </Card>
              </Col>

              <Col span={12}>
                <Card title="Quy tắc chụp ảnh" size="small">
                  <Form layout="vertical">
                    <Form.Item
                      name="requireCheckInPhoto"
                      label="Yêu cầu chụp ảnh khi vào làm"
                      valuePropName="checked"
                    >
                      <Switch
                        checked={attendanceRules.requireCheckInPhoto}
                        onChange={(checked) => setAttendanceRules(prev => ({ ...prev, requireCheckInPhoto: checked }))}
                        checkedChildren="Bắt buộc"
                        unCheckedChildren="Không bắt buộc"
                      />
                    </Form.Item>

                    <Form.Item
                      name="requireCheckOutPhoto"
                      label="Yêu cầu chụp ảnh khi tan làm"
                      valuePropName="checked"
                    >
                      <Switch
                        checked={attendanceRules.requireCheckOutPhoto}
                        onChange={(checked) => setAttendanceRules(prev => ({ ...prev, requireCheckOutPhoto: checked }))}
                        checkedChildren="Bắt buộc"
                        unCheckedChildren="Không bắt buộc"
                      />
                    </Form.Item>

                    <Alert
                      message="Lưu ý về chụp ảnh"
                      description="Ảnh chụp sẽ được lưu trữ để xác minh danh tính và vị trí chấm công. Đảm bảo tuân thủ quy định về bảo mật dữ liệu cá nhân."
                      type="warning"
                      showIcon
                    />
                  </Form>
                </Card>

                <Card title="Quy tắc điều chỉnh" size="small" style={{ marginTop: 16 }}>
                  <Form layout="vertical">
                    <Form.Item
                      name="allowManualAdjustment"
                      label="Cho phép điều chỉnh thủ công"
                      valuePropName="checked"
                    >
                      <Switch
                        checked={attendanceRules.allowManualAdjustment}
                        onChange={(checked) => setAttendanceRules(prev => ({ ...prev, allowManualAdjustment: checked }))}
                        checkedChildren="Cho phép"
                        unCheckedChildren="Không cho phép"
                      />
                    </Form.Item>

                    <Alert
                      message="Điều chỉnh thủ công"
                      description={
                        attendanceRules.allowManualAdjustment
                          ? "Admin có thể điều chỉnh thời gian chấm công của nhân viên khi có lý do chính đáng."
                          : "Không cho phép điều chỉnh thời gian chấm công. Mọi thay đổi phải thông qua quy trình ngoại lệ."
                      }
                      type={attendanceRules.allowManualAdjustment ? "info" : "warning"}
                      showIcon
                    />
                  </Form>
                </Card>

                <Card title="Tóm tắt quy tắc hiện tại" size="small" style={{ marginTop: 16 }}>
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div>
                      <strong>Phạt muộn:</strong> {attendanceRules.penaltyPerLateMinute?.toLocaleString()} VNĐ/phút
                    </div>
                    <div>
                      <strong>Phạt về sớm:</strong> {attendanceRules.penaltyPerEarlyMinute?.toLocaleString()} VNĐ/phút
                    </div>
                    <div>
                      <strong>Chụp ảnh vào làm:</strong>
                      <Tag color={attendanceRules.requireCheckInPhoto ? 'success' : 'default'} style={{ marginLeft: 8 }}>
                        {attendanceRules.requireCheckInPhoto ? 'Bắt buộc' : 'Không bắt buộc'}
                      </Tag>
                    </div>
                    <div>
                      <strong>Chụp ảnh tan làm:</strong>
                      <Tag color={attendanceRules.requireCheckOutPhoto ? 'success' : 'default'} style={{ marginLeft: 8 }}>
                        {attendanceRules.requireCheckOutPhoto ? 'Bắt buộc' : 'Không bắt buộc'}
                      </Tag>
                    </div>
                    <div>
                      <strong>Điều chỉnh thủ công:</strong>
                      <Tag color={attendanceRules.allowManualAdjustment ? 'success' : 'error'} style={{ marginLeft: 8 }}>
                        {attendanceRules.allowManualAdjustment ? 'Cho phép' : 'Không cho phép'}
                      </Tag>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <EyeOutlined />
                Báo cáo chấm công
              </span>
            }
            key="reports"
          >
            {/* Statistics Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Tổng số bản ghi"
                    value={attendanceData.length}
                    prefix={<ClockCircleOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Đúng giờ"
                    value={attendanceData.filter(item => item.status === 'on-time').length}
                    prefix={<CheckCircleOutlined />}
                    valueStyle={{ color: '#52c41a' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Muộn"
                    value={attendanceData.filter(item => item.status === 'late').length}
                    prefix={<WarningOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card>
                  <Statistic
                    title="Vắng mặt"
                    value={attendanceData.filter(item => item.status === 'absent').length}
                    prefix={<CloseCircleOutlined />}
                    valueStyle={{ color: '#ff4d4f' }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Filters */}
            <Card size="small" style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={6}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Khoảng thời gian:
                  </label>
                  <RangePicker
                    style={{ width: '100%' }}
                    placeholder={['Từ ngày', 'Đến ngày']}
                    format="DD/MM/YYYY"
                  />
                </Col>
                <Col span={6}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Nhân viên:
                  </label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn nhân viên"
                    allowClear
                    showSearch
                    filterOption={(input, option) =>
                      option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                    }
                  >
                    <Option value="all">Tất cả nhân viên</Option>
                    {attendanceData.map(item => (
                      <Option key={item.employeeName} value={item.employeeName}>
                        {item.employeeName}
                      </Option>
                    ))}
                  </Select>
                </Col>
                <Col span={6}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Trạng thái:
                  </label>
                  <Select
                    style={{ width: '100%' }}
                    placeholder="Chọn trạng thái"
                    allowClear
                  >
                    <Option value="all">Tất cả trạng thái</Option>
                    <Option value="on-time">Đúng giờ</Option>
                    <Option value="late">Muộn</Option>
                    <Option value="early-leave">Về sớm</Option>
                    <Option value="absent">Vắng mặt</Option>
                  </Select>
                </Col>
                <Col span={6}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                    Thao tác:
                  </label>
                  <Space>
                    <Button type="primary" icon={<EyeOutlined />}>
                      Lọc
                    </Button>
                    <Button icon={<DownloadOutlined />}>
                      Xuất Excel
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>

            {/* Attendance Table */}
            <Table
              columns={[
                {
                  title: 'Nhân viên',
                  dataIndex: 'employeeName',
                  key: 'employeeName',
                  sorter: (a, b) => a.employeeName.localeCompare(b.employeeName),
                },
                {
                  title: 'Vai trò',
                  dataIndex: 'role',
                  key: 'role',
                  render: (role) => (
                    <Tag color={role === 'MANAGER' ? 'blue' : role === 'ACCOUNTANT' ? 'green' : 'default'}>
                      {role === 'MANAGER' ? 'Quản lý' : role === 'ACCOUNTANT' ? 'Kế toán' : role}
                    </Tag>
                  ),
                },
                {
                  title: 'Ngày',
                  dataIndex: 'date',
                  key: 'date',
                  sorter: (a, b) => new Date(a.date) - new Date(b.date),
                  render: (date) => dayjs(date).format('DD/MM/YYYY'),
                },
                {
                  title: 'Giờ vào',
                  dataIndex: 'checkIn',
                  key: 'checkIn',
                  sorter: (a, b) => a.checkIn.localeCompare(b.checkIn),
                },
                {
                  title: 'Giờ ra',
                  dataIndex: 'checkOut',
                  key: 'checkOut',
                  sorter: (a, b) => a.checkOut.localeCompare(b.checkOut),
                },
                {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (status) => (
                    <Tag color={getStatusColor(status)}>
                      {getStatusText(status)}
                    </Tag>
                  ),
                  filters: [
                    { text: 'Đúng giờ', value: 'on-time' },
                    { text: 'Muộn', value: 'late' },
                    { text: 'Về sớm', value: 'early-leave' },
                    { text: 'Vắng mặt', value: 'absent' },
                  ],
                  onFilter: (value, record) => record.status === value,
                },
                {
                  title: 'Số phút muộn',
                  dataIndex: 'lateMinutes',
                  key: 'lateMinutes',
                  render: (minutes) => minutes > 0 ? `${minutes} phút` : '-',
                  sorter: (a, b) => a.lateMinutes - b.lateMinutes,
                },
                {
                  title: 'Vị trí',
                  dataIndex: 'location',
                  key: 'location',
                },
                {
                  title: 'Ghi chú',
                  dataIndex: 'notes',
                  key: 'notes',
                  render: (notes) => notes || '-',
                },
                {
                  title: 'Thao tác',
                  key: 'actions',
                  render: (_, record) => (
                    <Space>
                      <Tooltip title="Xem chi tiết">
                        <Button type="link" size="small" icon={<EyeOutlined />} />
                      </Tooltip>
                      {attendanceRules.allowManualAdjustment && (
                        <Tooltip title="Điều chỉnh">
                          <Button type="link" size="small" icon={<EditOutlined />} />
                        </Tooltip>
                      )}
                    </Space>
                  ),
                },
              ]}
              dataSource={attendanceData}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bản ghi`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>
          
          <TabPane 
            tab={
              <span>
                <ExclamationCircleOutlined />
                Quản lý ngoại lệ
              </span>
            } 
            key="exceptions"
          >
            <div>Quản lý ngoại lệ sẽ được thêm vào đây</div>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  );
};

export default AdminTimeTracking;
