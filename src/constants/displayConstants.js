/**
 * Display Constants for Course Information
 * Centralized fallback text and display values to ensure consistency across all views
 */

// Fallback text constants
export const FALLBACK_TEXT = {
  // Instructor/Teacher related
  INSTRUCTOR_NOT_ASSIGNED: 'Chưa có giảng viên',
  INSTRUCTOR_UPDATING: 'Đang cập nhật',
  
  // Duration related
  DURATION_NOT_DETERMINED: 'Chưa xác định',
  DURATION_PLACEHOLDER: '—',
  
  // General course information
  COURSE_NAME: 'Khóa học',
  COURSE_DESCRIPTION: 'Đang cập nhật',
  COURSE_SUBJECT: 'Chưa phân loại',
  COURSE_LEVEL: 'Cơ bản',
  
  // Status and availability
  STATUS_UPDATING: 'Đang cập nhật',
  STATUS_NOT_AVAILABLE: 'Không có sẵn',
  STATUS_PENDING: 'Đang xử lý',
  
  // Numbers and counts
  COUNT_ZERO: 0,
  RATING_DEFAULT: 4.5,
  
  // Dates and time
  DATE_NOT_SET: 'Chưa xác định',
  TIME_NOT_SET: 'Chưa xác định'
};

// Standardized fallback text for course fields
export const COURSE_FALLBACKS = {
  // Use consistent instructor fallback across all views
  instructor: FALLBACK_TEXT.INSTRUCTOR_UPDATING,
  teacherName: FALLBACK_TEXT.INSTRUCTOR_UPDATING,
  instructorName: FALLBACK_TEXT.INSTRUCTOR_UPDATING,

  // Use consistent duration fallback across all views
  duration: FALLBACK_TEXT.INSTRUCTOR_UPDATING,
  totalWeeks: FALLBACK_TEXT.INSTRUCTOR_UPDATING,
  
  // Other course fields
  name: FALLBACK_TEXT.COURSE_NAME,
  className: FALLBACK_TEXT.COURSE_NAME,
  description: FALLBACK_TEXT.COURSE_DESCRIPTION,
  subject: FALLBACK_TEXT.COURSE_SUBJECT,
  level: FALLBACK_TEXT.COURSE_LEVEL
};

// Data field mapping for consistent access
export const COURSE_FIELD_MAPPING = {
  // Instructor field variations
  instructor: ['instructorName', 'teacherName', 'instructor', 'teacher'],
  
  // Duration field variations
  duration: ['totalWeeks', 'duration', 'weeks'],
  
  // Name field variations
  name: ['name', 'className', 'courseTemplateName', 'title'],
  
  // Description field variations
  description: ['description', 'courseTemplateDescription', 'templateDescription', 'overview'],
  
  // Subject field variations
  subject: ['subject', 'subjectName', 'courseTemplateName'],
  
  // Student count variations
  currentStudents: ['currentStudents', 'currentEnrollment', 'enrolled', 'students'],
  maxStudents: ['maxStudents', 'maxStudentsPerTemplate', 'capacity', 'max_students'],
  
  // Fee variations
  fee: ['tuitionFee', 'enrollmentFee', 'enrollment_fee', 'fee', 'price']
};

/**
 * Utility function to get field value with fallback
 * @param {Object} data - The data object
 * @param {string} fieldType - The field type from COURSE_FIELD_MAPPING
 * @param {string} fallback - Custom fallback text (optional)
 * @returns {any} The field value or fallback
 */
export const getFieldWithFallback = (data, fieldType, fallback = null) => {
  if (!data || typeof data !== 'object') {
    return fallback || COURSE_FALLBACKS[fieldType] || FALLBACK_TEXT.STATUS_NOT_AVAILABLE;
  }
  
  const fieldVariations = COURSE_FIELD_MAPPING[fieldType] || [fieldType];
  
  for (const field of fieldVariations) {
    const value = data[field];
    if (value !== null && value !== undefined && value !== '') {
      return value;
    }
  }
  
  return fallback || COURSE_FALLBACKS[fieldType] || FALLBACK_TEXT.STATUS_NOT_AVAILABLE;
};

/**
 * Utility function to format duration consistently
 * @param {Object} data - The data object
 * @returns {string} Formatted duration string
 */
export const formatDuration = (data) => {
  // For Class data, try to use date range first
  if (data.startDate && data.endDate) {
    try {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const startStr = start.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const endStr = end.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        return `${startStr} — ${endStr}`;
      }
    } catch (error) {
      // Fall through to weeks format
    }
  }

  // For Course Template data, use weeks
  const weeks = getFieldWithFallback(data, 'duration');

  if (weeks === COURSE_FALLBACKS.duration) {
    return weeks; // Return fallback text as-is
  }

  const numWeeks = Number(weeks);
  if (Number.isFinite(numWeeks) && numWeeks > 0) {
    return `${numWeeks} tuần`;
  }

  return COURSE_FALLBACKS.duration;
};

/**
 * Utility function to get instructor name consistently
 * @param {Object} data - The data object
 * @returns {string} Instructor name or fallback
 */
export const getInstructorName = (data) => {
  return getFieldWithFallback(data, 'instructor');
};

/**
 * Utility function to normalize course data structure
 * @param {Object} rawData - Raw course data from API
 * @returns {Object} Normalized course data
 */
export const normalizeCourseData = (rawData) => {
  if (!rawData || typeof rawData !== 'object') {
    return {};
  }
  
  return {
    id: rawData.id,
    name: getFieldWithFallback(rawData, 'name'),
    className: getFieldWithFallback(rawData, 'name'),
    description: getFieldWithFallback(rawData, 'description'),
    subject: getFieldWithFallback(rawData, 'subject'),
    instructor: getInstructorName(rawData),
    teacherName: getInstructorName(rawData),
    instructorName: getInstructorName(rawData),
    duration: formatDuration(rawData),
    totalWeeks: rawData.totalWeeks,
    currentStudents: getFieldWithFallback(rawData, 'currentStudents', 0),
    maxStudents: getFieldWithFallback(rawData, 'maxStudents', 0),
    enrollmentFee: getFieldWithFallback(rawData, 'fee', 0),
    level: getFieldWithFallback(rawData, 'level'),
    rating: rawData.rating || FALLBACK_TEXT.RATING_DEFAULT,
    isPublic: rawData.isPublic || false,
    status: rawData.status,
    startDate: rawData.startDate,
    endDate: rawData.endDate,
    createdAt: rawData.createdAt
  };
};
