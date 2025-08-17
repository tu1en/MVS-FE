import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLE } from '../constants/constants';
import { useBackButton } from '../hooks/useBackButton';
import AdminNotificationManagement from '../components/admin/AdminNotificationManagement';

export default function AdminNotificationPage() {
  const navigate = useNavigate();
  useBackButton();

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== ROLE.ADMIN) {
      navigate('/');
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNotificationManagement />
    </div>
  );
}