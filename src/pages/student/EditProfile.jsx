import { App, Button, Card, Form, Input, Select, Spin } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import ProfileDataService from '../../services/profileDataService';
import { validateEmail, validatePhoneNumber } from '../../utils/validation';

const { Option } = Select;

const EditProfile = () => {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [invalidPrefix, setInvalidPrefix] = useState(false);
  const [formReady, setFormReady] = useState(false);

  // Initialize form with default values to prevent React warnings
  const defaultValues = {
    fullName: '',
    email: '',
    phoneNumber: '',
    studentId: localStorage.getItem('userId') || '',
    gender: '',
    address: '',
    school: 'Trường Đại học ABC',
    class: 'Lớp 12A1'
  };  const fetchProfile = useCallback(async () => {
    try {
      setInitialLoading(true);
      const result = await ProfileDataService.fetchProfileWithFallback('student');
      
      if (result.success) {
        const profileData = { 
          ...defaultValues, 
          ...result.data,
          class: result.data.className || result.data.class // map className to class for form
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
        } else {
          message.success({
            content: 'Đã tải thông tin từ server thành công',
            duration: 2
          });
        }
      } else {
        // If profile fetch fails, still set default values and allow form usage
        const fallbackData = { 
          ...defaultValues, 
          ...result.data,
          class: result.data?.className || result.data?.class || defaultValues.class
        };
        
        // Set form ready first, then set field values after form is rendered
        setFormReady(true);
        
        // Use setTimeout to ensure form is rendered before setting values
        setTimeout(() => {
          form.setFieldsValue(fallbackData);
        }, 0);
        
        message.warning({
          content: 'Không thể tải từ server, đang sử dụng dữ liệu cục bộ',
          duration: 4
        });
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
    setLoading(true);
    try {
      const profileData = {
        ...values,
        className: values.class // map class back to className for API
      };
      delete profileData.class;

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
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="phoneNumber"
            label="Số điện thoại"
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
            name="studentId"
            label="Mã Số Sinh Viên"
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, validator: validateEmail }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item name="address" label="Địa Chỉ">
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="school"
            label="Trường"
            rules={[{ required: true, message: 'Vui lòng nhập tên trường' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="class"
            label="Lớp"
            rules={[{ required: true, message: 'Vui lòng nhập tên lớp' }]}
          >
            <Input />
          </Form.Item>          <Form.Item>
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