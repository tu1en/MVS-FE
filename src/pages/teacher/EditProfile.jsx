import { Button, Card, Form, Input, DatePicker, Select, App, Spin } from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState, useCallback } from 'react';
import ProfileDataService from '../../services/profileDataService';
import { validateEmail, validatePhoneNumber } from '../../utils/validation';
import { useAuth } from '../../context/AuthContext';

const { Option } = Select;

const EditProfile = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [invalidPrefix, setInvalidPrefix] = useState(false);
  const [formReady, setFormReady] = useState(false);
  const { user: authUser, login } = useAuth();

  // Initialize form with default values to prevent React warnings
  const defaultValues = {
    username: '',
    fullName: '',
    birthDate: null,
    gender: '',
    email: '',
    phoneNumber: '',
    department: ''
  };

  const fetchProfile = useCallback(async (isInitial = false) => {

    try {
      if (isInitial) setInitialLoading(true);
      const result = await ProfileDataService.fetchProfileWithFallback('teacher');
      
      if (result.success) {
        const serverData = result.data || {};
        const profileData = { ...defaultValues, ...serverData };
        // Ensure fullName is populated even if backend returns 'name' or 'full_name'
        if (!profileData.fullName) {
          profileData.fullName = serverData.fullName || serverData.name || serverData.full_name || '';
        }
        // Map birthDate (YYYY-MM-DD) to dayjs for DatePicker
        if (serverData.birthDate) {
          try {
            const d = dayjs(serverData.birthDate);
            if (d.isValid()) profileData.birthDate = d;
          } catch (_) {}
        }
        
        // Set form ready first, then set field values after form is rendered
        setFormReady(true);
        
        // Use setTimeout to ensure form is rendered before setting values
        setTimeout(() => {
          form.setFieldsValue(profileData);
        }, 0);

        // Sync fullName and other display fields to AuthContext so Header shows full name
        if (authUser && typeof login === 'function') {
          login({
            ...authUser,
            fullName: profileData.fullName || authUser.fullName,
            email: profileData.email || authUser.email,
            username: profileData.username || authUser.username
          });
        }
        
        if (result.source === 'localStorage') {
          message.warning({
            content: 'Đang sử dụng dữ liệu đã lưu (không có kết nối mạng)',
            duration: 4
          });
        }
      } else {
        // If profile fetch fails, still set default values and allow form usage
        const localData = result.data || {};
        const fallbackData = { ...defaultValues, ...localData };
        
        // Set form ready first, then set field values after form is rendered
        setFormReady(true);
        
        // Use setTimeout to ensure form is rendered before setting values
        setTimeout(() => {
          form.setFieldsValue(fallbackData);
        }, 0);

        // Even on fallback, try to sync name to AuthContext from local data if available
        if (authUser && typeof login === 'function') {
          login({
            ...authUser,
            fullName: fallbackData.fullName || authUser.fullName,
            email: fallbackData.email || authUser.email,
            username: fallbackData.username || authUser.username
          });
        }
        
        // Only show offline message if we actually have localStorage data
        if (result.source === 'localStorage' && result.data && Object.keys(result.data).length > 0) {
          message.warning({
            content: 'Không thể tải từ server, đang sử dụng dữ liệu cục bộ',
            duration: 4
          });
        }
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      // Ensure form is still usable even on error
      setFormReady(true);
      
      // Use setTimeout to ensure form is rendered before setting values
      setTimeout(() => {
        form.setFieldsValue(defaultValues);
      }, 0);
      
      message.error({
        content: 'Lỗi không mong muốn khi tải hồ sơ',
        duration: 4
      });
    } finally {
      if (isInitial) setInitialLoading(false);
    }
  }, [form, message]);

  useEffect(() => {
    fetchProfile(true);
  }, [fetchProfile]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Only send editable fields to backend
      const payload = {
        email: values.email,
        phoneNumber: values.phoneNumber,
        gender: values.gender,
        // Send ISO date (YYYY-MM-DD) if user selected a date
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        // Backward compatibility if backend still expects birthYear
        birthYear: values.birthDate ? values.birthDate.year() : null
      };
      const result = await ProfileDataService.updateProfileWithFallback(payload);
      
      if (result.success) {
        message.success({
          content: result.message || 'Cập nhật thông tin thành công',
          duration: 3
        });
        // Refetch profile data to update form with latest server data
        await fetchProfile();
      } else {
        message.warning({
          content: result.message || 'Không thể cập nhật trên server, đã lưu cục bộ',
          duration: 4
        });
      }
    } catch (error) {
      console.error('Error in onFinish:', error);
      message.error({
        content: 'Có lỗi xảy ra khi cập nhật thông tin',
        duration: 4
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card title="Chỉnh Sửa Thông Tin Giáo Viên" className="max-w-2xl mx-auto" loading={initialLoading}>
        {formReady ? (
          <Form
            form={form}
            layout="vertical"
            onFinish={onFinish}
            className="max-w-xl mx-auto"
            initialValues={defaultValues}
          >
            <Form.Item
              name="username"
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
              name="gender"
              label="Giới Tính"
              rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
            >
              <Select placeholder="Chọn giới tính">
                <Option value="MALE">Nam</Option>
                <Option value="FEMALE">Nữ</Option>
                <Option value="OTHER">Khác</Option>
              </Select>
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
                value={form.getFieldValue('phoneNumber')}
                onChange={(e) => {
                  let onlyNumbers = e.target.value.replace(/[^0-9]/g, '');

                  if (onlyNumbers.length > 11) {
                    onlyNumbers = onlyNumbers.slice(0, 11);
                  }

                  form.setFieldsValue({ phoneNumber: onlyNumbers });

                  if (onlyNumbers.length >= 2 && !/^0(3|5|7|8|9)/.test(onlyNumbers)) {
                    setInvalidPrefix(true);
                  } else {
                    setInvalidPrefix(false);
                  }
                }}
                inputMode="numeric"
                placeholder="Nhập số điện thoại"
              />
            </Form.Item>

            <Form.Item
              name="department"
              label="Khoa/Bộ Môn"
            >
              <Input disabled />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Cập Nhật Thông Tin
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div className="text-center p-4">
            <Spin size="large" />
            <p className="mt-2 text-gray-500">Đang tải thông tin...</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default EditProfile;