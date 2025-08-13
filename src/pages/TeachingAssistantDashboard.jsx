import { BarChartOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { Alert, Card, Space, Spin, Tabs, Typography } from 'antd';
import React, { useEffect, useState } from 'react';
import { SMSStatisticsDashboard } from '../components/SMS';
import { TeacherEvaluationDashboard } from '../components/TeacherEvaluation';
import api from '../services/api';

const { Title } = Typography;
const { TabPane } = Tabs;

/**
 * Main Dashboard for Teaching Assistants and System Administrators
 * Combines Teacher Evaluation and SMS Management functionality
 */
const TeachingAssistantDashboard = ({ userRole, currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    let isCancelled = false;
    const fetchTeachers = async () => {
      try {
        const users = await api.GetUsersByRole(2); // 2 = TEACHER
        if (isCancelled) return;
        const mapped = (users || []).map((u) => ({
          id: u.id ?? u.userId ?? u.user_id,
          name: u.fullName ?? u.name ?? u.username ?? u.email
        }));
        setTeachers(mapped);
      } catch (error) {
        console.error('Failed to load teachers for TA dashboard:', error);
        setTeachers([]);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };
    fetchTeachers();
    return () => { isCancelled = true; };
  }, []);

  // Check if user has access to Teaching Assistant features
  const hasTeachingAssistantAccess = userRole === 'TEACHING_ASSISTANT' || userRole === 'MANAGER' || userRole === 'ADMIN';
  const hasSMSAccess = userRole === 'MANAGER' || userRole === 'ADMIN';

  if (loading) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <p style={{ marginTop: 16 }}>Đang tải dashboard...</p>
        </div>
      </Card>
    );
  }

  if (!hasTeachingAssistantAccess && !hasSMSAccess) {
    return (
      <Card>
        <Alert
          message="Không có quyền truy cập"
          description="Bạn không có quyền truy cập vào tính năng này. Vui lòng liên hệ quản trị viên."
          type="error"
          showIcon
        />
      </Card>
    );
  }

  const tabItems = [];

  // Add Teacher Evaluation tab for Teaching Assistants
  if (hasTeachingAssistantAccess) {
    tabItems.push({
      label: (
        <span>
          <UserOutlined />
          Đánh Giá Giảng Viên
        </span>
      ),
      key: 'teacher-evaluation',
      children: (
        <TeacherEvaluationDashboard
          availableTeachers={teachers}
          currentUser={currentUser}
        />
      )
    });
  }

  // Add SMS Statistics tab for Managers/Admins
  if (hasSMSAccess) {
    tabItems.push({
      label: (
        <span>
          <MessageOutlined />
          Quản Lý SMS
        </span>
      ),
      key: 'sms-management',
      children: <SMSStatisticsDashboard />
    });
  }

  return (
    <div className="teaching-assistant-dashboard">
      <Card style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>
          <Space>
            <BarChartOutlined />
            {userRole === 'TEACHING_ASSISTANT' ? 'Bảng Điều Khiển Trợ Giảng' : 'Quản Lý Hệ Thống'}
          </Space>
        </Title>
        {userRole === 'TEACHING_ASSISTANT' && (
          <p style={{ marginTop: 8, color: '#666' }}>
            Chào mừng! Bạn có thể đánh giá giảng viên và theo dõi thống kê giảng dạy.
          </p>
        )}
      </Card>

      <Tabs
        defaultActiveKey={hasTeachingAssistantAccess ? 'teacher-evaluation' : 'sms-management'}
        items={tabItems}
        size="large"
      />
    </div>
  );
};

export default TeachingAssistantDashboard;