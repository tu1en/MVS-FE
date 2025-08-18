import {
  CalendarOutlined,
  ClockCircleOutlined,
  EyeOutlined,
  PlusOutlined,
  UploadOutlined
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  List,
  message,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
  Typography,
  Upload
} from 'antd';
import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import ChildSwitcher from '../../components/parent/ChildSwitcher';
import { parentAPI } from '../../services/api';

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
  
  // Class sessions state
  const [classSessions, setClassSessions] = useState([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [dateRange, setDateRange] = useState([dayjs(), dayjs().add(7, 'days')]);
  const [fileList, setFileList] = useState([]);
  const { RangePicker } = DatePicker;

  // Load children and leave notices data
  useEffect(() => {
    loadChildren();
    loadLeaveNotices();
  }, []);

  const loadChildren = async () => {
    try {
      console.log('Loading children...');
      const response = await parentAPI.getChildren();
      console.log('Children response:', response);
      console.log('Children data:', response.data);
      
      // Debug: Log each child's structure
      if (response.data && response.data.length > 0) {
        console.log('First child structure:', response.data[0]);
        console.log('First child keys:', Object.keys(response.data[0]));
        console.log('First child values:', Object.values(response.data[0]));
      }
      
      // Transform data to ensure required fields exist
      const transformedChildren = (response.data || []).map(child => ({
        ...child, // Keep all other fields FIRST
        id: child.studentId, // Use studentId instead of relationship id - OVERRIDE after spread
        studentId: child.studentId, // Keep original studentId for API calls
        relationshipId: child.id, // Keep relationship ID for reference
        name: child.student?.fullName || child.student?.name || `Học sinh ${child.studentId}`,
        grade: child.student?.grade || child.student?.class || 'Chưa xác định',
        teacherName: child.student?.teacherName || child.student?.teacher || 'Chưa xác định',
        avatar: child.student?.avatar || child.student?.profilePicture,
        relationType: child.relationType,
        relationDisplayName: child.relationDisplayName
      }));
      
      console.log('Transformed children:', transformedChildren);
      
      setChildren(transformedChildren);
      if (transformedChildren.length > 0) {
        const selectedId = transformedChildren[0].id;
        const originalId = transformedChildren[0].relationshipId;
        console.log('Setting selected child ID:', selectedId, '(was relationship ID:', originalId, ')');
        console.log('First child after transform:', {
          id: transformedChildren[0].id,
          studentId: transformedChildren[0].studentId,
          relationshipId: transformedChildren[0].relationshipId
        });
        setSelectedChildId(selectedId);
      } else {
        console.log('No children data found');
      }
    } catch (error) {
      console.error('Error loading children:', error);
      message.error('Không thể tải danh sách con em');
    }
  };

  const loadLeaveNotices = async () => {
    try {
      const response = await parentAPI.getLeaveNotices();
      setLeaveNotices(response.data || []);
    } catch (error) {
      console.error('Error loading leave notices:', error);
      message.error('Không thể tải danh sách thông báo nghỉ học');
    }
  };

  // Fetch class sessions for selected child
  const fetchClassSessions = async (childId, startDate, endDate) => {
    if (!childId || !startDate || !endDate) return;
    
    try {
      setSessionsLoading(true);
      const response = await parentAPI.getChildSchedule(childId, startDate, endDate);
      setClassSessions(response.data || []);
    } catch (error) {
      console.error('Error fetching class sessions:', error);
      message.error('Không thể tải lịch học');
      setClassSessions([]);
    } finally {
      setSessionsLoading(false);
    }
  };

  // Load class sessions when child or date range changes
  useEffect(() => {
    if (selectedChildId && dateRange?.[0] && dateRange?.[1]) {
      fetchClassSessions(
        selectedChildId,
        dateRange[0].format('YYYY-MM-DD'),
        dateRange[1].format('YYYY-MM-DD')
      );
    }
  }, [selectedChildId, dateRange]);

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
      
      // Validate required fields
      if (!selectedChildId) {
        message.error('Vui lòng chọn con em');
        return;
      }
      
      if (!values.reasonCode) {
        message.error('Vui lòng chọn lý do nghỉ học');
        return;
      }
      
      // Validate business rules
      const selectedDate = dayjs(values.date);
      const today = dayjs();
      
      if (selectedDate.isBefore(today, 'day')) {
        message.error('Không thể tạo thông báo cho ngày đã qua');
        return;
      }

      // Prepare notice data
      const noticeData = {
        studentId: selectedChildId, // This should be the actual student ID, not relationship ID
        type: noticeType,
        date: selectedDate.format('YYYY-MM-DD'),
        reasonCode: values.reasonCode,
        note: values.note || ''
      };

      if (noticeType === 'LATE') {
        if (!values.arriveAt) {
          message.error('Vui lòng chọn giờ đến trường');
          return;
        }
        noticeData.arriveAt = values.arriveAt.format('HH:mm:ss');
      } else if (noticeType === 'EARLY') {
        if (!values.leaveAt) {
          message.error('Vui lòng chọn giờ về');
          return;
        }
        noticeData.leaveAt = values.leaveAt.format('HH:mm:ss');
      }

      console.log('Sending notice data:', noticeData);

      // Call real API
      const response = await parentAPI.createLeaveNotice(noticeData);
      
      message.success('Thông báo nghỉ học đã được gửi thành công');
      form.resetFields();
      setNoticeType('FULL_DAY');
      setFileList([]);
      
      // Reload leave notices
      loadLeaveNotices();

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

  // Class sessions table columns
  const sessionsColumns = [
    {
      title: 'Ngày',
      dataIndex: 'date',
      key: 'date',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
      sorter: (a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf(),
    },
    {
      title: 'Thời gian',
      key: 'time',
      render: (_, record) => (
        <Space>
          <Tag color="blue">{record.startTime}</Tag>
          <span>-</span>
          <Tag color="blue">{record.endTime}</Tag>
        </Space>
      ),
    },
    {
      title: 'Môn học',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject) => <Tag color="green">{subject || 'Chưa xác định'}</Tag>,
    },
    {
      title: 'Phòng học',
      dataIndex: 'classroom',
      key: 'classroom',
      render: (classroom) => <Text>{classroom || 'Chưa xác định'}</Text>,
    },
    {
      title: 'Giáo viên',
      dataIndex: 'teacher',
      key: 'teacher',
      render: (teacher) => <Text>{teacher || 'Chưa xác định'}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === 'class' ? 'blue' : 'orange'}>
          {type === 'class' ? 'Lớp học' : 'Bài tập'}
        </Tag>
      ),
    },
  ];

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

      {/* Class Sessions Section */}
      <Card 
        title={
          <Space>
            <CalendarOutlined />
            <span>Lịch học hiện tại</span>
          </Space>
        }
        style={{ marginTop: '24px' }}
        extra={
          <Space>
            <Text>Chọn khoảng thời gian:</Text>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
              allowClear={false}
            />
          </Space>
        }
      >
        <Table
          columns={sessionsColumns}
          dataSource={classSessions}
          loading={sessionsLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `Tổng ${total} buổi học`,
          }}
          locale={{
            emptyText: selectedChildId ? 'Không có buổi học nào trong khoảng thời gian này' : 'Vui lòng chọn con em để xem lịch học'
          }}
          scroll={{ x: 800 }}
        />
      </Card>

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
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
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