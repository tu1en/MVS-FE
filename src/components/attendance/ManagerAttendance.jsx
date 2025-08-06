// components/attendance/ManagerAttendance.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { 
    Card, Button, Row, Col, Statistic, Timeline, Alert, message, 
    Spin, Badge, Space, Divider, Typography, Progress, Empty, Modal 
} from 'antd';
import { 
    ClockCircleOutlined, 
    EnvironmentOutlined, 
    GlobalOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    LoginOutlined,
    LogoutOutlined,
    CalendarOutlined,
    TeamOutlined,
    FieldTimeOutlined
} from '@ant-design/icons';
import AttendanceVerificationModal from './AttendanceVerificationModal';
import LocationStatus from './LocationStatus';
import attendanceService from '../../services/attendanceService';
import locationService from '../../services/locationService';
import moment from 'moment';
import 'moment/locale/vi';

const { Title, Text } = Typography;

moment.locale('vi');

const ManagerAttendance = ({ user }) => {
    // States
    const [loading, setLoading] = useState(false);
    const [todayStatus, setTodayStatus] = useState(null);
    const [currentTime, setCurrentTime] = useState(moment());
    const [locationPermission, setLocationPermission] = useState(null);
    const [verificationModal, setVerificationModal] = useState({
        visible: false,
        type: null // 'check-in' or 'check-out'
    });
    const [weeklyStats, setWeeklyStats] = useState(null);
    const [companyLocations, setCompanyLocations] = useState([]);

    // Clock update
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(moment());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Initial load
    useEffect(() => {
        initializeAttendance();
        checkLocationPermission();
        loadCompanyLocations();
        
        // Refresh every 5 minutes
        const refreshInterval = setInterval(() => {
            loadTodayStatus();
        }, 5 * 60 * 1000);
        
        return () => clearInterval(refreshInterval);
    }, []);

    const initializeAttendance = async () => {
        setLoading(true);
        try {
            const [status, stats] = await Promise.all([
                attendanceService.getTodayStatus(),
                attendanceService.getWeeklyStats()
            ]);
            setTodayStatus(status);
            setWeeklyStats(stats);
        } catch (error) {
            message.error('Không thể tải thông tin chấm công');
            console.error('Load attendance error:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadTodayStatus = async () => {
        try {
            const status = await attendanceService.getTodayStatus();
            setTodayStatus(status);
        } catch (error) {
            console.error('Refresh status error:', error);
        }
    };

    const loadCompanyLocations = async () => {
        try {
            const locations = await attendanceService.getCompanyLocations();
            setCompanyLocations(locations);
        } catch (error) {
            console.error('Load locations error:', error);
        }
    };

    const checkLocationPermission = async () => {
        if (!locationService || typeof locationService.checkPermission !== 'function') {
            setLocationPermission('unknown');
            return;
        }
        
        try {
            const permission = await locationService.checkPermission();
            setLocationPermission(permission);
            
            if (permission === 'denied') {
                message.warning('Vui lòng bật định vị để sử dụng chức năng chấm công');
            }
        } catch (error) {
            console.error('Check permission error:', error);
            setLocationPermission('unknown');
        }
    };

    const handleCheckIn = () => {
        if (locationPermission === 'denied') {
            Modal.confirm({
                title: 'Yêu cầu quyền truy cập vị trí',
                content: 'Bạn cần cho phép truy cập vị trí để chấm công. Vui lòng bật định vị trong cài đặt trình duyệt.',
                okText: 'Đã hiểu',
                cancelText: 'Hủy'
            });
            return;
        }
        setVerificationModal({ visible: true, type: 'check-in' });
    };

    const handleCheckOut = () => {
        if (locationPermission === 'denied') {
            message.error('Cần quyền truy cập vị trí để check-out');
            return;
        }
        setVerificationModal({ visible: true, type: 'check-out' });
    };

    const handleVerificationComplete = (success, data) => {
        setVerificationModal({ visible: false, type: null });
        if (success) {
            loadTodayStatus();
            if (data?.message) {
                message.success(data.message);
            }
        }
    };

    const getWorkingHours = () => {
        if (!todayStatus?.checkInTime) return '00:00';
        
        const checkIn = moment(todayStatus.checkInTime, 'HH:mm:ss');
        const checkOut = todayStatus.checkOutTime 
            ? moment(todayStatus.checkOutTime, 'HH:mm:ss')
            : moment();
        
        const duration = moment.duration(checkOut.diff(checkIn));
        return `${Math.floor(duration.asHours())}h ${duration.minutes()}m`;
    };

    const getAttendanceStatus = () => {
        if (!todayStatus?.hasCheckedIn) return 'waiting';
        if (todayStatus?.hasCheckedOut) return 'completed';
        return 'working';
    };

    const getStatusColor = () => {
        const status = getAttendanceStatus();
        return {
            waiting: '#d9d9d9',
            working: '#52c41a',
            completed: '#1890ff'
        }[status];
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh',
                backgroundColor: '#f0f2f5'
            }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    return (
        <div style={{ padding: 24, backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
            {/* Header */}
            <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                <Row justify="space-between" align="middle">
                    <Col xs={24} md={12}>
                        <Space direction="vertical" size={0}>
                            <Title level={3} style={{ margin: 0 }}>
                                <TeamOutlined /> Chấm Công Nhân Viên
                            </Title>
                            <Text type="secondary">
                                Xin chào, <strong>{user?.fullName || user?.username}</strong>
                            </Text>
                            <Text type="secondary">
                                Vai trò: <Badge status="processing" text="Manager" />
                            </Text>
                        </Space>
                    </Col>
                    <Col xs={24} md={12} style={{ textAlign: 'right' }}>
                        <Space direction="vertical" size={0}>
                            <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#1890ff' }}>
                                {currentTime.format('HH:mm:ss')}
                            </Text>
                            <Text type="secondary" style={{ fontSize: 16 }}>
                                {currentTime.format('dddd, DD/MM/YYYY')}
                            </Text>
                        </Space>
                    </Col>
                </Row>
            </Card>

            {/* Location Permission Alert */}
            {locationPermission === 'denied' && (
                <Alert
                    message="Chưa cấp quyền vị trí"
                    description="Vui lòng cho phép truy cập vị trí để sử dụng chức năng chấm công"
                    type="warning"
                    showIcon
                    closable
                    style={{ marginBottom: 24 }}
                />
            )}

            {/* Status Bar */}
            <Card style={{ marginBottom: 24, borderRadius: 8 }}>
                <Row gutter={16} align="middle">
                    <Col flex="auto">
                        <Space size="large">
                            <div>
                                <Text type="secondary">Trạng thái:</Text>
                                <br />
                                <Badge 
                                    status={getAttendanceStatus() === 'working' ? 'processing' : 'default'}
                                    text={
                                        getAttendanceStatus() === 'waiting' ? 'Chưa check-in' :
                                        getAttendanceStatus() === 'working' ? 'Đang làm việc' :
                                        'Đã hoàn thành'
                                    }
                                    style={{ fontSize: 16, fontWeight: 500 }}
                                />
                            </div>
                            <Divider type="vertical" style={{ height: 40 }} />
                            <div>
                                <Text type="secondary">Giờ làm hôm nay:</Text>
                                <br />
                                <Text strong style={{ fontSize: 18, color: getStatusColor() }}>
                                    {getWorkingHours()}
                                </Text>
                            </div>
                            {todayStatus?.checkInTime && (
                                <>
                                    <Divider type="vertical" style={{ height: 40 }} />
                                    <div>
                                        <Text type="secondary">Check-in:</Text>
                                        <br />
                                        <Text strong style={{ fontSize: 16 }}>
                                            {todayStatus.checkInTime}
                                        </Text>
                                    </div>
                                </>
                            )}
                            {todayStatus?.checkOutTime && (
                                <>
                                    <Divider type="vertical" style={{ height: 40 }} />
                                    <div>
                                        <Text type="secondary">Check-out:</Text>
                                        <br />
                                        <Text strong style={{ fontSize: 16 }}>
                                            {todayStatus.checkOutTime}
                                        </Text>
                                    </div>
                                </>
                            )}
                        </Space>
                    </Col>
                    <Col>
                        <LocationStatus />
                    </Col>
                </Row>
            </Card>

            {/* Action Cards */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={24} md={12}>
                    <Card
                        hoverable={!todayStatus?.hasCheckedIn}
                        style={{ 
                            borderRadius: 8,
                            background: todayStatus?.hasCheckedIn 
                                ? '#f0f0f0' 
                                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                            cursor: todayStatus?.hasCheckedIn ? 'not-allowed' : 'pointer'
                        }}
                        onClick={!todayStatus?.hasCheckedIn ? handleCheckIn : undefined}
                    >
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <LoginOutlined style={{ 
                                fontSize: 64, 
                                color: todayStatus?.hasCheckedIn ? '#bfbfbf' : '#fff',
                                marginBottom: 16
                            }} />
                            <Title level={3} style={{ 
                                color: todayStatus?.hasCheckedIn ? '#8c8c8c' : '#fff',
                                marginBottom: 8
                            }}>
                                CHECK IN
                            </Title>
                            <Text style={{ 
                                color: todayStatus?.hasCheckedIn ? '#8c8c8c' : 'rgba(255,255,255,0.9)',
                                display: 'block',
                                marginBottom: 24
                            }}>
                                Bắt đầu ca làm việc
                            </Text>
                            <Button
                                type={todayStatus?.hasCheckedIn ? "default" : "primary"}
                                size="large"
                                disabled={todayStatus?.hasCheckedIn}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!todayStatus?.hasCheckedIn) handleCheckIn();
                                }}
                                icon={<CheckCircleOutlined />}
                                style={{ 
                                    width: '80%',
                                    backgroundColor: todayStatus?.hasCheckedIn ? '#f0f0f0' : '#fff',
                                    color: todayStatus?.hasCheckedIn ? '#8c8c8c' : '#764ba2',
                                    border: 'none'
                                }}
                            >
                                {todayStatus?.hasCheckedIn 
                                    ? `Đã check-in lúc ${todayStatus.checkInTime}`
                                    : 'Check-in Ngay'
                                }
                            </Button>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card
                        hoverable={todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut}
                        style={{ 
                            borderRadius: 8,
                            background: (todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut)
                                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                : '#f0f0f0',
                            cursor: (todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut) 
                                ? 'pointer' 
                                : 'not-allowed'
                        }}
                        onClick={(todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut) 
                            ? handleCheckOut 
                            : undefined
                        }
                    >
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <LogoutOutlined style={{ 
                                fontSize: 64, 
                                color: (todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut) 
                                    ? '#fff' 
                                    : '#bfbfbf',
                                marginBottom: 16
                            }} />
                            <Title level={3} style={{ 
                                color: (todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut) 
                                    ? '#fff' 
                                    : '#8c8c8c',
                                marginBottom: 8
                            }}>
                                CHECK OUT
                            </Title>
                            <Text style={{ 
                                color: (todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut) 
                                    ? 'rgba(255,255,255,0.9)' 
                                    : '#8c8c8c',
                                display: 'block',
                                marginBottom: 24
                            }}>
                                Kết thúc ca làm việc
                            </Text>
                            <Button
                                type={(todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut) 
                                    ? "primary" 
                                    : "default"
                                }
                                size="large"
                                danger={todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut}
                                disabled={!todayStatus?.hasCheckedIn || todayStatus?.hasCheckedOut}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut) {
                                        handleCheckOut();
                                    }
                                }}
                                icon={<CheckCircleOutlined />}
                                style={{ 
                                    width: '80%',
                                    backgroundColor: (todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut)
                                        ? '#fff'
                                        : '#f0f0f0',
                                    color: (todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut)
                                        ? '#f5576c'
                                        : '#8c8c8c',
                                    border: 'none'
                                }}
                            >
                                {todayStatus?.hasCheckedOut 
                                    ? `Đã check-out lúc ${todayStatus.checkOutTime}`
                                    : !todayStatus?.hasCheckedIn
                                    ? 'Chưa check-in'
                                    : 'Check-out Ngay'
                                }
                            </Button>
                        </div>
                    </Card>
                </Col>
            </Row>

            {/* Statistics */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Giờ làm tuần này"
                            value={weeklyStats?.totalHours || 0}
                            suffix="/ 40 giờ"
                            prefix={<FieldTimeOutlined />}
                        />
                        <Progress 
                            percent={Math.min(100, (weeklyStats?.totalHours || 0) / 40 * 100)} 
                            showInfo={false}
                            strokeColor="#52c41a"
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Số ngày làm việc"
                            value={weeklyStats?.daysWorked || 0}
                            suffix="/ 5 ngày"
                            prefix={<CalendarOutlined />}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Đi muộn tháng này"
                            value={weeklyStats?.lateCount || 0}
                            suffix="lần"
                            valueStyle={{ 
                                color: (weeklyStats?.lateCount || 0) > 3 ? '#cf1322' : '#3f8600' 
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={12} md={6}>
                    <Card>
                        <Statistic
                            title="Ngày phép còn lại"
                            value={weeklyStats?.remainingLeaves || 12}
                            suffix="ngày"
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Today Timeline */}
            <Card title="Lịch sử chấm công hôm nay" style={{ borderRadius: 8 }}>
                {todayStatus?.timeline && todayStatus.timeline.length > 0 ? (
                    <Timeline mode="left">
                        {todayStatus.timeline.map((item, index) => (
                            <Timeline.Item
                                key={index}
                                color={item.type === 'check-in' ? 'green' : 'blue'}
                                dot={<CheckCircleOutlined />}
                            >
                                <Row justify="space-between">
                                    <Col>
                                        <Space>
                                            <Text strong>
                                                {item.type === 'check-in' ? 'Check In' : 'Check Out'}
                                            </Text>
                                            {item.verified && (
                                                <Badge status="success" text="Đã xác thực" />
                                            )}
                                        </Space>
                                    </Col>
                                    <Col>
                                        <Text type="secondary">{item.time}</Text>
                                    </Col>
                                </Row>
                                {item.location && (
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        <EnvironmentOutlined /> {item.location}
                                    </Text>
                                )}
                            </Timeline.Item>
                        ))}
                    </Timeline>
                ) : (
                    <Empty description="Chưa có dữ liệu chấm công hôm nay" />
                )}
            </Card>

            {/* Verification Modal */}
            <AttendanceVerificationModal
                visible={verificationModal.visible}
                type={verificationModal.type}
                onComplete={handleVerificationComplete}
                user={user}
                companyLocations={companyLocations}
            />
        </div>
    );
};

export default ManagerAttendance;