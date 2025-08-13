import React, { useState, useEffect } from 'react';
import { Tabs, Card, Select, Button, Space, Typography, Modal, Spin, Alert } from 'antd';
import { PlusOutlined, BarChartOutlined, UnorderedListOutlined, UserOutlined } from '@ant-design/icons';
import TeacherEvaluationForm from './TeacherEvaluationForm';
import TeacherEvaluationList from './TeacherEvaluationList';
import TeacherEvaluationStatistics from './TeacherEvaluationStatistics';
import { getMyEvaluations } from '../../services/teacherEvaluationService';

const { Title } = Typography;
const { Option } = Select;
const { TabPane } = Tabs;

/**
 * Teacher Evaluation Dashboard
 * Main component that provides all teacher evaluation functionality for Teaching Assistants
 */
const TeacherEvaluationDashboard = ({ 
  availableTeachers = [], // Array of teacher objects with {id, name}
  currentUser,
  defaultTeacherId = null 
}) => {
  const [selectedTeacherId, setSelectedTeacherId] = useState(defaultTeacherId);
  const [selectedTeacherName, setSelectedTeacherName] = useState('');
  const [evaluationFormVisible, setEvaluationFormVisible] = useState(false);
  const [myEvaluations, setMyEvaluations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('statistics');
  
  // Mock class session ID - in real app, this should come from the current class context
  const [currentSessionId] = useState(1);

  useEffect(() => {
    if (selectedTeacherId && availableTeachers.length > 0) {
      const teacher = availableTeachers.find(t => t.id === selectedTeacherId);
      setSelectedTeacherName(teacher?.name || '');
    }
  }, [selectedTeacherId, availableTeachers]);

  useEffect(() => {
    fetchMyEvaluations();
  }, []);

  const fetchMyEvaluations = async () => {
    try {
      setLoading(true);
      const data = await getMyEvaluations();
      setMyEvaluations(data);
    } catch (error) {
      console.error('Error fetching my evaluations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelect = (teacherId) => {
    setSelectedTeacherId(teacherId);
    const teacher = availableTeachers.find(t => t.id === teacherId);
    setSelectedTeacherName(teacher?.name || '');
  };

  const handleEvaluationSuccess = () => {
    setEvaluationFormVisible(false);
    fetchMyEvaluations();
    // Refresh the current tab data
    setActiveTab(activeTab); 
  };

  const renderTeacherSelector = () => (
    <Space style={{ marginBottom: 16 }}>
      <Select
        style={{ width: 300 }}
        placeholder="Chọn giảng viên để xem đánh giá"
        value={selectedTeacherId}
        onChange={handleTeacherSelect}
        showSearch
        optionFilterProp="children"
        filterOption={(input, option) =>
          option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
        }
      >
        {availableTeachers.map(teacher => (
          <Option key={teacher.id} value={teacher.id}>
            {teacher.name}
          </Option>
        ))}
      </Select>
      
      {selectedTeacherId && (
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          onClick={() => setEvaluationFormVisible(true)}
        >
          Đánh giá giảng viên
        </Button>
      )}
    </Space>
  );

  const tabItems = [
    {
      label: (
        <span>
          <BarChartOutlined />
          Thống kê
        </span>
      ),
      key: 'statistics',
      children: selectedTeacherId ? (
        <TeacherEvaluationStatistics 
          teacherId={selectedTeacherId} 
          teacherName={selectedTeacherName}
        />
      ) : (
        <Alert 
          message="Vui lòng chọn giảng viên" 
          description="Chọn một giảng viên để xem thống kê đánh giá."
          type="info" 
          showIcon 
        />
      )
    },
    {
      label: (
        <span>
          <UnorderedListOutlined />
          Danh sách đánh giá
        </span>
      ),
      key: 'list',
      children: selectedTeacherId ? (
        <TeacherEvaluationList 
          teacherId={selectedTeacherId} 
          teacherName={selectedTeacherName}
        />
      ) : (
        <Alert 
          message="Vui lòng chọn giảng viên" 
          description="Chọn một giảng viên để xem danh sách đánh giá."
          type="info" 
          showIcon 
        />
      )
    },
    {
      label: (
        <span>
          <UserOutlined />
          Đánh giá của tôi
        </span>
      ),
      key: 'my-evaluations',
      children: (
        <Card title="Đánh giá đã tạo bởi tôi">
          {loading ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <Spin size="large" />
            </div>
          ) : myEvaluations.length > 0 ? (
            <TeacherEvaluationList 
              evaluations={myEvaluations}
              showTeacherName={true}
            />
          ) : (
            <Alert 
              message="Chưa có đánh giá nào" 
              description="Bạn chưa tạo đánh giá nào."
              type="info" 
              showIcon 
            />
          )}
        </Card>
      )
    }
  ];

  return (
    <div className="teacher-evaluation-dashboard">
      <Card>
        <Title level={2}>
          <Space>
            <BarChartOutlined />
            Đánh Giá Giảng Viên
          </Space>
        </Title>
        
        {renderTeacherSelector()}
        
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />
      </Card>

      {/* Evaluation Form Modal */}
      <Modal
        title={`Đánh giá giảng viên: ${selectedTeacherName}`}
        open={evaluationFormVisible}
        onCancel={() => setEvaluationFormVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <TeacherEvaluationForm
          teacherId={selectedTeacherId}
          teacherName={selectedTeacherName}
          classSessionId={currentSessionId}
          onSuccess={handleEvaluationSuccess}
          onCancel={() => setEvaluationFormVisible(false)}
        />
      </Modal>
    </div>
  );
};

export default TeacherEvaluationDashboard;