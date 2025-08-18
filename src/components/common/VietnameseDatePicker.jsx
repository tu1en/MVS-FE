import { DatePicker } from 'antd';
import locale from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import React from 'react';

// Cấu hình dayjs với locale tiếng Việt
dayjs.locale('vi');

const VietnameseDatePicker = ({ 
  format = "DD/MM/YYYY", 
  placeholder = "Chọn ngày", 
  disabledDate,
  showTime = false,
  ...props 
}) => {
  return (
    <DatePicker
      format={format}
      placeholder={placeholder}
      locale={locale}
      showTime={showTime}
      disabledDate={disabledDate}
      {...props}
    />
  );
};

// Export các loại DatePicker khác nhau
export const VietnameseRangePicker = DatePicker.RangePicker;
export const VietnameseMonthPicker = DatePicker.MonthPicker;
export const VietnameseWeekPicker = DatePicker.WeekPicker;
export const VietnameseQuarterPicker = DatePicker.QuarterPicker;
export const VietnameseYearPicker = DatePicker.YearPicker;

export default VietnameseDatePicker;
