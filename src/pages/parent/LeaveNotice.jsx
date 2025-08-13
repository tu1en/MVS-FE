import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Form, 
  Radio, 
  DatePicker, 
  TimePicker, 
  Select, 
  Input, 
  Button, 
  Upload, 
  List, 
  Badge, 
  Typography, 
  Row, 
  Col, 
  Modal, 
  message,
  Tag,
  Divider,
  Empty
} from 'antd';
import { 
  PlusOutlined, 
  UploadOutlined, 
  CalendarOutlined, 
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import ChildSwitcher from '../../components/parent/ChildSwitcher';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

/**
 * Leave Notice Component
 * Based on PARENT_ROLE_SPEC.md - Core feature for parent leave notifications
 * Features: FULL_DAY/LATE/EARLY notices, real-time validation, history tracking
 */
const LeaveNotice = () => {
  const [form] = Form.useForm();
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [noticeType, setNoticeType] = useState('FULL_DAY');
  const [loading, setLoading] = useState(false);
  const [children, setChildren] = useState([]);
  const [leaveNotices, setLeaveNotices] = useState([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState(null);

  // Mock data
  useEffect(() => {
    const mockChildren = [
      {
        id: 1,
        name: 'Nguyễn Minh An',
        grade: 'Lớp 11A',
        teacherName: 'Cô Hoàng Thị Mai'
      },
      {
        id: 2,
        name: 'Nguyễn Minh Hằng',
        grade: 'Lớp 9B',
        teacherName: 'Thầy Trần Văn Bình'
      }
    ];

    const mockNotices = [
      {
        id: 1,
        studentId: 1,
        studentName: 'Nguyễn Minh An',
        type: 'LATE',
        date: '2025-08-15',
        arriveAt: '09:30',
        reasonCode: 'FAMILY',
        note: 'Đi khám bệnh định kỳ',
        status: 'ACKNOWLEDGED',
        ackAt: '2025-08-14 16:30:00',
        ackByTeacher: 'Cô Hoàng Thị Mai',
        createdAt: '2025-08-14 15:00:00'
      },
      {
        id: 2,
        studentId: 1,
        studentName: 'Nguyễn Minh An',
        type: 'FULL_DAY',
        date: '2025-08-20',
        reasonCode: 'SICK',
        note: 'Sốt nhẹ, cần nghỉ ngơi',
        status: 'SENT',
        createdAt: '2025-08-13 20:15:00'
      }
    ];

    setChildren(mockChildren);
    setLeaveNotices(mockNotices);
    if (mockChildren.length > 0) {
      setSelectedChildId(mockChildren[0].id);
    }
  }, []);

  const reasonOptions = [
    { value: 'SICK', label: 'Ốm đau', color: 'red' },
    { value: 'FAMILY', label: 'Việc gia đình', color: 'blue' },
    { value: 'APPOINTMENT', label: 'Có hẹn khám bệnh', color: 'green' },
    { value: 'EMERGENCY', label: 'Khẩn cấp', color: 'orange' },
    { value: 'OTHER', label: 'Lý do khác', color: 'default' }
  ];

  const getStatusBadge = (status) => {
    const statusConfig = {
      'SENT': { color: 'processing', text: 'Đã gửi' },
      'DELIVERED': { color: 'warning', text: 'Đã chuyển đến' },
      'ACKNOWLEDGED': { color: 'success', text: 'Đã xác nhận' }
    };
    return statusConfig[status] || { color: 'default', text: status };
  };

  const getTypeDisplay = (type) => {
    const typeConfig = {
      'FULL_DAY': { text: 'Nghỉ cả ngày', icon: <CalendarOutlined />, color: 'blue' },
      'LATE': { text: 'Đến muộn', icon: <ClockCircleOutlined />, color: 'orange' },
      'EARLY': { text: 'Về sớm', icon: <ClockCircleOutlined />, color: 'green' }
    };
    return typeConfig[type] || { text: type, icon: null, color: 'default' };
  };

  const validateTimeConstraints = (_, value) => {
    if (noticeType === 'LATE' && !value) {
      return Promise.reject(new Error('Vui lòng chọn giờ đến trường'));
    }
    if (noticeType === 'EARLY' && !value) {
      return Promise.reject(new Error('Vui lòng chọn giờ về'));
    }
    return Promise.resolve();
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // Validate business rules
      const selectedDate = dayjs(values.date);
      const today = dayjs();
      
      if (selectedDate.isBefore(today, 'day')) {
        message.error('Không thể tạo thông báo cho ngày đã qua');
        return;
      }

      // Prepare notice data
      const noticeData = {
        studentId: selectedChildId,
        type: noticeType,
        date: selectedDate.format('YYYY-MM-DD'),
        reasonCode: values.reasonCode,
        note: values.note || '',
        attachments: values.attachments?.fileList || []
      };

      if (noticeType === 'LATE') {
        noticeData.arriveAt = values.arriveAt.format('HH:mm');
      } else if (noticeType === 'EARLY') {
        noticeData.leaveAt = values.leaveAt.format('HH:mm');
      }

      // Mock API call
      console.log('Creating leave notice:', noticeData);
      
      // Simulate API response
      const newNotice = {
        id: Date.now(),
        ...noticeData,
        studentName: children.find(c => c.id === selectedChildId)?.name,
        status: 'SENT',
        createdAt: new Date().toISOString()
      };

      setLeaveNotices(prev => [newNotice, ...prev]);
      message.success('Thông báo nghỉ học đã được gửi thành công');
      form.resetFields();
      setNoticeType('FULL_DAY');

    } catch (error) {
      console.error('Error creating leave notice:', error);
      message.error('Có lỗi xảy ra khi gửi thông báo');
    } finally {
      setLoading(false);
    }
  };

  const showNoticeDetail = (notice) => {
    setSelectedNotice(notice);
    setDetailModalVisible(true);
  };

  const filteredNotices = leaveNotices.filter(notice => 
    !selectedChildId || notice.studentId === selectedChildId
  );

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <CalendarOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
        Thông báo nghỉ học
      </Title>
      <Text type="secondary" style={{ marginBottom: '24px', display: 'block' }}>
        Gửi thông báo nghỉ học cho giáo viên chủ nhiệm
      </Text>

      {/* Child Switcher */}
      <ChildSwitcher 
        children={children}
        selectedChildId={selectedChildId}
        onChildChange={setSelectedChildId}
      />

      <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
        {/* Create Notice Form */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <PlusOutlined style={{ marginRight: '8px' }} />
                Tạo thông báo mới
              </span>
            }
          >
            <Form 
              form={form} 
              layout="vertical" 
              onFinish={handleSubmit}
              initialValues={{ type: 'FULL_DAY' }}
            >
              {/* Notice Type */}
              <Form.Item 
                label="Loại thông báo" 
                name="type"
                rules={[{ required: true, message: 'Vui lòng chọn loại thông báo' }]}
              >
                <Radio.Group 
                  value={noticeType} 
                  onChange={(e) => {
                    setNoticeType(e.target.value);
                    form.setFieldsValue({ type: e.target.value });
                  }}
                  style={{ width: '100%' }}
                >
                  <Radio.Button value="FULL_DAY" style={{ width: '33.33%', textAlign: 'center' }}>
                    Nghỉ cả ngày
                  </Radio.Button>
                  <Radio.Button value="LATE" style={{ width: '33.33%', textAlign: 'center' }}>
                    Đến muộn
                  </Radio.Button>
                  <Radio.Button value="EARLY" style={{ width: '33.33%', textAlign: 'center' }}>
                    Về sớm
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              {/* Date */}
              <Form.Item 
                label="Ngày" 
                name="date"
                rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  disabledDate={(current) => current && current.isBefore(dayjs(), 'day')}
                  placeholder="Chọn ngày nghỉ"
                />
              </Form.Item>

              {/* Time fields based on type */}
              {noticeType === 'LATE' && (
                <Form.Item 
                  label="Giờ đến trường" 
                  name="arriveAt"
                  rules={[{ validator: validateTimeConstraints }]}
                >
                  <TimePicker 
                    style={{ width: '100%' }}
                    format="HH:mm"
                    placeholder="Chọn giờ đến"
                  />
                </Form.Item>
              )}

              {noticeType === 'EARLY' && (
                <Form.Item 
                  label="Giờ về" 
                  name="leaveAt"
                  rules={[{ validator: validateTimeConstraints }]}
                >
                  <TimePicker 
                    style={{ width: '100%' }}
                    format="HH:mm"
                    placeholder="Chọn giờ về"
                  />
                </Form.Item>
              )}

              {/* Reason */}
              <Form.Item 
                label="Lý do" 
                name="reasonCode"
                rules={[{ required: true, message: 'Vui lòng chọn lý do' }]}
              >
                <Select placeholder="Chọn lý do nghỉ">
                  {reasonOptions.map(reason => (
                    <Option key={reason.value} value={reason.value}>
                      <Tag color={reason.color}>{reason.label}</Tag>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {/* Note */}
              <Form.Item label="Ghi chú" name="note">
                <TextArea 
                  rows={3} 
                  placeholder="Ghi chú thêm về lý do nghỉ học (không bắt buộc)"
                />
              </Form.Item>

              {/* Attachments */}
              <Form.Item label="Đính kèm" name="attachments">
                <Upload
                  listType="text"
                  beforeUpload={() => false}
                  multiple
                >
                  <Button icon={<UploadOutlined />}>
                    Tải lên tài liệu (nếu có)
                  </Button>
                </Upload>
              </Form.Item>

              {/* Submit */}
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                  block
                  size="large"
                  disabled={!selectedChildId}
                >
                  Gửi thông báo
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Notice History */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <span>
                <ClockCircleOutlined style={{ marginRight: '8px' }} />
                Lịch sử thông báo
              </span>
            }
          >
            {filteredNotices.length > 0 ? (
              <List
                dataSource={filteredNotices}
                renderItem={(notice) => {
                  const typeInfo = getTypeDisplay(notice.type);
                  const statusInfo = getStatusBadge(notice.status);
                  const reason = reasonOptions.find(r => r.value === notice.reasonCode);

                  return (
                    <List.Item
                      actions={[
                        <Button 
                          type="link" 
                          icon={<EyeOutlined />}
                          onClick={() => showNoticeDetail(notice)}
                        >
                          Xem
                        </Button>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <div>
                            <Tag color={typeInfo.color} icon={typeInfo.icon}>
                              {typeInfo.text}
                            </Tag>
                            <Badge 
                              status={statusInfo.color} 
                              text={statusInfo.text}
                              style={{ marginLeft: '8px' }}
                            />
                          </div>
                        }
                        description={
                          <div>
                            <Text strong>{notice.date}</Text>
                            {notice.arriveAt && <Text> - Đến lúc {notice.arriveAt}</Text>}
                            {notice.leaveAt && <Text> - Về lúc {notice.leaveAt}</Text>}
                            <br />
                            <Tag color={reason?.color} size="small">
                              {reason?.label}
                            </Tag>
                            {notice.note && (
                              <Text type="secondary"> - {notice.note}</Text>
                            )}
                          </div>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="Chưa có thông báo nghỉ học nào" />
            )}
          </Card>
        </Col>
      </Row>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết thông báo nghỉ học"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>
        ]}
        width={600}
      >
        {selectedNotice && (
          <div>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Text strong>Học sinh:</Text>
                <br />
                <Text>{selectedNotice.studentName}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Loại thông báo:</Text>
                <br />
                <Tag color={getTypeDisplay(selectedNotice.type).color}>
                  {getTypeDisplay(selectedNotice.type).text}
                </Tag>
              </Col>
              <Col span={12}>
                <Text strong>Ngày:</Text>
                <br />
                <Text>{selectedNotice.date}</Text>
              </Col>
              <Col span={12}>
                <Text strong>Trạng thái:</Text>
                <br />
                <Badge 
                  status={getStatusBadge(selectedNotice.status).color}
                  text={getStatusBadge(selectedNotice.status).text}
                />
              </Col>
              {selectedNotice.arriveAt && (
                <Col span={12}>
                  <Text strong>Giờ đến:</Text>
                  <br />
                  <Text>{selectedNotice.arriveAt}</Text>
                </Col>
              )}
              {selectedNotice.leaveAt && (
                <Col span={12}>
                  <Text strong>Giờ về:</Text>
                  <br />
                  <Text>{selectedNotice.leaveAt}</Text>
                </Col>
              )}
              <Col span={24}>
                <Text strong>Lý do:</Text>
                <br />
                <Tag color={reasonOptions.find(r => r.value === selectedNotice.reasonCode)?.color}>
                  {reasonOptions.find(r => r.value === selectedNotice.reasonCode)?.label}
                </Tag>
              </Col>
              {selectedNotice.note && (
                <Col span={24}>
                  <Text strong>Ghi chú:</Text>
                  <br />
                  <Text>{selectedNotice.note}</Text>
                </Col>
              )}
              {selectedNotice.ackAt && (
                <>
                  <Col span={12}>
                    <Text strong>Xác nhận lúc:</Text>
                    <br />
                    <Text>{selectedNotice.ackAt}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Xác nhận bởi:</Text>
                    <br />
                    <Text>{selectedNotice.ackByTeacher}</Text>
                  </Col>
                </>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default LeaveNotice;