import { EnvironmentOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, DatePicker, Form, Input, InputNumber, message, Select, Spin, Switch, TimePicker } from 'antd';
import React, { useEffect, useState } from 'react';

const { Option } = Select;

const CreateAttendanceSession = ({ onSubmit, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [classrooms, setClassrooms] = useState([]);
  const [enableLocationCheck, setEnableLocationCheck] = useState(true);

  // Fetch classrooms for teacher
  useEffect(() => {
    const fetchClassrooms = async () => {
      setLoading(true);
      try {
        // Simulate API call
        setTimeout(() => {
          // Mock data
          const mockClassrooms = [
            { id: 'class001', name: 'KTPM1', course: 'Kỹ thuật phần mềm', numberOfStudents: 35 },
            { id: 'class002', name: 'CNTT2', course: 'Công nghệ thông tin', numberOfStudents: 42 },
            { id: 'class003', name: 'QTKD3', course: 'Quản trị kinh doanh', numberOfStudents: 50 },
          ];
          setClassrooms(mockClassrooms);
          setLoading(false);
        }, 600);
      } catch (error) {
        message.error('Lỗi khi tải danh sách lớp học');
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Format values
      const formattedValues = {
        ...values,
        date: values.date.format('YYYY-MM-DD'),
        startTime: values.timeRange[0].format('HH:mm'),
        endTime: values.timeRange[1].format('HH:mm'),
        classroom: classrooms.find(c => c.id === values.classroomId),
      };

      delete formattedValues.timeRange;

      // Simulate API call
      setTimeout(() => {
        console.log('Creating attendance session with:', formattedValues);
        message.success('Phiên điểm danh được tạo thành công!');
        setLoading(false);
        if (onSubmit) onSubmit(formattedValues);
        form.resetFields();
      }, 800);
    } catch (error) {
      message.error('Không thể tạo phiên điểm danh');
      setLoading(false);
    }
  };

  const handleLocationToggle = (checked) => {
    setEnableLocationCheck(checked);
    // Reset location fields when toggled off
    if (!checked) {
      form.setFieldsValue({
        locationLat: undefined,
        locationLong: undefined,
        locationRadius: 200
      });
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) onCancel();
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error('Trình duyệt của bạn không hỗ trợ định vị vị trí');
      return;
    }

    message.loading('Đang xác định vị trí...', 0);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        message.destroy();
        form.setFieldsValue({
          locationLat: position.coords.latitude.toFixed(6),
          locationLong: position.coords.longitude.toFixed(6)
        });
        message.success('Đã lấy vị trí hiện tại thành công');
      },
      (error) => {
        message.destroy();
        message.error('Không thể xác định vị trí: ' + error.message);
      },
      { enableHighAccuracy: true }
    );
  };

  return (
    <Card title="Tạo phiên điểm danh mới" className="shadow-md">
      <Spin spinning={loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            locationRadius: 200,
            requiredRate: 100
          }}
        >
          <Form.Item
            name="name"
            label="Tên phiên điểm danh"
            rules={[{ required: true, message: 'Vui lòng nhập tên phiên điểm danh' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Nhập tên phiên điểm danh" />
          </Form.Item>

          <Form.Item
            name="classroomId"
            label="Lớp học"
            rules={[{ required: true, message: 'Vui lòng chọn lớp học' }]}
          >
            <Select placeholder="Chọn lớp học" loading={loading}>
              {classrooms.map(classroom => (
                <Option key={classroom.id} value={classroom.id}>
                  {classroom.name} - {classroom.course} ({classroom.numberOfStudents} sinh viên)
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày"
            rules={[{ required: true, message: 'Vui lòng chọn ngày' }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày"
            />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="Thời gian"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian bắt đầu và kết thúc' }]}
          >
            <TimePicker.RangePicker
              style={{ width: '100%' }}
              format="HH:mm"
              minuteStep={5}
              placeholder={['Thời gian bắt đầu', 'Thời gian kết thúc']}
            />
          </Form.Item>

          <Form.Item
            name="enableLocationCheck"
            label="Kiểm tra vị trí"
            valuePropName="checked"
          >
            <Switch
              checked={enableLocationCheck}
              onChange={handleLocationToggle}
            />
          </Form.Item>

          {enableLocationCheck && (
            <>
              <div className="flex flex-wrap gap-4 mb-4">
                <Form.Item
                  name="locationLat"
                  label="Vĩ độ"
                  className="flex-1"
                  rules={[{ required: enableLocationCheck, message: 'Vui lòng nhập vĩ độ' }]}
                >
                  <Input
                    prefix={<EnvironmentOutlined />}
                    placeholder="Vĩ độ (Latitude)"
                  />
                </Form.Item>

                <Form.Item
                  name="locationLong"
                  label="Kinh độ"
                  className="flex-1"
                  rules={[{ required: enableLocationCheck, message: 'Vui lòng nhập kinh độ' }]}
                >
                  <Input
                    prefix={<EnvironmentOutlined />}
                    placeholder="Kinh độ (Longitude)"
                  />
                </Form.Item>
              </div>

              <div className="flex justify-between mb-4">
                <Button type="dashed" onClick={getCurrentLocation} icon={<EnvironmentOutlined />}>
                  Sử dụng vị trí hiện tại
                </Button>

                <Form.Item
                  name="locationRadius"
                  label="Bán kính (m)"
                  className="mb-0"
                  rules={[{ required: enableLocationCheck, message: 'Vui lòng nhập bán kính' }]}
                >
                  <InputNumber
                    min={10}
                    max={1000}
                    step={10}
                    style={{ width: 150 }}
                  />
                </Form.Item>
              </div>
            </>
          )}

          <Form.Item
            name="requiredRate"
            label="Tỷ lệ tham gia tối thiểu (%)"
          >
            <InputNumber
              min={0}
              max={100}
              step={5}
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            name="description"
            label="Ghi chú"
          >
            <Input.TextArea
              placeholder="Nhập ghi chú cho phiên điểm danh (không bắt buộc)"
              rows={3}
            />
          </Form.Item>

          <div className="flex justify-end space-x-4">
            <Button onClick={handleCancel}>
              Hủy bỏ
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Tạo phiên điểm danh
            </Button>
          </div>
        </Form>
      </Spin>
    </Card>
  );
};

export default CreateAttendanceSession; 