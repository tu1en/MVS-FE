import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, Modal, Select, Space, Table, Tag, message } from 'antd';
import axios from 'axios';
import { useEffect, useState } from 'react';
import API_CONFIG from '../../config/api-config';

const { Option } = Select;

const ManageUserAccounts = () => {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [searchText, setSearchText] = useState('');

  // Fetch users data
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        
        if (!token) {
          message.error('Bạn chưa đăng nhập');
          setLoading(false);
          return;
        }
        
        const response = await axios.get(`${API_CONFIG.BASE_URL}/api/v1/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.data) {
          // Transform API response to match our component's expected format
          const transformedUsers = response.data.map(user => ({
            id: user.id,
            username: user.username || `user_${user.id}`,
            fullName: user.fullName || 'Chưa cập nhật',
            email: user.email || 'Chưa cập nhật',
            role: getRoleName(user.roleId),
            roleId: user.roleId,
            status: user.status || 'active',
            department: user.department || 'Chưa phân công',
            enrollmentDate: user.enrollmentDate,
            hireDate: user.hireDate
          }));
          
          setUsers(transformedUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        message.error('Không thể tải danh sách người dùng');
        
        // Fallback to sample data if API fails
        setUsers([
          {
            id: 1,
            username: 'student1',
            fullName: 'Nguyễn Văn A',
            email: 'student1@example.com',
            role: 'STUDENT',
            status: 'active',
            enrollmentDate: '2022-09-01',
            department: 'Khoa Công nghệ thông tin'
          },
          {
            id: 2,
            username: 'teacher1',
            fullName: 'Trần Thị B',
            email: 'teacher1@example.com',
            role: 'TEACHER',
            status: 'active',
            hireDate: '2020-01-15',
            department: 'Khoa Công nghệ thông tin'
          },
          {
            id: 3,
            username: 'student2',
            fullName: 'Lê Văn C',
            email: 'student2@example.com',
            role: 'STUDENT',
            status: 'inactive',
            enrollmentDate: '2021-09-01',
            department: 'Khoa Kinh tế'
          },
          {
            id: 4,
            username: 'admin1',
            fullName: 'Phạm Admin',
            email: 'admin1@example.com',
            role: 'ADMIN',
            status: 'active',
            hireDate: '2019-05-10',
            department: 'Ban quản trị'
          }
        ]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);

  // Helper function to convert role ID to role name
  const getRoleName = (roleId) => {
    switch(roleId) {
      case 0: return 'ADMIN';
      case 1: return 'STUDENT';
      case 2: return 'TEACHER';
      case 3: return 'MANAGER';
      default: return 'UNKNOWN';
    }
  };
  
  // Helper function to convert role name to role ID
  const getRoleId = (roleName) => {
    switch(roleName) {
      case 'ADMIN': return 0;
      case 'STUDENT': return 1;
      case 'TEACHER': return 2;
      case 'MANAGER': return 3;
      default: return 1;
    }
  };

  // Handle edit user
  const handleEditUser = (user) => {
    setEditingUser(user);
    form.setFieldsValue({
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      status: user.status,
      department: user.department
    });
    setIsModalVisible(true);
  };

  // Handle delete user
  const handleDeleteUser = (id) => {
    Modal.confirm({
      title: 'Xác nhận xóa người dùng',
      content: 'Bạn có chắc chắn muốn xóa người dùng này không?',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          
          // Delete in the backend
          await axios.delete(`${API_CONFIG.BASE_URL}/api/v1/users/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          // Update in the frontend
          setUsers(users.filter(user => user.id !== id));
          message.success('Đã xóa người dùng');
        } catch (error) {
          console.error('Error deleting user:', error);
          message.error('Không thể xóa người dùng');
          
          // Still update UI even if API fails
          setUsers(users.filter(user => user.id !== id));
        }
      }
    });
  };

  // Handle form submission
  const handleOk = () => {
    form.validateFields()
      .then(async values => {
        try {
          const token = localStorage.getItem('token');
          
          if (editingUser) {
            // Update existing user
            const updatedUser = {
              ...values,
              roleId: getRoleId(values.role)
            };
            
            await axios.put(`${API_CONFIG.BASE_URL}/api/v1/users/${editingUser.id}`, updatedUser, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            setUsers(users.map(user => 
              user.id === editingUser.id ? { 
                ...user, 
                ...values,
                roleId: getRoleId(values.role)
              } : user
            ));
            
            message.success('Cập nhật người dùng thành công!');
          } else {
            // Add new user
            const newUserData = {
              ...values,
              roleId: getRoleId(values.role),
              enrollmentDate: values.role === 'STUDENT' ? new Date().toISOString().split('T')[0] : null,
              hireDate: values.role !== 'STUDENT' ? new Date().toISOString().split('T')[0] : null,
            };
            
            const response = await axios.post(`${API_CONFIG.BASE_URL}/api/v1/users`, newUserData, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            
            const newUser = {
              id: response.data.id || users.length + 1,
              ...values,
              roleId: getRoleId(values.role),
              enrollmentDate: values.role === 'STUDENT' ? new Date().toISOString().split('T')[0] : null,
              hireDate: values.role !== 'STUDENT' ? new Date().toISOString().split('T')[0] : null,
            };
            
            setUsers([...users, newUser]);
            message.success('Thêm người dùng thành công!');
          }
          
          form.resetFields();
          setIsModalVisible(false);
          setEditingUser(null);
        } catch (error) {
          console.error('Error saving user:', error);
          message.error('Không thể lưu thông tin người dùng');
        }
      })
      .catch(info => {
        console.log('Validate Failed:', info);
      });
  };

  // Handle modal cancel
  const handleCancel = () => {
    form.resetFields();
    setIsModalVisible(false);
    setEditingUser(null);
  };

  // Show add user modal
  const showAddModal = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchText(e.target.value.toLowerCase());
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => 
    user.username.toLowerCase().includes(searchText) ||
    user.fullName.toLowerCase().includes(searchText) ||
    user.email.toLowerCase().includes(searchText)
  );

  // Role tag color
  const getRoleColor = (role) => {
    switch(role) {
      case 'ADMIN': return 'red';
      case 'TEACHER': return 'blue';
      case 'STUDENT': return 'green';
      case 'MANAGER': return 'purple';
      default: return 'default';
    }
  };

  // Status tag color
  const getStatusColor = (status) => {
    return status === 'active' ? 'green' : 'volcano';
  };

  // Table columns
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 50
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)}>
          {role}
        </Tag>
      )
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>
          {status === 'active' ? 'Hoạt động' : 'Tạm khóa'}
        </Tag>
      )
    },
    {
      title: 'Khoa/Phòng ban',
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
          >
            Sửa
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDeleteUser(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6">
      <Card 
        title="Quản lý Tài khoản" 
        className="shadow-md"
        extra={
          <Space>
            <Input
              placeholder="Tìm kiếm người dùng..."
              prefix={<SearchOutlined />}
              onChange={handleSearch}
              style={{ width: 250 }}
            />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={showAddModal}
            >
              Thêm người dùng
            </Button>
          </Space>
        }
      >
        <Table 
          dataSource={filteredUsers} 
          columns={columns} 
          loading={loading} 
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={editingUser ? "Sửa thông tin người dùng" : "Thêm người dùng mới"}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          name="userForm"
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
          >
            <Input placeholder="Họ và tên" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="ADMIN">Admin</Option>
              <Option value="MANAGER">Quản lý</Option>
              <Option value="TEACHER">Giảng viên</Option>
              <Option value="STUDENT">Học viên</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt động</Option>
              <Option value="inactive">Tạm khóa</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="department"
            label="Khoa/Phòng ban"
            rules={[{ required: true, message: 'Vui lòng nhập khoa/phòng ban!' }]}
          >
            <Input placeholder="Khoa/Phòng ban" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageUserAccounts;
