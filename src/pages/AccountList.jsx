import { CheckCircleOutlined, MinusCircleOutlined } from '@ant-design/icons';
import { Card, Input, Select, Switch, Table, Tooltip, Typography, message } from 'antd';
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

    const fetchUsers = useCallback((params = {}) => {
        setLoading(true);
        adminService.getUsers({
            page: params.pagination.current - 1,
            size: params.pagination.pageSize,
            keyword: params.keyword,
            sort: params.sorter && params.sorter.field ? `${params.sorter.field},${params.sorter.order === 'ascend' ? 'asc' : 'desc'}` : 'fullName,asc',
        }).then(res => {
            setUsers(res.data.content);
            setPagination(prev => ({
                ...prev,
                total: res.data.totalElements,
                current: res.data.number + 1,
            }));
        }).catch(err => {
            console.error("Failed to fetch users:", err);
            message.error('Failed to load user list. Please try again.');
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    useEffect(() => {
        fetchUsers({ pagination, keyword });
    }, [fetchUsers]);

    const debouncedSearch = useCallback(debounce((value) => {
        const newPagination = { ...pagination, current: 1 };
        setKeyword(value);
        fetchUsers({ pagination: newPagination, keyword: value });
    }, 500), [fetchUsers, pagination]);

    const handleTableChange = (newPagination, filters, sorter) => {
        fetchUsers({ pagination: newPagination, keyword, sorter });
    };

    const handleStatusChange = (userId, checked) => {
        adminService.updateUserStatus(userId, checked)
            .then(() => {
                message.success('User status updated successfully!');
                setUsers(users.map(u => u.id === userId ? { ...u, enabled: checked } : u));
            })
            .catch((err) => {
                const errorMsg = err.response?.data?.message || 'Failed to update status!';
                message.error(errorMsg);
            });
    };

    const handleRoleChange = (userId, newRole) => {
        adminService.updateUserRoles(userId, [newRole])
            .then(() => {
                message.success('User role updated successfully!');
                setUsers(users.map(u => u.id === userId ? { ...u, roles: [newRole] } : u));
            })
            .catch((err) => {
                const errorMsg = err.response?.data?.message || 'Failed to update role!';
                message.error(errorMsg);
            });
    };

    const columns = [
        {
            title: 'Full Name',
            dataIndex: 'name',
            key: 'name',
            sorter: true,
            render: (text) => <span className="font-medium text-gray-800">{text}</span>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Roles',
            dataIndex: 'roles',
            key: 'roles',
            render: (roles, record) => {
                const currentRole = roles && roles.length > 0 ? roles[0] : null;
                return (
                    <Select
                        value={currentRole}
                        style={{ width: 120 }}
                        onChange={(newRole) => handleRoleChange(record.id, newRole)}
                        disabled={!record.enabled}
                    >
                        {assignableRoles.map(role => (
                            <Option key={role} value={role}>{role}</Option>
                        ))}
                    </Select>
                );
            },
        },
        {
            title: 'Status',
            dataIndex: 'enabled',
            key: 'enabled',
            align: 'center',
            render: (enabled, record) => (
                <Tooltip title={enabled ? 'Active' : 'Disabled'}>
                    <Switch
                        checked={enabled}
                        onChange={(checked) => handleStatusChange(record.id, checked)}
                        checkedChildren={<CheckCircleOutlined />}
                        unCheckedChildren={<MinusCircleOutlined />}
                    />
                </Tooltip>
            ),
        },
    ];

    return (
        <div className="min-h-screen px-6 py-10 bg-gray-50">
            <div className="max-w-7xl mx-auto">
                <Card bordered={false} className="shadow-lg rounded-xl">
                    <Title level={2}>👥 User Account Management</Title>
                    <Text type="secondary">View, search, and manage user accounts in the system.</Text>
                    
                    <Search
                        placeholder="Search by name or email..."
                        allowClear
                        enterButton="Search"
                        size="large"
                        onSearch={(value) => debouncedSearch(value)}
                        onChange={(e) => debouncedSearch(e.target.value)}
                        style={{ margin: '24px 0', maxWidth: 400 }}
                    />

                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey="id"
                        pagination={pagination}
                        loading={loading}
                        onChange={handleTableChange}
                        locale={{ emptyText: 'No accounts found' }}
                        scroll={{ x: 'max-content' }}
                    />
                </Card>
            </div>
        </div>
    );
};

export default AccountList; 