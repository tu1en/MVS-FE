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
            .then((data) => {
                setUsers(data.content);
                setPagination({
                    ...params.pagination,
                    total: data.totalElements,
                });
            })
            .catch(() => {
                message.error('Failed to fetch users');
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
            message.success("User status updated");
            fetchUsers({ pagination, keyword });
        } catch (error) {
            message.error("Failed to update user status");
        }
    };

    const handleRoleUpdate = async (userId, newRole) => {
        try {
            await adminService.updateUserRole(userId, newRole);
            message.success("User role updated");
            fetchUsers({ pagination, keyword });
        } catch (error) {
            message.error("Failed to update user role");
        }
    };

    const handleResetPassword = async (userId) => {
        try {
            await adminService.resetUserPassword(userId);
            message.success("Password reset to default (123456789)");
            fetchUsers({ pagination, keyword });
        } catch (error) {
            message.error("Failed to reset password");
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

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Full Name',
            dataIndex: 'fullName',
            key: 'fullName',
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: 'Date of Birth',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
            render: (date) => (date ? new Date(date).toLocaleDateString('vi-VN') : 'N/A'),
        },
        {
            title: 'Citizen ID',
            dataIndex: 'citizenId',
            key: 'citizenId',
        },
        {
            title: 'Phone',
            dataIndex: 'phoneNumber',
            key: 'phoneNumber',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status, record) => (
                <Switch
                    checked={status === 'active'}
                    onChange={() => handleStatusToggle(record.id, status === 'active')}
                    checkedChildren="Active"
                    unCheckedChildren="Locked"
                />
            ),
        },
        {
            title: 'Role',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles, record) => (
                <Select
                    defaultValue={roles && roles.length > 0 ? roles[0] : ''}
                    style={{ width: 120 }}
                    onChange={(value) => handleRoleUpdate(record.id, value)}
                    options={
                        ['ROLE_STUDENT', 'ROLE_TEACHER', 'ROLE_MANAGER', 'ROLE_ADMIN'].map(role => ({
                            label: role.replace('ROLE_', ''),
                            value: role
                        }))
                    }
                />
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" size="small" onClick={() => handleResetPassword(record.id)}>
                        Reset Password
                    </Button>
                </Space>
            ),
        },
    ];

    return (
        <div className="min-h-screen px-6 py-10 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <Card bordered={false} className="shadow-lg rounded-xl">
                    <Title level={2}>👥 User Account Management</Title>
                    <Text type="secondary">View, search, and manage user accounts in the system.</Text>
                    
                    <div className="flex justify-between mb-4 mt-4">
                        <Search
                            placeholder="Search by name or email..."
                            allowClear
                            onSearch={handleSearch}
                            style={{ width: 200 }}
                        />
                        <Button type="primary" onClick={showCreateModal}>
                            Add New User
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
                        title="Add New User"
                        open={isCreateModalVisible}
                        onOk={handleCreateOk}
                        onCancel={handleCreateCancel}
                        okText="Create"
                        cancelText="Cancel"
                        width={600}
                    >
                        <Form
                            form={createForm}
                            layout="vertical"
                            name="createUserForm"
                        >
                            <Form.Item
                                name="fullName"
                                label="Full Name"
                                rules={[{ required: true, message: 'Please enter full name' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[{ required: true, message: 'Please enter email', type: 'email' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="gender"
                                label="Gender"
                                rules={[{ required: true, message: 'Please select gender' }]}
                            >
                                <Select placeholder="Select gender">
                                    <Option value="MALE">Male</Option>
                                    <Option value="FEMALE">Female</Option>
                                    <Option value="OTHER">Other</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="roles"
                                label="Roles"
                                rules={[{ required: true, message: 'Please select at least one role' }]}
                            >
                                <Select mode="multiple" placeholder="Select roles">
                                    <Option value="ROLE_STUDENT">Student</Option>
                                    <Option value="ROLE_TEACHER">Teacher</Option>
                                    <Option value="ROLE_MANAGER">Manager</Option>
                                    <Option value="ROLE_ADMIN">Admin</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="dateOfBirth"
                                label="Date of Birth"
                            >
                                <DatePicker format="YYYY-MM-DD" />
                            </Form.Item>

                            <Form.Item
                                name="citizenId"
                                label="Citizen ID (CCCD)"
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item
                                name="phoneNumber"
                                label="Phone Number"
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