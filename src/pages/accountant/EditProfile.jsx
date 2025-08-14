import { Button, Card, Form, Input, message, DatePicker } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import accountantService from '../../services/accountantService';
import { validateEmail, validatePhoneNumber } from '../../utils/validation';

const EditProfile = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [invalidPrefix, setInvalidPrefix] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const data = await accountantService.getProfile();
      // Normalize in case backend returns username instead of accountantId
      const normalized = { ...data, accountantId: data?.accountantId || data?.username };
      // Map birthDate (YYYY-MM-DD) to dayjs for DatePicker
      if (normalized.birthDate) {
        try {
          const d = dayjs(normalized.birthDate);
          if (d.isValid()) normalized.birthDate = d;
        } catch (_) {}
      }
      form.setFieldsValue(normalized);
    } catch (error) {
      console.error('Error fetching profile:', error);
      message.error('Không thể tải thông tin cá nhân');
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phoneNumber: values.phoneNumber,
        department: values.department,
        position: values.position,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        birthYear: values.birthDate ? values.birthDate.year() : null
      };
      await accountantService.updateProfile(payload);
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
      <Card title="Chỉnh Sửa Thông Tin Kế Toán" className="max-w-2xl mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          className="max-w-xl mx-auto"
        >
          <Form.Item
            name="accountantId"
            label="Tên tài khoản"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
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

          <Form.Item
            name="department"
            label="Phòng/Ban"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="position"
            label="Chức Vụ"
            rules={[{ required: true, message: 'Vui lòng nhập chức vụ' }]}
          >
            <Input />
          </Form.Item>

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
