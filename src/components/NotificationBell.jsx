import React, { useState, useEffect } from 'react';
import { Badge, Button, Popover, List, Typography } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import announcementNotificationService from '../services/announcementNotificationService';

const NotificationBell = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  // Get role dynamically to ensure it's always current
  const [currentRole, setCurrentRole] = useState(localStorage.getItem('role'));
  
  // Debug localStorage on component mount and role change
  useEffect(() => {
    const role = localStorage.getItem('role');
    setCurrentRole(role);
    console.log('=== NotificationBell Debug Info ===');
    console.log('localStorage role:', role);
    console.log('localStorage role type:', typeof role);
    console.log('Current URL:', window.location.href);
    
    // Check if we're on teacher page to determine role
    const isTeacherPage = window.location.href.includes('/teacher');
    console.log('Is teacher page:', isTeacherPage);
    
    if (isTeacherPage && (!role || role === 'null')) {
      console.log('FORCE SETTING TEACHER ROLE');
      localStorage.setItem('role', '2');
      setCurrentRole('2');
    }
    
    console.log('Final role:', localStorage.getItem('role'));
    console.log('=== End Debug Info ===');
  }, []);

  const fetchAnnouncementNotifications = async () => {
    console.log('NotificationBell: Fetching announcement notifications...');
    try {
      setLoading(true);
      console.log('NotificationBell: Making API calls...');
      
      // Get unread count and recent announcements in parallel
      const [count, recentAnnouncements] = await Promise.all([
        announcementNotificationService.getUnreadAnnouncementCount(),
        announcementNotificationService.getRecentUnreadAnnouncements(5)
      ]);
      
      console.log('NotificationBell: Unread count received:', count);
      console.log('NotificationBell: Recent announcements received:', recentAnnouncements);
      
      setAnnouncements(recentAnnouncements || []);
      setUnreadCount(count || 0);
    } catch (error) {
      console.error('NotificationBell: Error fetching notifications:', error);
      // Set empty values on error - no fallbacks
      setAnnouncements([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncementNotifications();
    // Fetch notifications every 30 seconds for more real-time updates
    const interval = setInterval(fetchAnnouncementNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAnnouncementClick = async (announcementId) => {
    try {
      await announcementNotificationService.markAnnouncementAsRead(announcementId, currentRole);
      setUnreadCount(prev => Math.max(0, prev - 1));
      setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
      handleViewAll();
    } catch (error) {
      console.error('Error marking announcement as read:', error);
      handleViewAll();
    }
  };

  const handleViewAll = () => {
    console.log('NotificationBell: handleViewAll called');
    
    // Get fresh role from localStorage and currentRole state
    const freshRole = localStorage.getItem('role');
    const roleToUse = currentRole || freshRole;
    console.log('NotificationBell: Current role from localStorage:', freshRole);
    console.log('NotificationBell: Current role from state:', currentRole);
    console.log('NotificationBell: Role to use:', roleToUse, 'type:', typeof roleToUse);
    
    // Handle both string and number role values
    const roleStr = String(roleToUse).toUpperCase();
    let rolePath;
    
    if (roleStr === '2' || roleStr === 'TEACHER') {
      rolePath = 'teacher';
    } else if (roleStr === '5' || roleStr === 'ACCOUNTANT') {
      rolePath = 'accountant';
    } else if (roleStr === '1' || roleStr === 'STUDENT') {
      rolePath = 'student';
    } else {
      // Check URL to determine role if localStorage is empty
      const isTeacherPage = window.location.href.includes('/teacher');
      const isAccountantPage = window.location.href.includes('/accountant');
      if (isTeacherPage) {
        rolePath = 'teacher';
      } else if (isAccountantPage) {
        rolePath = 'accountant';
      } else {
        rolePath = 'student';
      }
      console.log('NotificationBell: Role detection from URL - isTeacherPage:', isTeacherPage, 'isAccountantPage:', isAccountantPage);
    }
    
    console.log('NotificationBell: Determined rolePath:', rolePath);
    const targetUrl = `/${rolePath}/announcements`;
    console.log('NotificationBell: Navigating to:', targetUrl);
    navigate(targetUrl);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    let date;
    if (typeof dateString === 'string') {
      const isoString = dateString.replace(' ', 'T');
      date = new Date(isoString);
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      return 'Vừa xong';
    }
    
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Vừa xong';
    if (diffInMinutes < 60) return `${diffInMinutes} phút trước`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} giờ trước`;
    return `${Math.floor(diffInMinutes / 1440)} ngày trước`;
  };

  const notificationContent = (
    <div style={{ width: 350, maxHeight: 400, overflowY: 'auto' }}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <BellOutlined style={{ fontSize: '24px', color: '#d1d5db', marginBottom: '8px' }} />
          <p className="text-gray-500">Không có thông báo mới</p>
        </div>
      ) : (
        <List
          itemLayout="horizontal"
          dataSource={announcements}
          renderItem={(item) => (
            <List.Item 
              onClick={() => handleAnnouncementClick(item.id)}
              style={{ 
                cursor: 'pointer',
                padding: '12px 16px',
                borderBottom: '1px solid #f0f0f0'
              }}
              className="hover:bg-gray-50 transition-colors"
            >
              <List.Item.Meta
                avatar={
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                    <BellOutlined style={{ color: '#3b82f6', fontSize: '14px' }} />
                  </div>
                }
                title={
                  <div className="flex items-start justify-between">
                    <span className="font-medium text-gray-900 text-sm line-clamp-1">
                      {item.title}
                    </span>
                    <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                }
                description={
                  <div>
                    <Typography.Paragraph 
                      ellipsis={{ rows: 2 }} 
                      className="mb-1 text-gray-600 text-xs"
                      style={{ marginBottom: '4px' }}
                    >
                      {item.content}
                    </Typography.Paragraph>
                    {item.priority && (
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        item.priority === 'HIGH' ? 'bg-red-100 text-red-800' :
                        item.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority === 'HIGH' ? 'Cao' : 
                         item.priority === 'MEDIUM' ? 'Trung bình' : 'Thấp'}
                      </span>
                    )}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
      
      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        padding: '12px 16px',
        borderTop: '1px solid #f0f0f0',
        backgroundColor: '#fafafa'
      }}>
        <Button 
          type="link" 
          onClick={handleViewAll}
          style={{ padding: '4px 8px', height: 'auto' }}
        >
          Xem tất cả thông báo
        </Button>
      </div>
    </div>
  );

  return (
    <Popover 
      content={notificationContent} 
      title="Thông báo mới" 
      trigger="click"
      placement="bottomRight"
    >
      <Badge count={unreadCount} overflowCount={99}>
        <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
      </Badge>
    </Popover>
  );
};

export default NotificationBell;
