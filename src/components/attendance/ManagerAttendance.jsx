// components/attendance/ManagerAttendance.jsx
import {
    CalendarOutlined,
    CheckCircleOutlined,
    EnvironmentOutlined,
    FieldTimeOutlined,
    LoginOutlined,
    LogoutOutlined,
    TeamOutlined
} from '@ant-design/icons';
import {
    Alert,
    Badge,
    Button,
    Card,
    Col,
    Divider,
    Empty,
    message,
    Modal,
    Progress,
    Row,
    Space,
    Spin,
    Statistic, Timeline,
    Typography
} from 'antd';
import moment from 'moment';
import 'moment/locale/vi';
import React, { useEffect, useState } from 'react';
import attendanceService from '../../services/attendanceService';
import locationService from '../../services/locationService';
import AttendanceVerificationModal from './AttendanceVerificationModal';
import LocationStatus from './LocationStatus';

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
    const [todayLogs, setTodayLogs] = useState([]);

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
        loadTodayLogs();
        
        // Refresh every 5 minutes
        const refreshInterval = setInterval(() => {
            loadTodayStatus();
            loadTodayLogs();
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
            console.log('Loading today status...');
            const status = await attendanceService.getTodayStatus();
            console.log('Got today status:', status);
            setTodayStatus(status);
        } catch (error) {
            console.error('Refresh status error:', error);
        }
    };

    const loadTodayLogs = async () => {
        try {
            const today = moment().format('YYYY-MM-DD');
            const logs = await attendanceService.getVerificationLogs(today);
            setTodayLogs(Array.isArray(logs) ? logs : []);
        } catch (error) {
            console.error('Load verification logs error:', error);
            setTodayLogs([]);
        }
    };

    const loadCompanyLocations = async () => {
        try {
            const locations = await attendanceService.getCompanyLocations();
            setCompanyLocations(locations);
        } catch (error) {
            console.error('Load locations error:', error);
            setCompanyLocations([]);
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
            Modal.confirm({
                title: 'Yêu cầu quyền truy cập vị trí',
                content: 'Bạn cần cho phép truy cập vị trí để check-out. Vui lòng bật định vị trong cài đặt trình duyệt.',
                okText: 'Thử lại',
                cancelText: 'Hủy',
                onOk: () => {
                    checkLocationPermission();
                }
            });
            return;
        }
        
        if (!todayStatus?.hasCheckedIn) {
            message.warning('Bạn cần check-in trước khi check-out');
            return;
        }
        
        if (todayStatus?.hasCheckedOut) {
            message.info('Bạn đã check-out hôm nay rồi');
            return;
        }
        
        setVerificationModal({ visible: true, type: 'check-out' });
    };

    const handleVerificationComplete = (success, data) => {
        setVerificationModal({ visible: false, type: null });
        if (success) {
            console.log('Verification successful, reloading status...', data);
            // Force a small delay to ensure localStorage is written
            setTimeout(() => {
                loadTodayStatus();
                loadTodayLogs();
            }, 100);
            if (data?.message) {
                message.success(data.message);
            }
        } else {
            console.log('Verification failed', data);
        }
    };

    const normalizeTime = (value) => {
        if (!value) return null;
        // Case: array [hour, min, sec, nanos]
        if (Array.isArray(value)) {
            const [h = 0, m = 0, s = 0] = value;
            const hh = String(h).padStart(2, '0');
            const mm = String(m).padStart(2, '0');
            const ss = String(s).padStart(2, '0');
            return `${hh}:${mm}:${ss}`;
        }
        // Case: string "HH:mm:ss[.SSS...]"
        if (typeof value === 'string') {
            const parts = value.split(':');
            if (parts.length >= 2) {
                const [h, m, rest] = parts;
                const s = (rest || '0').split(/[.]/)[0];
                const hh = String(parseInt(h, 10)).padStart(2, '0');
                const mm = String(parseInt(m, 10)).padStart(2, '0');
                const ss = String(parseInt(s, 10)).padStart(2, '0');
                return `${hh}:${mm}:${ss}`;
            }
        }
        return null;
    };

    const getWorkingHours = () => {
        const checkInStr = normalizeTime(todayStatus?.checkInTime);
        if (!checkInStr) return '00h 00m';
        const checkOutStr = normalizeTime(todayStatus?.checkOutTime);
        const checkIn = moment(checkInStr, 'HH:mm:ss');
        const checkOut = checkOutStr ? moment(checkOutStr, 'HH:mm:ss') : moment();
        const duration = moment.duration(checkOut.diff(checkIn));
        const hours = Math.floor(duration.asHours());
        const minutes = duration.minutes();
        return `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m`;
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

            {/* Debug Info hidden in production */}
            {process.env.NODE_ENV !== 'production' && (
                <Card style={{ marginBottom: 24, borderRadius: 8, backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
                    <Row justify="space-between" align="middle">
                        <Col>
                            <Space direction="vertical" size="small">
                                <Text strong style={{ color: '#52c41a' }}>Debug Information</Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    Status: {JSON.stringify(todayStatus)}
                                </Text>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    LocationPermission: {locationPermission}
                                </Text>
                            </Space>
                        </Col>
                        <Col>
                            <Space>
                                <Button size="small" onClick={loadTodayStatus}>Refresh Status</Button>
                            </Space>
                        </Col>
                    </Row>
                </Card>
            )}

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
                            {normalizeTime(todayStatus?.checkInTime) && (
                                <>
                                    <Divider type="vertical" style={{ height: 40 }} />
                                    <div>
                                        <Text type="secondary">Check-in:</Text>
                                        <br />
                                        <Text strong style={{ fontSize: 16 }}>
                                            {normalizeTime(todayStatus.checkInTime)}
                                        </Text>
                                    </div>
                                </>
                            )}
                            {normalizeTime(todayStatus?.checkOutTime) && (
                                <>
                                    <Divider type="vertical" style={{ height: 40 }} />
                                    <div>
                                        <Text type="secondary">Check-out:</Text>
                                        <br />
                                        <Text strong style={{ fontSize: 16 }}>
                                            {normalizeTime(todayStatus.checkOutTime)}
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
                        hoverable={true}
                        style={{ 
                            borderRadius: 8,
                            background: (todayStatus?.hasCheckedIn && !todayStatus?.hasCheckedOut)
                                ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                : '#f0f0f0',
                            cursor: 'pointer'
                        }}
                        onClick={handleCheckOut}
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
                                disabled={false}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleCheckOut();
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
                {todayLogs && todayLogs.length > 0 ? (
                    <Timeline mode="left">
                        {todayLogs.map((log) => (
                            <Timeline.Item
                                key={log.id}
                                color={log.verificationType === 'CHECK_IN' ? 'green' : 'blue'}
                                dot={<CheckCircleOutlined />}
                            >
                                <Row justify="space-between">
                                    <Col>
                                        <Space>
                                            <Text strong>
                                                {log.verificationType === 'CHECK_IN' ? 'Check In' : 'Check Out'}
                                            </Text>
                                            {(log.locationVerified || log.networkVerified) && (
                                                <Badge status="success" text="Đã xác thực" />
                                            )}
                                        </Space>
                                    </Col>
                                    <Col>
                                        <Text type="secondary">{moment(log.createdAt).format('HH:mm:ss')}</Text>
                                    </Col>
                                </Row>
                                {(log.latitude && log.longitude) && (
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                        <EnvironmentOutlined /> {`${log.latitude.toFixed ? log.latitude.toFixed(6) : log.latitude}, ${log.longitude.toFixed ? log.longitude.toFixed(6) : log.longitude}`}
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