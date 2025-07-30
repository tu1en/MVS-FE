import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  TimePicker,
  InputNumber,
  message,
  Row,
  Col,
  Alert
} from 'antd';
import dayjs from 'dayjs';
import hrService from '../../services/hrService';

const { TextArea } = Input;

/**
 * Modal tạo/chỉnh sửa ca làm việc
 */
const CreateShiftModal = ({ visible, onCancel, onSuccess, editingShift }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [nameChecking, setNameChecking] = useState(false);
  const [nameAvailable, setNameAvailable] = useState(true);
  const [workingHours, setWorkingHours] = useState(0);

  const isEditing = !!editingShift;

  // Reset form when modal opens/closes
  useEffect(() => {
    if (visible) {
      if (editingShift) {
        // Populate form with editing data
        form.setFieldsValue({
          name: editingShift.name,
          startTime: dayjs(editingShift.startTime, 'HH:mm'),
          endTime: dayjs(editingShift.endTime, 'HH:mm'),
          breakHours: editingShift.breakHours || 0,
          description: editingShift.description
        });
        calculateWorkingHours(
          dayjs(editingShift.startTime, 'HH:mm'),
          dayjs(editingShift.endTime, 'HH:mm'),
          editingShift.breakHours || 0
        );
      } else {
        form.resetFields();
        setWorkingHours(0);
      }
      setNameAvailable(true);
    }
  }, [visible, editingShift, form]);

  // Calculate working hours
  const calculateWorkingHours = (startTime, endTime, breakHours = 0) => {
    if (startTime && endTime) {
      const start = startTime.hour() + startTime.minute() / 60;
      const end = endTime.hour() + endTime.minute() / 60;
      
      if (end > start) {
        const totalHours = end - start - (breakHours || 0);
        setWorkingHours(Math.max(0, totalHours));
      } else {
        setWorkingHours(0);
      }
    } else {
      setWorkingHours(0);
    }
  };

  // Handle form values change
  const handleValuesChange = (changedValues, allValues) => {
    if (changedValues.startTime || changedValues.endTime || changedValues.breakHours !== undefined) {
      calculateWorkingHours(allValues.startTime, allValues.endTime, allValues.breakHours);
    }
  };

  // Check shift name availability
  const checkShiftName = async (name) => {
    if (!name || name.trim().length < 3) {
      setNameAvailable(true);
      return;
    }

    setNameChecking(true);
    try {
      const response = await hrService.checkShiftName(
        name.trim(),
        isEditing ? editingShift.id : null
      );
      
      if (response.success) {
        setNameAvailable(response.available);
      }
    } catch (error) {
      console.error('Error checking shift name:', error);
    } finally {
      setNameChecking(false);
    }
  };

  // Handle name input change with debounce
  const handleNameChange = (e) => {
    const name = e.target.value;
    
    // Clear previous timeout
    if (window.nameCheckTimeout) {
      clearTimeout(window.nameCheckTimeout);
    }
    
    // Set new timeout
    window.nameCheckTimeout = setTimeout(() => {
      checkShiftName(name);
    }, 500);
  };

  // Handle form submit
  const handleSubmit = async (values) => {
    setLoading(true);
    
    try {
      const shiftData = {
        name: values.name.trim(),
        startTime: values.startTime.format('HH:mm'),
        endTime: values.endTime.format('HH:mm'),
        breakHours: values.breakHours || 0,
        description: values.description?.trim() || null
      };

      let response;
      if (isEditing) {
        response = await hrService.updateShift(editingShift.id, shiftData);
      } else {
        response = await hrService.createShift(shiftData);
      }

      if (response.success) {
        message.success(response.message);
        form.resetFields();
        onSuccess();
      } else {
        message.error(response.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      console.error('Error saving shift:', error);
      message.error('Có lỗi xảy ra khi lưu ca làm việc');
    } finally {
      setLoading(false);
    }
  };

  // Validation rules
  const validateTimeRange = (_, value) => {
    const startTime = form.getFieldValue('startTime');
    const endTime = form.getFieldValue('endTime');
    
    if (startTime && endTime && !endTime.isAfter(startTime)) {
      return Promise.reject(new Error('Giờ kết thúc phải sau giờ bắt đầu'));
    }
    
    return Promise.resolve();
  };

  return (
    <Modal
      title={isEditing ? 'Chỉnh sửa Ca làm việc' : 'Tạo Ca làm việc mới'}
      open={visible}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        onValuesChange={handleValuesChange}
      >
        <Form.Item
          name="name"
          label="Tên ca làm việc"
          rules={[
            { required: true, message: 'Vui lòng nhập tên ca làm việc' },
            { min: 3, message: 'Tên ca làm việc phải có ít nhất 3 ký tự' },
            { max: 100, message: 'Tên ca làm việc không được vượt quá 100 ký tự' }
          ]}
          validateStatus={nameChecking ? 'validating' : (!nameAvailable ? 'error' : '')}
          help={!nameAvailable ? 'Tên ca làm việc đã tồn tại' : ''}
        >
          <Input
            placeholder="Nhập tên ca làm việc (ví dụ: Ca sáng, Ca chiều...)"
            onChange={handleNameChange}
          />
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="startTime"
              label="Giờ bắt đầu"
              rules={[
                { required: true, message: 'Vui lòng chọn giờ bắt đầu' },
                { validator: validateTimeRange }
              ]}
            >
              <TimePicker
                format="HH:mm"
                placeholder="Chọn giờ bắt đầu"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="endTime"
              label="Giờ kết thúc"
              rules={[
                { required: true, message: 'Vui lòng chọn giờ kết thúc' },
                { validator: validateTimeRange }
              ]}
            >
              <TimePicker
                format="HH:mm"
                placeholder="Chọn giờ kết thúc"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          name="breakHours"
          label="Thời gian nghỉ (giờ)"
          rules={[
            { type: 'number', min: 0, message: 'Thời gian nghỉ không được âm' },
            { type: 'number', max: 8, message: 'Thời gian nghỉ không được vượt quá 8 giờ' }
          ]}
        >
          <InputNumber
            min={0}
            max={8}
            step={0.5}
            placeholder="0"
            style={{ width: '100%' }}
            addonAfter="giờ"
          />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả (tùy chọn)"
          rules={[
            { max: 500, message: 'Mô tả không được vượt quá 500 ký tự' }
          ]}
        >
          <TextArea
            rows={3}
            placeholder="Nhập mô tả cho ca làm việc..."
            showCount
            maxLength={500}
          />
        </Form.Item>

        {workingHours > 0 && (
          <Alert
            message={`Tổng giờ làm việc: ${workingHours.toFixed(1)} giờ`}
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}
      </Form>
    </Modal>
  );
};

export default CreateShiftModal;
