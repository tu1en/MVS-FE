import { Button, Card, Form, Input, message, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { managerService } from '../../services/managerService';
import { validateEmail, validatePhoneNumber } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';

const EditProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [invalidPrefix, setInvalidPrefix] = useState(false);
  const { user, login } = useAuth();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await managerService.getProfile();
      // Normalize in case backend returns username instead of managerId
      const normalized = { ...data, managerId: data?.managerId || data?.username };
      // Map birthDate (YYYY-MM-DD) to dayjs for DatePicker
      if (normalized.birthDate) {
        try {
          const d = dayjs(normalized.birthDate);
          if (d.isValid()) normalized.birthDate = d;
        } catch (_) {}
      }
      form.setFieldsValue(normalized);

      // Sync to AuthContext so Header shows full name instead of username
      if (typeof login === 'function') {
        login({
          ...(user || {}),
          fullName: normalized.fullName || normalized.name || user?.fullName,
          email: normalized.email || user?.email,
          username: normalized.managerId || normalized.username || user?.username
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Không thể tải thông tin cá nhân');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        email: values.email,
        phoneNumber: values.phoneNumber,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        birthYear: values.birthDate ? values.birthDate.year() : null
      };
      await managerService.updateProfile(payload);
      
      // Update user context with new fullName to sync with header
      if (user) {
        const updatedUser = {
          ...user,
          fullName: values.fullName,
          email: values.email
        };
        login(updatedUser);
      }
      
      message.success('Cập nhật thông tin thành công');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card title="Chỉnh Sửa Thông Tin Quản Lý" className="max-w-2xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="max-w-xl mx-auto"
        >
          <Form.Item
            name="managerId"
            label="Tên tài khoản"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và Tên"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="birthDate"
            label="Ngày sinh"
            rules={[
              { required: true, message: 'Vui lòng chọn ngày sinh' },
              () => ({
                validator(_, value) {
                  if (!value) return Promise.resolve();
                  if (value.isAfter(dayjs().endOf('day'))) {
                    return Promise.reject(new Error('Không được chọn ngày trong tương lai'));
                  }
                  return Promise.resolve();
                }
              })
            ]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              placeholder="Chọn ngày sinh"
              disabledDate={(d) => d && d.isAfter(dayjs().endOf('day'))}
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, validator: validateEmail }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số Điện Thoại"
            rules={[{ required: true, validator: validatePhoneNumber }]}
            validateStatus={invalidPrefix ? 'error' : ''}
            help={invalidPrefix ? 'Số điện thoại phải bắt đầu bằng 03, 05, 07, 08 hoặc 09' : null}
          >
            <Input
              maxLength={11}
              inputMode="numeric"
              pattern="[0-9]*"
              onChange={(e) => {
                let value = e.target.value.replace(/[^0-9]/g, '');
                if (value.length > 11) value = value.slice(0, 11);
                form.setFieldsValue({ phoneNumber: value });

                if (value.length >= 2 && !/^0(3|5|7|8|9)/.test(value)) {
                  setInvalidPrefix(true);
                } else {
                  setInvalidPrefix(false);
                }
              }}
            />
          </Form.Item>

          {/* Phòng/Ban hidden as per requirement */}
          {null}

          {/* Chức Vụ hidden as per requirement */}
          {null}

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Cập Nhật Thông Tin
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default EditProfile;
