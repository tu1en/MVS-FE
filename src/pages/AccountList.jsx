import { useState, useEffect } from 'react';
import { Card, Table, Tag, Select, Row, Col, Input, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { accountService } from '../services/accountService';
import { ROLE } from '../constants/constants';

const { Search } = Input;

const roleColors = {
  [ROLE.ADMIN.toLowerCase()]: 'red',
  [ROLE.MANAGER.toLowerCase()]: 'blue',
  [ROLE.TEACHER.toLowerCase()]: 'green',
  [ROLE.STUDENT.toLowerCase()]: 'gold'
};

export default function AccountList() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  
  // Get current user from local storage or context
  const userRole = localStorage.getItem('role')?.toUpperCase();
  const userDepartment = localStorage.getItem('department');

  // Role-based options
  const roleOptions = userRole === ROLE.ADMIN 
    ? [
        { value: 'all', label: 'All Roles' },
        { value: ROLE.ADMIN, label: 'Admin' },
        { value: ROLE.MANAGER, label: 'Manager' },
        { value: ROLE.TEACHER, label: 'Teacher' },
        { value: ROLE.STUDENT, label: 'Student' },
      ]
    : [
        { value: 'all', label: 'All Roles' },
        { value: ROLE.TEACHER, label: 'Teacher' },
        { value: ROLE.STUDENT, label: 'Student' },
      ];

  useEffect(() => {
    // Check access permission
    if (![ROLE.ADMIN, ROLE.MANAGER].includes(userRole)) {
      message.error('You do not have permission to access this page');
      navigate('/dashboard');
      return;
    }

    // Load departments
    loadDepartments();
    
    // Load accounts with current filters
    fetchAccounts();
  }, [roleFilter, departmentFilter, searchQuery]);

  const loadDepartments = async () => {
    try {
      const deptList = await accountService.getDepartments();
      setDepartments(deptList || []);
    } catch (error) {
      console.error('Failed to load departments:', error);
      message.error('Failed to load departments');
    }
  };

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAllAccounts({
        role: roleFilter,
        department: departmentFilter,
        search: searchQuery
      });
      
      // Transform data if needed
      const transformedData = Array.isArray(data) ? data.map(account => ({
        ...account,
        key: account.id || Math.random().toString(),
        role: account.role || 'Unknown',
        status: account.status || 'inactive',
        department: account.department || 'N/A'
      })) : [];
      
      setAccounts(transformedData);
    } catch (error) {
      console.error('Failed to fetch accounts:', error);
      message.error('Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const columns = [
    {
      title: 'Full Name',
      dataIndex: 'full_name',
      key: 'full_name',
      render: (text) => <span className="font-medium text-gray-800">{text}</span>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email) => <span>{email || 'N/A'}</span>,
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role) => {
        const normalizedRole = (role || 'Unknown').toLowerCase();
        return (
          <Tag color={roleColors[normalizedRole] || 'default'} className="capitalize">
            {role || 'Unknown'}
          </Tag>
        );
      },
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const normalizedStatus = (status || 'inactive').toLowerCase();
        return (
          <Tag color={normalizedStatus === 'active' ? 'green' : 'red'}>
            {normalizedStatus.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: 'Created At',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A',
    },
  ];

  return (
    <div className="min-h-screen px-6 py-10 bg-gradient-to-br from-[#e6f7ff] to-[#fafafa]">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">👥 Account Management</h1>
          <p className="text-gray-600">
            {userRole === ROLE.ADMIN 
              ? 'View and manage all user accounts in the system'
              : 'View and manage teacher and student accounts in your department'}
          </p>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} justify="center">
          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Total Accounts</p>
              <p className="text-2xl font-bold text-blue-600">{accounts.length}</p>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card className="rounded-xl shadow-sm">
              <p className="text-sm text-gray-500">Active Accounts</p>
              <p className="text-2xl font-bold text-green-600">
                {accounts.filter(a => (a.status || '').toLowerCase() === 'active').length}
              </p>
            </Card>
          </Col>
        </Row>

        {/* Filters */}
        <Card className="rounded-xl shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex-1">
              <Search
                placeholder="Search by name or email"
                allowClear
                onSearch={handleSearch}
                style={{ maxWidth: 300 }}
              />
            </div>
            <div className="flex gap-4 flex-wrap">
              <Select
                value={roleFilter}
                onChange={setRoleFilter}
                style={{ width: 120 }}
                options={roleOptions}
              />
              {userRole === ROLE.ADMIN && (
                <Select
                  value={departmentFilter}
                  onChange={setDepartmentFilter}
                  style={{ width: 160 }}
                  options={[
                    { value: 'all', label: 'All Departments' },
                    ...departments.map(dept => ({
                      value: dept.id || dept.name,
                      label: dept.name || dept.id
                    }))
                  ]}
                />
              )}
            </div>
          </div>
        </Card>

        {/* Account Table */}
        <Card title="📋 Account List" className="rounded-xl shadow-sm">
          <Table
            columns={columns}
            dataSource={accounts}
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} accounts`,
            }}
            locale={{
              emptyText: 'No accounts found',
            }}
          />
        </Card>
      </div>
    </div>
  );
} 