// components/attendance/LocationStatus.jsx
import React, { useState, useEffect } from 'react';
import { Badge, Space, Tooltip, Tag } from 'antd';
import { EnvironmentOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import locationService from '../../services/locationService';

const LocationStatus = () => {
    const [status, setStatus] = useState('checking');
    const [details, setDetails] = useState(null);

    useEffect(() => {
        checkLocationStatus();
    }, []);

    const checkLocationStatus = async () => {
        try {
            let permission = 'unknown';
            
            // Check if locationService exists and has checkPermission method
            if (locationService && typeof locationService.checkPermission === 'function') {
                permission = await locationService.checkPermission();
            } else {
                // Fallback permission check using browser API
                if (navigator.permissions) {
                    try {
                        const result = await navigator.permissions.query({ name: 'geolocation' });
                        permission = result.state; // 'granted', 'denied', or 'prompt'
                    } catch (err) {
                        permission = 'unknown';
                    }
                } else {
                    permission = 'unknown';
                }
            }
            
            if (permission === 'granted') {
                // Try to get current location to verify GPS is working
                try {
                    let location;
                    if (locationService && typeof locationService.getCurrentLocation === 'function') {
                        location = await locationService.getCurrentLocation();
                    } else {
                        // Fallback to browser geolocation
                        location = await new Promise((resolve, reject) => {
                            if (!navigator.geolocation) {
                                reject(new Error('Geolocation not supported'));
                                return;
                            }
                            navigator.geolocation.getCurrentPosition(
                                (position) => {
                                    resolve({
                                        latitude: position.coords.latitude,
                                        longitude: position.coords.longitude,
                                        accuracy: position.coords.accuracy
                                    });
                                },
                                reject,
                                { enableHighAccuracy: false, timeout: 5000, maximumAge: 60000 }
                            );
                        });
                    }
                    
                    setStatus('enabled');
                    setDetails({
                        accuracy: Math.round(location.accuracy),
                        coordinates: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`
                    });
                } catch (error) {
                    setStatus('error');
                }
            } else if (permission === 'denied') {
                setStatus('denied');
            } else {
                setStatus('prompt');
            }
        } catch (error) {
            console.error('Location status check failed:', error);
            setStatus('error');
        }
    };

    const getStatusDisplay = () => {
        switch (status) {
            case 'enabled':
                return (
                    <Tooltip title={details ? `Độ chính xác: ${details.accuracy}m` : ''}>
                        <Tag color="success" icon={<CheckCircleOutlined />}>
                            GPS Đã bật
                        </Tag>
                    </Tooltip>
                );
            case 'denied':
                return (
                    <Tag color="error" icon={<CloseCircleOutlined />}>
                        GPS Bị chặn
                    </Tag>
                );
            case 'prompt':
                return (
                    <Tag color="warning" icon={<EnvironmentOutlined />}>
                        GPS Chưa cấp quyền
                    </Tag>
                );
            case 'checking':
                return (
                    <Tag icon={<EnvironmentOutlined />}>
                        Đang kiểm tra...
                    </Tag>
                );
            default:
                return (
                    <Tag color="default">
                        GPS Không khả dụng
                    </Tag>
                );
        }
    };

    return (
        <Space>
            {getStatusDisplay()}
        </Space>
    );
};

export default LocationStatus;