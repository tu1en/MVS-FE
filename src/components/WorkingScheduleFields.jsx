import React from 'react';
import { Form, Select, Input } from 'antd';

const { TextArea } = Input;

const WorkingScheduleFields = ({ required = true }) => {
  return (
    <>
      {/* Working Schedule Fields */}
      <Form.Item 
        name="workShifts" 
        label="Ca làm việc" 
        rules={required ? [{ required: true, message: 'Vui lòng chọn ca làm việc!' }] : []}
      >
        <Select 
          mode="multiple" 
          placeholder="Chọn ca làm việc"
          options={[
            { value: 'morning', label: 'Ca sáng (7:00 - 11:00)' },
            { value: 'afternoon', label: 'Ca chiều (13:00 - 17:00)' },
            { value: 'evening', label: 'Ca tối (18:00 - 21:00)' }
          ]}
        />
      </Form.Item>

      <Form.Item 
        name="workDays" 
        label="Ngày trong tuần" 
        rules={required ? [{ required: true, message: 'Vui lòng chọn ngày làm việc!' }] : []}
      >
        <Select 
          mode="multiple" 
          placeholder="Chọn ngày trong tuần"
          options={[
            { value: 'monday', label: 'Thứ 2' },
            { value: 'tuesday', label: 'Thứ 3' },
            { value: 'wednesday', label: 'Thứ 4' },
            { value: 'thursday', label: 'Thứ 5' },
            { value: 'friday', label: 'Thứ 6' },
            { value: 'saturday', label: 'Thứ 7' },
            { value: 'sunday', label: 'Chủ nhật' }
          ]}
        />
      </Form.Item>

      <Form.Item name="workSchedule" label="Thời gian làm việc chi tiết">
        <TextArea 
          rows={3} 
          placeholder="Mô tả chi tiết thời gian làm việc (ví dụ: Thứ 2, 4, 6 - Ca sáng và chiều)"
        />
      </Form.Item>
    </>
  );
};

export default WorkingScheduleFields;
