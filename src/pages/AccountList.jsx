import { CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Card, Input, Select, Switch, Table, Tooltip, Typography, message, Modal, Form, Button, Space, DatePicker } from 'antd';
import { debounce } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { ROLE } from '../constants/constants';
import adminService from '../services/adminService';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

const assignableRoles = Object.values(ROLE).filter(r => r !== ROLE.GUEST);

// Define role options for dropdown with proper structure
const roleOptions = [
    { value: 'ROLE_STUDENT', label: 'Học sinh' },
    { value: 'ROLE_TEACHER', label: 'Giáo viên' },
    { value: 'ROLE_MANAGER', label: 'Quản lý' },
    { value: 'ROLE_ACCOUNTANT', label: 'Kế toán viên' },
    { value: 'ROLE_ADMIN', label: 'Quản trị viên' }
];

const AccountList = () => {
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
    const [loading, setLoading] = useState(false);
    const [keyword, setKeyword] = useState('');
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [createForm] = Form.useForm();

    const fetchUsers = useCallback((params = {}) => {
        setLoading(true);
        adminService.getUsers({
            page: params.pagination.current - 1,
            size: params.pagination.pageSize,
            keyword: params.keyword,
        })
            .then((response) => {
                // Nếu response là object có .data thì unwrap
                const data = response.data ? response.data : response;
                setUsers(data.content || []);
                setPagination({
                    ...params.pagination,
                    total: data.totalElements || 0,
                });
            })
            .catch(() => {
                message.error('Không thể tải danh sách người dùng');
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchUsers({ pagination, keyword });
    }, [fetchUsers, pagination.current, pagination.pageSize, keyword]);

    const handleTableChange = (newPagination) => {
        setPagination(newPagination);
    };

    const handleSearch = (value) => {
        setKeyword(value);
        setPagination({ ...pagination, current: 1 });
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        try {
            await adminService.updateUserStatus(userId, !currentStatus);
            message.success("Cập nhật trạng thái người dùng thành công");
            fetchUsers({ pagination, keyword });
        } catch (error) {
            message.error("Không thể cập nhật trạng thái người dùng");
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await adminService.updateUserRoles(userId, newRole);
            message.success("Cập nhật vai trò người dùng thành công");
            fetchUsers({ pagination, keyword });
        } catch (error) {
            message.error("Không thể cập nhật vai trò người dùng");
        }
    };

    const handleResetPassword = async (userId) => {
        try {
            await adminService.resetUserPassword(userId);
            message.success("Đặt lại mật khẩu về mặc định (123456789)");
            fetchUsers({ pagination, keyword });
        } catch (error) {
            message.error("Không thể đặt lại mật khẩu");
        }
    };

    const showCreateModal = () => {
        setIsCreateModalVisible(true);
    };

    const handleCreateOk = () => {
        createForm
            .validateFields()
            .then(async (values) => {
                try {
                    // Format data to match backend expectations
                    const userData = {
                        ...values,
                        name: values.fullName, // Backend expects 'name' field
                        enabled: true, // Default to enabled
                        roles: values.roles ? [values.roles] : ['ROLE_STUDENT'] // Convert single role to array
                    };
                    await adminService.createUser(userData);
                    setIsCreateModalVisible(false);
                    createForm.resetFields();
                    message.success("User created successfully");
                    fetchUsers({ pagination, keyword });
                } catch (error) {
                    message.error("Failed to create user: " + error.message);
                }
            })
            .catch((info) => {
                console.log("Validate Failed:", info);
            });
    };

    const handleCreateCancel = () => {
        setIsCreateModalVisible(false);
    };

    // Danh sách role cho dropdown (bỏ ADMIN)
    const roleOptions = [
        { value: 'STUDENT', label: 'Học sinh' },
        { value: 'TEACHER', label: 'Giáo viên' },
        { value: 'MANAGER', label: 'Quản lý' },
        { value: 'ACCOUNTANT', label: 'Kế toán viên' },
        { value: 'PARENT', label: 'Phụ huynh' },
    ];

    // Hàm lấy label role
    const getRoleLabel = (role) => {
        switch (role) {
            case 'STUDENT':
            case 'ROLE_STUDENT': return 'Học sinh';
            case 'TEACHER':
            case 'ROLE_TEACHER': return 'Giáo viên';
            case 'MANAGER':
            case 'ROLE_MANAGER': return 'Quản lý';
            case 'ACCOUNTANT':
            case 'ROLE_ACCOUNTANT': return 'Kế toán viên';
            case 'ADMIN':
            case 'ROLE_ADMIN': return 'Quản trị viên';
            case 'PARENT':
            case 'ROLE_PARENT': return 'Phụ huynh';
            default: return role;
        }
    };

    const columns = [
        {
            title: '#',
            key: 'index',
            render: (text, record, index) => ((pagination.current - 1) * pagination.pageSize + index + 1),
            width: 60,
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Vai trò',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles, record, index) => {
                // Try to get role from roles array first, then fallback to roleId
                let role = '';
                if (Array.isArray(roles) && roles.length > 0) {
                    role = roles[0];
                } else if (record.roleId) {
                    // Map roleId to role name if roles array is empty
                    const roleIdMap = {
                        1: 'STUDENT',
                        2: 'TEACHER',
                        3: 'MANAGER',
                        4: 'ADMIN',
                        5: 'ACCOUNTANT',
                        7: 'PARENT'
                    };
                    role = roleIdMap[record.roleId] || '';
                } 
                
                // Debug logging
                if (record.roleId === 7 || record.roleId === '7') {
                    console.log('Debug PARENT role:', { record, roles, roleId: record.roleId, mappedRole: role });
                }
                
                // Chuẩn hóa role để hiển thị trong Select
                // 1) Nếu nhận về 'ROLE_*' thì bỏ prefix để khớp options trong dropdown
                if (typeof role === 'string' && role.startsWith('ROLE_')) {
                    role = role.replace('ROLE_', '');
                }
                // 2) Nếu backend trả 'USER' thì coi như chưa chọn vai trò (để hiện placeholder)
                if (role === 'USER') {
                    role = '';
                }
                
                // Nếu là admin (dòng đầu tiên), chỉ hiển thị label, không cho đổi
                if (index === 0 && (role === 'ADMIN' || role === 'ROLE_ADMIN')) {
                    return <span style={{ fontWeight: 'bold' }}>{getRoleLabel(role)}</span>;
                }
                return (
                    <Select
                        value={role || undefined}
                        placeholder="Chọn vai trò"
                        style={{ width: 140 }}
                        onChange={(value) => handleRoleUpdate(record.id, value)}
                        disabled={index === 0 && (role === 'ADMIN' || role === 'ROLE_ADMIN')}
                    >
                        {roleOptions.map(option => (
                            <Option key={option.value} value={option.value}>{option.label}</Option>
                        ))}
                    </Select>
                );
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status, record, index) => (
                <Switch
                    checked={record.enabled}
                    onChange={() => handleStatusToggle(record.id, record.enabled)}
                    checkedChildren="Hoạt động"
                    unCheckedChildren="Tạm khóa"
                    disabled={index === 0 && Array.isArray(record.roles) && (record.roles[0] === 'ADMIN' || record.roles[0] === 'ROLE_ADMIN')}
                />
            ),
        },
        {
            title: 'Ngày tạo',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (createdAt) => createdAt ? new Date(createdAt[0], createdAt[1] - 1, createdAt[2], createdAt[3], createdAt[4], createdAt[5]).toLocaleString('vi-VN') : '',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record, index) => (
                <Space size="middle">
                    <Button type="primary" size="small" onClick={() => handleResetPassword(record.id)} disabled={index === 0 && Array.isArray(record.roles) && (record.roles[0] === 'ADMIN' || record.roles[0] === 'ROLE_ADMIN')}>
                        Đặt lại mật khẩu
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen px-6 py-10 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <Card bordered={false} className="shadow-lg rounded-xl">
                    <Title level={2}>👥 Quản lý tài khoản người dùng</Title>
                    <Text type="secondary">Xem, tìm kiếm và quản lý tài khoản người dùng trong hệ thống.</Text>
                    
                    <div className="flex justify-between mb-4 mt-4">
                        <Search
                            placeholder="Tìm kiếm theo tên hoặc email..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 200 }}
                        />
                        <Button type="primary" onClick={showCreateModal}>
                            Thêm người dùng mới
                        </Button>
                    </div>

                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey="id"
                        pagination={pagination}
                        loading={loading}
                        onChange={handleTableChange}
                    />

                    <Modal
                        title="Thêm người dùng mới"
                        open={isCreateModalVisible}
                        onOk={handleCreateOk}
                        onCancel={handleCreateCancel}
                        okText="Tạo mới"
                        cancelText="Hủy"
                        width={600}
                    >
                        <Form
                            form={createForm}
                            layout="vertical"
                            name="createUserForm"
                        >
                            <Form.Item
                                name="username"
                                label="Tên đăng nhập"
                                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập email' },
                                    { type: 'email', message: 'Email không hợp lệ' },
                                    {
                                        validator: async (_, value) => {
                                            if (!value) return Promise.resolve();
                                            try {
                                                const exists = await adminService.checkEmailExists(value);
                                                if (exists) {
                                                    return Promise.reject(new Error('Email này đã được sử dụng'));
                                                }
                                                return Promise.resolve();
                                            } catch (error) {
                                                console.error('Error checking email:', error);
                                                return Promise.resolve(); // Don't block form if API fails
                                            }
                                        }
                                    }
                                ]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="gender"
                                label="Giới tính"
                                rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
                            >
                                <Select placeholder="Chọn giới tính">
                                    <Option value="MALE">Nam</Option>
                                    <Option value="FEMALE">Nữ</Option>
                                    <Option value="OTHER">Khác</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="roles"
                                label="Vai trò"
                                rules={[{ required: true, message: 'Vui lòng chọn vai trò' }]}
                            >
                                <Select placeholder="Chọn vai trò">
                                    <Option value="ROLE_STUDENT">Học sinh</Option>
                                    <Option value="ROLE_TEACHER">Giáo viên</Option>
                                    <Option value="ROLE_MANAGER">Quản lý</Option>
                                    <Option value="ROLE_ACCOUNTANT">Kế toán viên</Option>
                                    <Option value="ROLE_PARENT">Phụ huynh</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="dateOfBirth"
                                label="Ngày sinh"
                            >
                                <DatePicker format="YYYY-MM-DD" />
                            </Form.Item>

                            <Form.Item
                                name="citizenId"
                                label="CCCD"
                                rules={[{ required: true, message: 'Vui lòng nhập CCCD' }, { pattern: /^\d{13}$/, message: 'CCCD phải gồm đúng 13 số' }]}
                            >
                                <Input maxLength={13} />
                            </Form.Item>

                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                                rules={[
                                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                                    { pattern: /^\d{10,11}$/, message: 'Số điện thoại phải gồm 10 hoặc 11 số' }
                                ]}
                            >
                                <Input maxLength={11} />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Card>
            </div>
        </div>
    );
};

export default AccountList;