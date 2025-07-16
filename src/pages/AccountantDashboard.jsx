import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Button, message, Spin } from 'antd';
import {
  DollarOutlined,
  FileTextOutlined,
  TeamOutlined,
  CalendarOutlined,
  TrendingUpOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';

/**
 * Dashboard chính cho Accountant
 * Hiển thị thống kê tài chính và các chức năng kế toán
 */
const AccountantDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalPayroll: 0,
    pendingPayments: 0,
    monthlyExpenses: 0,
    totalEmployees: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== ROLE.ACCOUNTANT) {
      navigate('/');
    }
    fetchDashboardStats();
  }, [navigate]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to get accountant dashboard stats
      // const data = await accountantService.getDashboardStats();
      // setStats(data);
      
      // Mock data for now
      setStats({
        totalPayroll: 125000000,
        pendingPayments: 15,
        monthlyExpenses: 45000000,
        totalEmployees: 85
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      message.error('Không thể tải thống kê dashboard');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard Kế toán</h1>
      
      {/* Statistics Cards */}
      <Row gutter={16} className="mb-8">
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng bảng lương tháng"
              value={stats.totalPayroll}
              prefix={<DollarOutlined />}
              formatter={(value) => formatCurrency(value)}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Thanh toán chờ duyệt"
              value={stats.pendingPayments}
              prefix={<FileTextOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Chi phí tháng này"
              value={stats.monthlyExpenses}
              prefix={<TrendingUpOutlined />}
              formatter={(value) => formatCurrency(value)}
              loading={loading}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Tổng nhân viên"
              value={stats.totalEmployees}
              prefix={<TeamOutlined />}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {/* Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý bảng lương</h2>
          <p className="text-gray-600">Tính toán và quản lý bảng lương nhân viên</p>
          <button 
            className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/accountant/payroll')}
          >
            Quản lý bảng lương
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Báo cáo tài chính</h2>
          <p className="text-gray-600">Xem và tạo các báo cáo tài chính</p>
          <button 
            className="mt-4 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/accountant/reports')}
          >
            Xem báo cáo
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý chi phí</h2>
          <p className="text-gray-600">Theo dõi và quản lý các khoản chi phí</p>
          <button 
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/accountant/expenses')}
          >
            Quản lý chi phí
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Thống kê tài chính</h2>
          <p className="text-gray-600">Xem thống kê và phân tích tài chính</p>
          <button 
            className="mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/accountant/statistics')}
          >
            Xem thống kê
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quản lý thuế</h2>
          <p className="text-gray-600">Tính toán và quản lý các khoản thuế</p>
          <button 
            className="mt-4 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/accountant/taxes')}
          >
            Quản lý thuế
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Cài đặt tài khoản</h2>
          <p className="text-gray-600">Quản lý thông tin cá nhân và cài đặt</p>
          <button 
            className="mt-4 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
            onClick={() => navigate('/accountant/profile')}
          >
            Cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountantDashboard;
