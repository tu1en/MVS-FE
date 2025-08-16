import { App, Button, Card, Form, Input, Select, Spin, DatePicker } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import ProfileDataService from '../../services/profileDataService';
import { validateEmail } from '../../utils/validation';
import dayjs from 'dayjs';

const { Option } = Select;

const EditProfile = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formReady, setFormReady] = useState(false);

  // Initialize form with default values to prevent React warnings
  const defaultValues = {
    username: '',
    fullName: '',
    email: '',
    gender: '',
    birthDate: null,
    parentName: '',
    school: ''
  };

  const fetchProfile = useCallback(async () => {
    try {
      setInitialLoading(true);
      const result = await ProfileDataService.fetchProfileWithFallback('student');
      
      if (result.success) {
        // Map English gender values from backend to Vietnamese for display
        const genderDisplayMapping = {
          'MALE': 'Nam',
          'FEMALE': 'Nữ',
          'OTHER': 'Khác'
        };
        
        const profileData = { 
          ...defaultValues, 
          ...result.data,
          birthDate: result.data.birthDate ? dayjs(result.data.birthDate) : null,
          gender: result.data.gender ? genderDisplayMapping[result.data.gender] || result.data.gender : null
        };
        
        // Set form ready first, then set field values after form is rendered
        setFormReady(true);
        
        // Use setTimeout to ensure form is rendered before setting values
        setTimeout(() => {
          form.setFieldsValue(profileData);
        }, 0);
        
        if (result.source === 'localStorage') {
          message.warning({
            content: 'Đang sử dụng dữ liệu đã lưu (không có kết nối mạng)',
            duration: 4
          });
        }
      } else {
        // If profile fetch fails, still set default values and allow form usage
        const fallbackData = { 
          ...defaultValues, 
          ...result.data,
          birthDate: result.data?.birthDate ? dayjs(result.data.birthDate) : null
        };
        
        // Set form ready first, then set field values after form is rendered
        setFormReady(true);
        
        // Use setTimeout to ensure form is rendered before setting values
        setTimeout(() => {
          form.setFieldsValue(fallbackData);
        }, 0);
        
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
      setInitialLoading(false);
    }
  }, [form, message]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onFinish = async (values) => {
    try {
      setLoading(true);
      
      // Map Vietnamese gender values to English for backend
      const genderMapping = {
        'Nam': 'MALE',
        'Nữ': 'FEMALE', 
        'Khác': 'OTHER'
      };
      
      const profileData = {
        ...values,
        birthDate: values.birthDate ? values.birthDate.format('YYYY-MM-DD') : null,
        gender: values.gender ? genderMapping[values.gender] || values.gender : null
      };

      const result = await ProfileDataService.updateProfileWithFallback(profileData);
      
      if (result.success) {
        message.success(result.message);      } else {
        message.warning(result.message);
      }
    } catch (error) {
      console.error('Error in onFinish:', error);
      message.error('Có lỗi xảy ra khi cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card title="Chỉnh Sửa Thông Tin Cá Nhân" className="max-w-2xl mx-auto" loading={initialLoading}>
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
            label="Tên đăng nhập"
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
            name="gender"
            label="Giới Tính"
            rules={[{ required: true, message: 'Vui lòng chọn giới tính' }]}
          >
            <Select>
              <Option value="Nam">Nam</Option>
              <Option value="Nữ">Nữ</Option>
              <Option value="Khác">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, validator: validateEmail }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="parentName"
            label="Người giám hộ"
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="school"
            label="Trường"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input />
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