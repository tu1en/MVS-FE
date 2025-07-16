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
                    await adminService.createUser(values);
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
    ];

    // Hàm lấy label role
    const getRoleLabel = (role) => {
        switch (role) {
            case 'STUDENT': return 'Học sinh';
            case 'TEACHER': return 'Giáo viên';
            case 'MANAGER': return 'Quản lý';
            case 'ACCOUNTANT': return 'Kế toán viên';
            case 'ADMIN': return 'Quản trị viên';
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
                const role = Array.isArray(roles) && roles.length > 0 ? roles[0] : '';
                // Nếu là admin (dòng đầu tiên), chỉ hiển thị label, không cho đổi
                if (index === 0 && role === 'ADMIN') {
                    return <span style={{ fontWeight: 'bold' }}>{getRoleLabel(role)}</span>;
                }
                return (
                    <Select
                        value={role}
                        style={{ width: 140 }}
                        onChange={(value) => handleRoleUpdate(record.id, value)}
                        disabled={index === 0 && role === 'ADMIN'}
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
                    disabled={index === 0 && Array.isArray(record.roles) && record.roles[0] === 'ADMIN'}
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
                    <Button type="primary" size="small" onClick={() => handleResetPassword(record.id)} disabled={index === 0 && Array.isArray(record.roles) && record.roles[0] === 'ADMIN'}>
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
                                name="fullName"
                                label="Họ và tên"
                                rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, message: 'Vui lòng nhập email', type: 'email' }]}
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
                                rules={[{ required: true, message: 'Vui lòng chọn ít nhất một vai trò' }]}
                            >
                                <Select mode="multiple" placeholder="Chọn vai trò">
                                    <Option value="ROLE_STUDENT">Học sinh</Option>
                                    <Option value="ROLE_TEACHER">Giáo viên</Option>
                                    <Option value="ROLE_MANAGER">Quản lý</Option>
                                    <Option value="ROLE_ADMIN">Quản trị viên</Option>
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
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="phoneNumber"
                                label="Số điện thoại"
                            >
                                <Input />
                            </Form.Item>
                        </Form>
                    </Modal>
                </Card>
            </div>
        </div>
    );
};

export default AccountList;