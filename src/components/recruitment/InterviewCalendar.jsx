import React, { useState, useEffect, useCallback, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Modal, Form, Select, Button, message, Popconfirm, Tag, Space, Card, Row, Col, Typography } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import axiosInstance from '../../config/axiosInstance';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import './InterviewCalendar.css';

dayjs.locale('vi');

const { Option } = Select;
const { Title, Text } = Typography;

const InterviewCalendar = ({ selectedPlan, interviews, approvedApplications, onDataRefresh }) => {
  const [events, setEvents] = useState([]);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [editingInterview, setEditingInterview] = useState(null);
  const [scheduleForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const calendarRef = useRef(null);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (calendarRef.current) {
        const calendarApi = calendarRef.current.getApi();
        if (calendarApi && typeof calendarApi.destroy === 'function') {
          calendarApi.destroy();
        }
      }
    };
  }, []);

  // Chuyển đổi interviews thành events cho calendar
  useEffect(() => {
    // Lọc bỏ các lịch phỏng vấn có status REJECTED (không hiển thị trên calendar)
    const validInterviews = interviews.filter(interview => interview.status !== 'REJECTED');
    
    const calendarEvents = validInterviews.map(interview => ({
      id: interview.id,
      title: `${interview.applicantName} - ${interview.jobTitle}`,
      start: interview.startTime,
      end: interview.endTime,
      extendedProps: {
        interview: interview,
        status: interview.status,
        applicationId: interview.applicationId
      },
      backgroundColor: getEventColor(interview.status),
      borderColor: getEventColor(interview.status),
      textColor: 'white',
      classNames: [`status-${interview.status.toLowerCase()}`]
    }));
    setEvents(calendarEvents);
  }, [interviews]);

  // Lấy màu sắc cho event dựa trên status
  const getEventColor = (status) => {
    switch (status) {
      case 'SCHEDULED':
        return '#1890ff';
      case 'PENDING':
        return '#faad14';
      case 'DONE':
        return '#52c41a';
      case 'ACCEPTED':
        return '#722ed1';
      case 'REJECTED':
        return '#ff4d4f';
      default:
        return '#d9d9d9';
    }
  };

  // Xử lý khi click vào slot trống để lên lịch
  const handleDateSelect = useCallback((selectInfo) => {
    const start = selectInfo.start;
    const end = selectInfo.end;
    
    // Cho phép lên lịch 24/7 - không giới hạn giờ hành chính

    // Kiểm tra xem slot có bị trùng với lịch hiện tại không
    const conflictingEvent = events.find(event => {
      const eventStart = new Date(event.start);
      const eventEnd = new Date(event.end);
      
      // Bỏ qua events có trạng thái "COMPLETED" (hoàn thành) - cho phép overlap
      if (event.extendedProps?.interview?.status === 'COMPLETED') {
        return false;
      }
      
      return (
        (start < eventEnd && end > eventStart) ||
        (start.getTime() === eventStart.getTime() && end.getTime() === eventEnd.getTime())
      );
    });

    if (conflictingEvent) {
      message.warning('Khoảng thời gian này đã có lịch phỏng vấn!');
      selectInfo.view.calendar.unselect();
      return;
    }

    setSelectedSlot({ start, end });
    setShowScheduleModal(true);
    selectInfo.view.calendar.unselect();
  }, [events]);

  // Xử lý khi kéo thả event để thay đổi thời gian
  const handleEventDrop = useCallback(async (dropInfo) => {
    try {
      const { event } = dropInfo;
      const newStart = event.start;
      const newEnd = event.end || dayjs(newStart).add(1, 'hour').toDate();
      
      // Không cho phép kéo thả lịch đã hoàn thành/đã chấp nhận
      if (event.extendedProps?.interview?.status === 'COMPLETED' || 
          event.extendedProps?.interview?.status === 'ACCEPTED') {
        message.warning('Không thể thay đổi lịch phỏng vấn đã hoàn thành/đã chấp nhận!');
        dropInfo.revert();
        return;
      }
      
      // Cho phép kéo thả lịch 24/7 - không giới hạn giờ hành chính
      
      // Debug log để kiểm tra thời gian
      console.log('Event drop validation:', {
        eventId: event.id,
        newStart: newStart,
        newEnd: newEnd,
        status: event.extendedProps?.interview?.status
      });

      // Debug log để kiểm tra cấu trúc events
      console.log('All events for conflict checking:', events.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        extendedProps: e.extendedProps
      })));

      // Kiểm tra cùng ngày
      if (!dayjs(newStart).isSame(dayjs(newEnd), 'day')) {
        message.warning('Thời gian bắt đầu và kết thúc phải trong cùng một ngày!');
        dropInfo.revert();
        return;
      }
      
      // Kiểm tra ngày không được thay đổi (chỉ cho phép thay đổi giờ)
      const originalDate = dayjs(event.extendedProps?.interview?.startTime || event.start).format('YYYY-MM-DD');
      const newDate = dayjs(newStart).format('YYYY-MM-DD');
      if (originalDate !== newDate) {
        message.warning('Không được phép thay đổi ngày! Chỉ có thể thay đổi giờ.');
        dropInfo.revert();
        return;
      }

      // Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
      if (newStart >= newEnd) {
        message.warning('Thời gian bắt đầu phải trước thời gian kết thúc!');
        dropInfo.revert();
        return;
      }

      // Kiểm tra không quá 4 tiếng
      const durationHours = dayjs(newEnd).diff(dayjs(newStart), 'hour', true);
      if (durationHours > 4) {
        message.warning('Thời gian phỏng vấn không được quá 4 tiếng!');
        dropInfo.revert();
        return;
      }

      // Kiểm tra trùng lịch với events khác (loại trừ event hiện tại và cùng ứng viên)
      const conflictingEvent = events.find(e => {
        // Bỏ qua event đang được kéo thả
        if (e.id === event.id) return false;
        
        // Đảm bảo event có start và end hợp lệ
        if (!e.start || !e.end) return false;
        
        // Bỏ qua events của cùng ứng viên (cho phép thay đổi lịch của chính mình)
        const currentEventAppId = event.extendedProps?.applicationId;
        const otherEventAppId = e.extendedProps?.applicationId;
        if (currentEventAppId && otherEventAppId && currentEventAppId === otherEventAppId) {
          return false;
        }
        
        // Bỏ qua events có trạng thái "COMPLETED" (hoàn thành) - cho phép overlap
        if (e.extendedProps?.interview?.status === 'COMPLETED') {
          return false;
        }
        
        const eventStart = new Date(e.start);
        const eventEnd = new Date(e.end);
        
        // Kiểm tra xung đột thời gian chính xác hơn
        // Xung đột xảy ra khi:
        // 1. Thời gian bắt đầu mới < thời gian kết thúc của event khác VÀ
        // 2. Thời gian kết thúc mới > thời gian bắt đầu của event khác
        const hasTimeOverlap = (
          (newStart < eventEnd && newEnd > eventStart) ||
          (newStart.getTime() === eventStart.getTime() && newEnd.getTime() === eventEnd.getTime())
        );
        
        // Debug log để kiểm tra
        console.log('Checking conflict:', {
          currentEvent: { 
            id: event.id, 
            start: newStart, 
            end: newEnd, 
            applicationId: currentEventAppId 
          },
          otherEvent: { 
            id: e.id, 
            start: eventStart, 
            end: eventEnd, 
            title: e.title, 
            applicationId: otherEventAppId,
            status: e.extendedProps?.interview?.status,
            extendedProps: e.extendedProps 
          },
          hasOverlap: hasTimeOverlap,
          sameApplicant: currentEventAppId === otherEventAppId,
          otherEventStatus: e.extendedProps?.interview?.status
        });
        
        return hasTimeOverlap;
      });

      if (conflictingEvent) {
        const conflictStart = dayjs(conflictingEvent.start).format('HH:mm');
        const conflictEnd = dayjs(conflictingEvent.end).format('HH:mm');
        
        // Lấy tên ứng viên từ extendedProps hoặc title
        let applicantName = 'Ứng viên khác';
        if (conflictingEvent.extendedProps && conflictingEvent.extendedProps.interview) {
          applicantName = conflictingEvent.extendedProps.interview.applicantName || 'Ứng viên khác';
        } else if (conflictingEvent.title) {
          // Parse từ title format: "Tên ứng viên - Vị trí"
          const titleParts = conflictingEvent.title.split(' - ');
          applicantName = titleParts[0] || 'Ứng viên khác';
        }
        
        message.warning(
          `Thời gian này đã có lịch phỏng vấn của ${applicantName} ` +
          `(${conflictStart}-${conflictEnd}). Vui lòng chọn thời gian khác!`
        );
        dropInfo.revert();
        return;
      }

      // Cập nhật thời gian trên backend
      const startTimeStr = dayjs(newStart).format('YYYY-MM-DDTHH:mm:ss');
      const endTimeStr = dayjs(newEnd).format('YYYY-MM-DDTHH:mm:ss');

      await axiosInstance.put(`/interview-schedules/${event.id}`, null, {
        params: {
          startTime: startTimeStr,
          endTime: endTimeStr
        }
      });

      // Lấy tên ứng viên để hiển thị thông báo
      let applicantName = 'Ứng viên';
      if (event.extendedProps && event.extendedProps.interview) {
        applicantName = event.extendedProps.interview.applicantName || 'Ứng viên';
      } else if (event.title) {
        const titleParts = event.title.split(' - ');
        applicantName = titleParts[0] || 'Ứng viên';
      }

      message.success(`Cập nhật lịch phỏng vấn của ${applicantName} thành công!`);
      onDataRefresh();
    } catch (err) {
      console.error('Error updating interview time:', err);
      if (err.response && err.response.data && err.response.data.message) {
        message.error(err.response.data.message);
      } else {
        message.error('Không thể cập nhật thời gian!');
      }
      dropInfo.revert();
    }
  }, [events, onDataRefresh]);

  // Xử lý khi thay đổi kích thước event
  const handleEventResize = useCallback(async (resizeInfo) => {
    try {
      const { event } = resizeInfo;
      const newStart = event.start;
      const newEnd = event.end;
      
      // Không cho phép resize lịch đã hoàn thành/đã chấp nhận
      if (event.extendedProps?.interview?.status === 'COMPLETED' || 
          event.extendedProps?.interview?.status === 'ACCEPTED') {
        message.warning('Không thể thay đổi lịch phỏng vấn đã hoàn thành/đã chấp nhận!');
        resizeInfo.revert();
        return;
      }
      
      // Cho phép resize lịch 24/7 - không giới hạn giờ hành chính
      
      // Debug log để kiểm tra thời gian
      console.log('Event resize validation:', {
        eventId: event.id,
        newStart: newStart,
        newEnd: newEnd,
        status: event.extendedProps?.interview?.status
      });

      // Debug log để kiểm tra cấu trúc events
      console.log('All events for conflict checking (resize):', events.map(e => ({
        id: e.id,
        title: e.title,
        start: e.start,
        end: e.end,
        extendedProps: e.extendedProps
      })));

      // Kiểm tra cùng ngày
      if (!dayjs(newStart).isSame(dayjs(newEnd), 'day')) {
        message.warning('Thời gian bắt đầu và kết thúc phải trong cùng một ngày!');
        resizeInfo.revert();
        return;
      }
      
      // Kiểm tra ngày không được thay đổi (chỉ cho phép thay đổi giờ)
      const originalDate = dayjs(event.extendedProps?.interview?.startTime || event.start).format('YYYY-MM-DD');
      const newDate = dayjs(newStart).format('YYYY-MM-DD');
      if (originalDate !== newDate) {
        message.warning('Không được phép thay đổi ngày! Chỉ có thể thay đổi giờ.');
        resizeInfo.revert();
        return;
      }

      // Kiểm tra thời gian bắt đầu phải trước thời gian kết thúc
      if (newStart >= newEnd) {
        message.warning('Thời gian bắt đầu phải trước thời gian kết thúc!');
        resizeInfo.revert();
        return;
      }

      // Kiểm tra không quá 4 tiếng
      const durationHours = dayjs(newEnd).diff(dayjs(newStart), 'hour', true);
      if (durationHours > 4) {
        message.warning('Thời gian phỏng vấn không được quá 4 tiếng!');
        resizeInfo.revert();
        return;
      }

      // Kiểm tra trùng lịch với events khác (loại trừ event hiện tại và cùng ứng viên)
      const conflictingEvent = events.find(e => {
        // Bỏ qua event đang được resize
        if (e.id === event.id) return false;
        
        // Đảm bảo event có start và end hợp lệ
        if (!e.start || !e.end) return false;
        
        // Bỏ qua events của cùng ứng viên (cho phép thay đổi lịch của chính mình)
        const currentEventAppId = event.extendedProps?.applicationId;
        const otherEventAppId = e.extendedProps?.applicationId;
        if (currentEventAppId && otherEventAppId && currentEventAppId === otherEventAppId) {
          return false;
        }
        
        // Bỏ qua events có trạng thái "COMPLETED" (hoàn thành) - cho phép overlap
        if (e.extendedProps?.interview?.status === 'COMPLETED') {
          return false;
        }
        
        const eventStart = new Date(e.start);
        const eventEnd = new Date(e.end);
        
        // Kiểm tra xung đột thời gian chính xác hơn
        // Xung đột xảy ra khi:
        // 1. Thời gian bắt đầu mới < thời gian kết thúc của event khác VÀ
        // 2. Thời gian kết thúc mới > thời gian bắt đầu của event khác
        const hasTimeOverlap = (
          (newStart < eventEnd && newEnd > eventStart) ||
          (newStart.getTime() === eventStart.getTime() && newEnd.getTime() === eventEnd.getTime())
        );
        
        // Debug log để kiểm tra
        console.log('Checking resize conflict:', {
          currentEvent: { 
            id: event.id, 
            start: newStart, 
            end: newEnd, 
            applicationId: currentEventAppId 
          },
          otherEvent: { 
            id: e.id, 
            start: eventStart, 
            end: eventEnd, 
            title: e.title, 
            applicationId: otherEventAppId,
            status: e.extendedProps?.interview?.status,
            extendedProps: e.extendedProps 
          },
          hasOverlap: hasTimeOverlap,
          sameApplicant: currentEventAppId === otherEventAppId,
          otherEventStatus: e.extendedProps?.interview?.status
        });
        
        return hasTimeOverlap;
      });

      if (conflictingEvent) {
        const conflictStart = dayjs(conflictingEvent.start).format('HH:mm');
        const conflictEnd = dayjs(conflictingEvent.end).format('HH:mm');
        
        // Lấy tên ứng viên từ extendedProps hoặc title
        let applicantName = 'Ứng viên khác';
        if (conflictingEvent.extendedProps && conflictingEvent.extendedProps.interview) {
          applicantName = conflictingEvent.extendedProps.interview.applicantName || 'Ứng viên khác';
        } else if (conflictingEvent.title) {
          // Parse từ title format: "Tên ứng viên - Vị trí"
          const titleParts = conflictingEvent.title.split(' - ');
          applicantName = titleParts[0] || 'Ứng viên khác';
        }
        
        message.warning(
          `Thời gian này đã có lịch phỏng vấn của ${applicantName} ` +
          `(${conflictStart}-${conflictEnd}). Vui lòng chọn thời gian khác!`
        );
        resizeInfo.revert();
        return;
      }

      // Cập nhật thời gian trên backend
      const startTimeStr = dayjs(newStart).format('YYYY-MM-DDTHH:mm:ss');
      const endTimeStr = dayjs(newEnd).format('YYYY-MM-DDTHH:mm:ss');

      await axiosInstance.put(`/interview-schedules/${event.id}`, null, {
        params: {
          startTime: startTimeStr,
          endTime: endTimeStr
        }
      });

      // Lấy tên ứng viên để hiển thị thông báo
      let applicantName = 'Ứng viên';
      if (event.extendedProps && event.extendedProps.interview) {
        applicantName = event.extendedProps.interview.applicantName || 'Ứng viên';
      } else if (event.title) {
        const titleParts = event.title.split(' - ');
        applicantName = titleParts[0] || 'Ứng viên';
      }

      message.success(`Cập nhật thời gian phỏng vấn của ${applicantName} thành công!`);
      onDataRefresh();
    } catch (err) {
      console.error('Error resizing interview:', err);
      if (err.response && err.response.data && err.response.data.message) {
        message.error(err.response.data.message);
      } else {
        message.error('Không thể cập nhật thời gian!');
      }
      resizeInfo.revert();
    }
  }, [events, onDataRefresh]);

  // Xử lý khi click vào event để chỉnh sửa/xóa
  const handleEventClick = useCallback((clickInfo) => {
    setEditingInterview(clickInfo.event.extendedProps.interview);
    setShowEditModal(true);
  }, []);

  // Xử lý lên lịch mới
  const handleScheduleSubmit = async (values) => {
    try {
      const { applicationId } = values;
      const startTime = dayjs(selectedSlot.start).format('YYYY-MM-DDTHH:mm:ss');
      const endTime = dayjs(selectedSlot.end).format('YYYY-MM-DDTHH:mm:ss');

      const response = await axiosInstance.post('/interview-schedules', null, {
        params: {
          applicationId: applicationId,
          startTime: startTime,
          endTime: endTime
        }
      });

      message.success('Lên lịch phỏng vấn thành công!');
      setShowScheduleModal(false);
      scheduleForm.resetFields();
      onDataRefresh();
    } catch (err) {
      console.error('Error scheduling interview:', err);
      if (err.response && err.response.data && err.response.data.message) {
        message.error(err.response.data.message);
      } else {
        message.error('Không thể lên lịch phỏng vấn!');
      }
    }
  };

  // Xử lý cập nhật lịch
      const handleEditSubmit = async (values) => {
      try {
        // Kiểm tra trạng thái lịch trước khi cập nhật
        if (editingInterview.status === 'DONE' || 
            editingInterview.status === 'ACCEPTED') {
          message.warning('Không thể cập nhật lịch phỏng vấn đã hoàn thành/đã chấp nhận!');
          return;
        }
        
        const { startTime, endTime } = values;
        
        // Lấy ngày hiện tại từ lịch phỏng vấn đang chỉnh sửa
        const currentDate = dayjs(editingInterview.startTime).format('YYYY-MM-DD');
        
        // Tạo thời gian mới với ngày hiện tại và giờ mới (không có phút)
        const startTimeStr = `${currentDate}T${startTime}:00`;
        const endTimeStr = `${currentDate}T${endTime}:00`;

      await axiosInstance.put(`/interview-schedules/${editingInterview.id}`, null, {
        params: {
          startTime: startTimeStr,
          endTime: endTimeStr
        }
      });

      message.success('Cập nhật lịch phỏng vấn thành công!');
      setShowEditModal(false);
      editForm.resetFields();
      onDataRefresh();
    } catch (err) {
      console.error('Error updating interview:', err);
      if (err.response && err.response.data && err.response.data.message) {
        message.error(err.response.data.message);
      } else {
        message.error('Không thể cập nhật lịch phỏng vấn!');
      }
    }
  };

  // Xử lý xóa lịch
      const handleDeleteInterview = async () => {
      try {
        // Kiểm tra trạng thái lịch trước khi xóa
        if (editingInterview.status === 'COMPLETED' || 
            editingInterview.status === 'ACCEPTED') {
          message.warning('Không thể xóa lịch phỏng vấn đã hoàn thành/đã chấp nhận!');
          return;
        }
        
        await axiosInstance.delete(`/interview-schedules/${editingInterview.id}`);
        message.success('Xóa lịch phỏng vấn thành công!');
      setShowEditModal(false);
      onDataRefresh();
    } catch (err) {
      console.error('Error deleting interview:', err);
      message.error('Không thể xóa lịch phỏng vấn!');
    }
  };

  // Lọc ứng viên đã được duyệt và chưa có lịch phỏng vấn
  const filteredApplications = approvedApplications.filter(app => {
    // Chỉ hiển thị ứng viên chưa có lịch phỏng vấn và không bị từ chối
    const existingInterview = interviews.find(i => i.applicationId === app.id);
    const isRejected = app.status === 'REJECTED';
    
    return !existingInterview && !isRejected; // Chỉ hiển thị ứng viên chưa có lịch và không bị từ chối
  });

  // Custom button handlers
  const handleToday = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().today();
    }
  };

  const handlePrev = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().prev();
    }
  };

  const handleNext = () => {
    if (calendarRef.current) {
      calendarRef.current.getApi().next();
    }
  };

  const handleViewChange = (viewType) => {
    if (calendarRef.current) {
      calendarRef.current.getApi().changeView(viewType);
    }
  };

  return (
    <div className="interview-calendar">
      <Card>
        <Row gutter={[16, 16]} className="mb-4">
          <Col span={24}>
            <Title level={4}>Quản lý lịch phỏng vấn</Title>
          </Col>
        </Row>

        {/* Custom Toolbar - Chỉ giữ nút điều hướng */}
        <div className="calendar-toolbar mb-4">
          <Space>
            <Button onClick={handleToday}>Hôm nay</Button>
            <Button onClick={handlePrev}>‹</Button>
            <Button onClick={handleNext}>›</Button>
          </Space>
        </div>

        <div style={{ height: 'auto', minHeight: '600px' }}>
                     <FullCalendar
             ref={calendarRef}
             plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
             headerToolbar={false}
             initialView="timeGridWeek"
             views={{
               timeGridWeek: {
                 buttonText: 'Tuần',
                 titleFormat: { year: 'numeric', month: 'long' },
                 columnHeaderFormat: { 
                   weekday: 'long',
                   day: 'numeric'
                 }
               }
             }}
             editable={true}
             selectable={true}
             selectMirror={true}
             dayMaxEvents={true}
             weekends={true}
             events={events}
             select={handleDateSelect}
             eventClick={handleEventClick}
             eventDrop={handleEventDrop}
             eventResize={handleEventResize}
             slotMinTime="00:00:00"
             slotMaxTime="23:59:59"
             slotDuration="01:00:00"
             allDaySlot={false}
             locale="vi"
             firstDay={1} // Thứ 2
             slotLabelFormat={{
               hour: '2-digit',
               minute: '2-digit',
               hour12: false
             }}
             dayHeaderFormat={{
               weekday: 'long',
               day: 'numeric'
             }}
             titleFormat={{
               year: 'numeric',
               month: 'long'
             }}
             droppable={true}
             eventDurationEditable={true}
             eventStartEditable={true}
             // Đã xóa eventConstraint để cho phép kéo thả lịch 24/7
             scrollTime="00:00:00"
             expandRows={true}
             height="auto"
             slotLaneClassNames="time-slot"
             slotLabelClassNames="time-label"
             // Cấu hình để hiển thị đúng cột thời gian
             slotLabelPlacement="start"
             // Đảm bảo responsive
             aspectRatio={1.35}
           />
        </div>


      </Card>

      {/* Modal lên lịch mới */}
      <Modal
        title="Lên lịch phỏng vấn"
        open={showScheduleModal}
        onCancel={() => {
          setShowScheduleModal(false);
          scheduleForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form layout="vertical" form={scheduleForm} onFinish={handleScheduleSubmit}>
          <Form.Item label="Thời gian đã chọn">
            <Text>
              {selectedSlot && `${dayjs(selectedSlot.start).format('DD/MM/YYYY HH:mm')} - ${dayjs(selectedSlot.end).format('HH:mm')}`}
            </Text>
          </Form.Item>
          
          <Form.Item
            name="applicationId"
            label="Chọn ứng viên"
            rules={[{ required: true, message: 'Vui lòng chọn ứng viên!' }]}
          >
            <Select placeholder="Chọn ứng viên để lên lịch">
              {filteredApplications.map(app => (
                <Option key={app.id} value={app.id}>
                  {app.fullName} - {app.jobTitle}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<PlusOutlined />}>
                Lên lịch
              </Button>
              <Button onClick={() => {
                setShowScheduleModal(false);
                scheduleForm.resetFields();
              }}>
                Hủy
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal chỉnh sửa/xóa lịch */}
      <Modal
        title="Chỉnh sửa lịch phỏng vấn"
        open={showEditModal}
        onCancel={() => {
          setShowEditModal(false);
          editForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        {editingInterview && (
          <Form layout="vertical" form={editForm} onFinish={handleEditSubmit}>
            <Form.Item label="Ứng viên">
              <Text>{editingInterview.applicantName}</Text>
            </Form.Item>
            
            <Form.Item label="Vị trí">
              <Text>{editingInterview.jobTitle}</Text>
            </Form.Item>
            
            <Form.Item label="Trạng thái">
              <Text type={editingInterview.status === 'COMPLETED' || editingInterview.status === 'ACCEPTED' ? 'danger' : 'default'}>
                {editingInterview.status === 'COMPLETED' 
                  ? 'Hoàn thành - Không thể chỉnh sửa' 
                  : editingInterview.status === 'ACCEPTED'
                    ? 'Đã chấp nhận - Không thể chỉnh sửa'
                    : editingInterview.status === 'SCHEDULED' 
                      ? 'Đã lên lịch' 
                      : editingInterview.status === 'PENDING' 
                        ? 'Chờ phỏng vấn' 
                        : editingInterview.status || 'Không xác định'}
              </Text>
            </Form.Item>

            <Form.Item
              name="startTime"
              label="Giờ bắt đầu"
              rules={[{ required: true, message: 'Vui lòng chọn giờ bắt đầu!' }]}
              initialValue={editingInterview.startTime ? dayjs(editingInterview.startTime).format('HH:00') : ''}
            >
              <input
                type="time"
                step="3600"
                className="ant-input"
                style={{ width: '100%', padding: '4px 11px' }}
                disabled={editingInterview.status === 'COMPLETED' || editingInterview.status === 'ACCEPTED'}
              />
            </Form.Item>

            <Form.Item
              name="endTime"
              label="Giờ kết thúc"
              rules={[{ required: true, message: 'Vui lòng chọn giờ kết thúc!' }]}
              initialValue={editingInterview.endTime ? dayjs(editingInterview.endTime).format('HH:00') : ''}
            >
              <input
                type="time"
                step="3600"
                className="ant-input"
                style={{ width: '100%', padding: '4px 11px' }}
                disabled={editingInterview.status === 'COMPLETED' || editingInterview.status === 'ACCEPTED'}
              />
            </Form.Item>

            <Form.Item>
              <Space>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<EditOutlined />}
                  disabled={editingInterview.status === 'COMPLETED' || editingInterview.status === 'ACCEPTED'}
                >
                  Cập nhật
                </Button>
                <Popconfirm
                  title="Bạn có chắc chắn muốn xóa lịch phỏng vấn này?"
                  onConfirm={handleDeleteInterview}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button 
                    danger 
                    icon={<DeleteOutlined />}
                    disabled={editingInterview.status === 'COMPLETED' || editingInterview.status === 'ACCEPTED'}
                  >
                    Xóa
                  </Button>
                </Popconfirm>
                <Button onClick={() => {
                  setShowEditModal(false);
                  editForm.resetFields();
                }}>
                  Hủy
                </Button>
              </Space>
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
};

export default InterviewCalendar;
