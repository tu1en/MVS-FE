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
    teacherId: localStorage.getItem('userId') || '',
    gender: '',
    address: '',
    school: 'Trường Đại học ABC',
    department: 'Khoa Công nghệ thông tin',
    specialization: '',
    experience: ''  };  const fetchProfile = useCallback(async () => {
    try {
      setInitialLoading(true);      const result = await ProfileDataService.fetchProfileWithFallback('teacher');
      
      if (result.success) {
        const profileData = { ...defaultValues, ...result.data };
        
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
        const fallbackData = { ...defaultValues, ...result.data };
        
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
  }, [fetchProfile]);  const onFinish = async (values) => {
    setLoading(true);
    try {
      const result = await ProfileDataService.updateProfileWithFallback(values);
      
      if (result.success) {
        message.success({
          content: result.message || 'Cập nhật thông tin thành công',
          duration: 3
        });
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
  };return (
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
            name="fullName"
            label="Họ và Tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
          >
            <Input />
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
            name="teacherId"
            label="Mã Giáo Viên"
            rules={[{ required: true }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item
            name="department"
            label="Khoa/Bộ Môn"
            rules={[{ required: true, message: 'Vui lòng nhập khoa/bộ môn' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="specialization"
            label="Chuyên Ngành"
            rules={[{ required: true, message: 'Vui lòng nhập chuyên ngành' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="degree"
            label="Học Vị"
            rules={[{ required: true, message: 'Vui lòng chọn học vị' }]}
          >
            <Select>
              <Option value="Thạc sĩ">Thạc sĩ</Option>
              <Option value="Tiến sĩ">Tiến sĩ</Option>
              <Option value="Phó Giáo sư">Phó Giáo sư</Option>
              <Option value="Giáo sư">Giáo sư</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="subject"
            label="Môn Giảng Dạy"
            rules={[{ required: true, message: 'Vui lòng nhập môn giảng dạy' }]}
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