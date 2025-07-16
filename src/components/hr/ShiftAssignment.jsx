import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  DatePicker,
  Button,
  Table,
  message,
  Row,
  Col,
  Input,
  Space,
  Tag,
  Divider,
  Alert
} from 'antd';
import {
  UserOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import hrService from '../../services/hrService';

const { RangePicker } = DatePicker;
const { Search } = Input;
const { Option } = Select;

/**
 * Component phân công ca làm việc cho nhân viên
 * Chỉ dành cho Manager và Admin
 */
const ShiftAssignment = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Data states
  const [eligibleUsers, setEligibleUsers] = useState([]);
  const [activeShifts, setActiveShifts] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [selectedShift, setSelectedShift] = useState(null);
  const [dateRange, setDateRange] = useState([]);
  
  // Filter states
  const [userSearchText, setUserSearchText] = useState('');
  const [filteredUsers, setFilteredUsers] = useState([]);
  
  // Validation states
  const [conflicts, setConflicts] = useState([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);

  // Load initial data
  useEffect(() => {
    loadEligibleUsers();
    loadActiveShifts();
  }, []);

  // Filter users based on search text
  useEffect(() => {
    if (userSearchText.trim()) {
      const filtered = eligibleUsers.filter(user =>
        user.fullName.toLowerCase().includes(userSearchText.toLowerCase()) ||
        user.email.toLowerCase().includes(userSearchText.toLowerCase()) ||
        (user.department && user.department.toLowerCase().includes(userSearchText.toLowerCase()))
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(eligibleUsers);
    }
  }, [eligibleUsers, userSearchText]);

  // Load eligible users for shift assignment
  const loadEligibleUsers = async () => {
    try {
      const response = await hrService.getEligibleUsers();
      if (response.success) {
        setEligibleUsers(response.data);
        setFilteredUsers(response.data);
      } else {
        message.error('Không thể tải danh sách nhân viên');
      }
    } catch (error) {
      console.error('Error loading eligible users:', error);
      message.error('Có lỗi xảy ra khi tải danh sách nhân viên');
    }
  };

  // Load active shifts
  const loadActiveShifts = async () => {
    try {
      const response = await hrService.getActiveShifts();
      if (response.success) {
        setActiveShifts(response.data);
      } else {
        message.error('Không thể tải danh sách ca làm việc');
      }
    } catch (error) {
      console.error('Error loading active shifts:', error);
      message.error('Có lỗi xảy ra khi tải danh sách ca làm việc');
    }
  };

  // Check for conflicts when form values change
  const checkConflicts = async (userIds, shiftId, startDate, endDate) => {
    if (!userIds?.length || !shiftId || !startDate || !endDate) {
      setConflicts([]);
      return;
    }

    setCheckingConflicts(true);
    const conflictResults = [];

    try {
      for (const userId of userIds) {
        const response = await hrService.checkOverlappingAssignments(
          userId,
          startDate.format('YYYY-MM-DD'),
          endDate.format('YYYY-MM-DD')
        );

        if (response.success && response.hasOverlap) {
          const user = eligibleUsers.find(u => u.id === userId);
          conflictResults.push({
            userId,
            userName: user?.fullName || 'Unknown',
            overlappingAssignments: response.overlappingAssignments
          });
        }
      }

      setConflicts(conflictResults);
    } catch (error) {
      console.error('Error checking conflicts:', error);
    } finally {
      setCheckingConflicts(false);
    }
  };

  // Handle form values change
  const handleFormChange = (changedValues, allValues) => {
    if (changedValues.userIds) {
      setSelectedUsers(changedValues.userIds || []);
    }
    
    if (changedValues.shiftId) {
      const shift = activeShifts.find(s => s.id === changedValues.shiftId);
      setSelectedShift(shift);
    }
    
    if (changedValues.dateRange) {
      setDateRange(changedValues.dateRange || []);
    }

    // Check conflicts when relevant values change
    if (changedValues.userIds || changedValues.shiftId || changedValues.dateRange) {
      const { userIds, shiftId, dateRange } = allValues;
      if (userIds?.length && shiftId && dateRange?.length === 2) {
        checkConflicts(userIds, shiftId, dateRange[0], dateRange[1]);
      } else {
        setConflicts([]);
      }
    }
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    if (conflicts.length > 0) {
      message.error('Vui lòng giải quyết các xung đột trước khi tiếp tục');
      return;
    }

    setSubmitting(true);
    try {
      const assignmentData = {
        userIds: values.userIds,
        shiftId: values.shiftId,
        startDate: values.dateRange[0].format('YYYY-MM-DD'),
        endDate: values.dateRange[1].format('YYYY-MM-DD'),
        notes: values.notes?.trim() || null
      };

      const response = await hrService.createShiftAssignments(assignmentData);
      
      if (response.success) {
        message.success(`Đã phân công thành công cho ${response.count} nhân viên`);
        form.resetFields();
        setSelectedUsers([]);
        setSelectedShift(null);
        setDateRange([]);
        setConflicts([]);
      } else {
        message.error(response.message || 'Có lỗi xảy ra khi phân công ca làm việc');
      }
    } catch (error) {
      console.error('Error creating shift assignments:', error);
      message.error('Có lỗi xảy ra khi phân công ca làm việc');
    } finally {
      setSubmitting(false);
    }
  };

  // Table columns for selected users
  const userColumns = [
    {
      title: 'Tên nhân viên',
      dataIndex: 'fullName',
      key: 'fullName',
      render: (text, record) => (
        <div>
          <div><strong>{text}</strong></div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      )
    },
    {
      title: 'Phòng ban',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => dept || 'Chưa xác định'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'MANAGER' ? 'blue' : role === 'ACCOUNTANT' ? 'green' : 'default'}>
          {role === 'MANAGER' ? 'Quản lý' : 
           role === 'ACCOUNTANT' ? 'Kế toán' : role}
        </Tag>
      )
    }
  ];

  const selectedUserData = selectedUsers.map(userId => 
    eligibleUsers.find(user => user.id === userId)
  ).filter(Boolean);

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Phân công Ca làm việc" extra={<CalendarOutlined />}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFormChange}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="userIds"
                label="Chọn nhân viên"
                rules={[{ required: true, message: 'Vui lòng chọn ít nhất một nhân viên' }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn nhân viên cần phân công ca"
                  showSearch
                  filterOption={false}
                  onSearch={setUserSearchText}
                  loading={loading}
                  dropdownRender={menu => (
                    <div>
                      <div style={{ padding: '8px' }}>
                        <Search
                          placeholder="Tìm kiếm nhân viên..."
                          value={userSearchText}
                          onChange={e => setUserSearchText(e.target.value)}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <Divider style={{ margin: '4px 0' }} />
                      {menu}
                    </div>
                  )}
                >
                  {filteredUsers.map(user => (
                    <Option key={user.id} value={user.id}>
                      <div>
                        <div><strong>{user.fullName}</strong></div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {user.email} • {user.department || 'Chưa xác định'}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="shiftId"
                label="Ca làm việc"
                rules={[{ required: true, message: 'Vui lòng chọn ca làm việc' }]}
              >
                <Select placeholder="Chọn ca làm việc">
                  {activeShifts.map(shift => (
                    <Option key={shift.id} value={shift.id}>
                      <div>
                        <div><strong>{shift.name}</strong></div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {shift.startTime} - {shift.endTime} ({shift.workingHours?.toFixed(1)}h)
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="dateRange"
                label="Thời gian áp dụng"
                rules={[{ required: true, message: 'Vui lòng chọn thời gian áp dụng' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="notes" label="Ghi chú (tùy chọn)">
                <Input.TextArea
                  rows={3}
                  placeholder="Nhập ghi chú cho phân công này..."
                  maxLength={1000}
                  showCount
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Conflicts Alert */}
          {conflicts.length > 0 && (
            <Alert
              message="Phát hiện xung đột phân công"
              description={
                <div>
                  {conflicts.map(conflict => (
                    <div key={conflict.userId} style={{ marginBottom: '8px' }}>
                      <strong>{conflict.userName}</strong> đã có phân công trùng lặp:
                      <ul style={{ marginLeft: '16px', marginTop: '4px' }}>
                        {conflict.overlappingAssignments.map(assignment => (
                          <li key={assignment.id}>
                            {assignment.shiftName} ({assignment.dateRange})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              }
              type="error"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          {/* Selected Users Preview */}
          {selectedUserData.length > 0 && (
            <div style={{ marginBottom: '16px' }}>
              <h4>Nhân viên được chọn ({selectedUserData.length})</h4>
              <Table
                columns={userColumns}
                dataSource={selectedUserData}
                rowKey="id"
                size="small"
                pagination={false}
                scroll={{ y: 200 }}
              />
            </div>
          )}

          {/* Assignment Summary */}
          {selectedShift && dateRange.length === 2 && (
            <Alert
              message="Thông tin phân công"
              description={
                <div>
                  <p><ClockCircleOutlined /> <strong>Ca làm việc:</strong> {selectedShift.name} ({selectedShift.startTime} - {selectedShift.endTime})</p>
                  <p><CalendarOutlined /> <strong>Thời gian:</strong> {dateRange[0].format('DD/MM/YYYY')} đến {dateRange[1].format('DD/MM/YYYY')}</p>
                  <p><UserOutlined /> <strong>Số nhân viên:</strong> {selectedUsers.length}</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: '16px' }}
            />
          )}

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={submitting || checkingConflicts}
                disabled={conflicts.length > 0}
                icon={<CheckCircleOutlined />}
              >
                Xác nhận phân công
              </Button>
              <Button onClick={() => form.resetFields()}>
                Đặt lại
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default ShiftAssignment;
