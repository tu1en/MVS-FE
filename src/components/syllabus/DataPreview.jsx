// src/components/syllabus/DataPreview.jsx
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Edit3,
  Eye,
  Hash,
  Save
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { fileValidation } from '../../services/fileValidation';
import { Button } from '../ui/button'; // Fixed case - should match actual file name
import { Card, CardContent, CardHeader } from '../ui/card';
import { Input } from '../ui/input';

const DataPreview = ({ data, onSave, onBack, onEdit, loading }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState(data);
  const [showAllTopics, setShowAllTopics] = useState(false);

  // Validate the parsed data
  const validation = useMemo(() => {
    return fileValidation.validateSyllabusData(editedData);
  }, [editedData]);

  const displayTopics = showAllTopics 
    ? editedData.topics 
    : editedData.topics?.slice(0, 5) || [];

  const handleSave = () => {
    if (validation.isValid) {
      onSave(editedData);
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      setEditedData(data); // Reset changes
    }
    setIsEditing(!isEditing);
  };

  const updateCourseInfo = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateTopic = (index, field, value) => {
    setEditedData(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => 
        i === index ? { ...topic, [field]: value } : topic
      )
    }));
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Eye className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  🔍 Xem lại dữ liệu Import
                </h2>
                <p className="text-sm text-gray-600">
                  Kiểm tra thông tin trước khi lưu template
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant={isEditing ? "secondary" : "outline"}
                onClick={handleEditToggle}
                size="sm"
              >
                <Edit3 className="w-4 h-4 mr-1" />
                {isEditing ? 'Hủy sửa' : 'Chỉnh sửa'}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Course Information */}
      <Card>
        <CardHeader>
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <BookOpen className="w-5 h-5 mr-2 text-blue-600" />
            ✅ Thông tin khóa học
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Môn học
              </label>
              {isEditing ? (
                <Input
                  value={editedData.courseName || ''}
                  onChange={(e) => updateCourseInfo('courseName', e.target.value)}
                  placeholder="Nhập tên môn học"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-900">{editedData.courseName}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Khối lớp
              </label>
              {isEditing ? (
                <Input
                  value={editedData.grade || ''}
                  onChange={(e) => updateCourseInfo('grade', e.target.value)}
                  placeholder="VD: 10, 11, 12"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-900">{editedData.grade}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Năm học
              </label>
              {isEditing ? (
                <Input
                  value={editedData.academicYear || ''}
                  onChange={(e) => updateCourseInfo('academicYear', e.target.value)}
                  placeholder="2023-2024"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-900">{editedData.academicYear}</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tổng tuần
              </label>
              {isEditing ? (
                <Input
                  type="number"
                  value={editedData.totalWeeks || ''}
                  onChange={(e) => updateCourseInfo('totalWeeks', parseInt(e.target.value))}
                  placeholder="26"
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  <p className="font-medium text-gray-900">{editedData.totalWeeks}</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Hash className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">
                {editedData.topics?.length || 0}
              </div>
              <div className="text-sm text-blue-700">Tổng chủ đề</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <Calendar className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">
                {editedData.totalWeeks || 0}
              </div>
              <div className="text-sm text-green-700">Tổng tuần</div>
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">
                {Math.max(...(editedData.topics?.map(t => t.weekNumber) || [0]))}
              </div>
              <div className="text-sm text-purple-700">Tuần cuối</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <BookOpen className="w-6 h-6 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-900">
                {editedData.courseName?.split(' ')[0] || 'N/A'}
              </div>
              <div className="text-sm text-orange-700">Môn học</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Hash className="w-5 h-5 mr-2 text-green-600" />
              📋 Danh sách chủ đề ({editedData.topics?.length || 0})
            </h3>
            {editedData.topics?.length > 5 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllTopics(!showAllTopics)}
              >
                {showAllTopics ? 'Thu gọn' : `Xem tất cả (${editedData.topics.length})`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tuần
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên chủ đề
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {displayTopics.map((topic, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={topic.weekNumber || ''}
                          onChange={(e) => updateTopic(index, 'weekNumber', parseInt(e.target.value))}
                          className="w-20"
                          size="sm"
                        />
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          T{topic.weekNumber}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <Input
                          value={topic.name || ''}
                          onChange={(e) => updateTopic(index, 'name', e.target.value)}
                          placeholder="Nhập tên chủ đề"
                          size="sm"
                        />
                      ) : (
                        <p className="text-sm text-gray-900">{topic.name}</p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        topic.type === 'PRACTICAL' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {topic.type === 'PRACTICAL' ? '🧪 Thực hành' : '📖 Lý thuyết'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!showAllTopics && editedData.topics?.length > 5 && (
              <div className="text-center py-4 border-t">
                <p className="text-sm text-gray-500">
                  ... và {editedData.topics.length - 5} chủ đề khác
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Validation Results */}
      <Card>
        <CardContent>
          <div className="space-y-4">
            {/* Errors */}
            {validation.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-red-900 mb-2">
                      ❌ Lỗi cần sửa ({validation.errors.length}):
                    </h5>
                    <ul className="text-sm text-red-800 space-y-1">
                      {validation.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mt-0.5" />
                  <div>
                    <h5 className="font-medium text-yellow-900 mb-2">
                      ⚠️ Cảnh báo ({validation.warnings.length}):
                    </h5>
                    <ul className="text-sm text-yellow-800 space-y-1">
                      {validation.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Success */}
            {validation.isValid && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <h5 className="font-medium text-green-900">
                      ✅ Dữ liệu hợp lệ và sẵn sàng lưu!
                    </h5>
                    <p className="text-sm text-green-800 mt-1">
                      Tất cả thông tin đã được kiểm tra và không có lỗi.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={loading}
        >
          ⬅️ Quay lại
        </Button>

        <div className="flex space-x-3">
          {onEdit && (
            <Button
              variant="secondary"
              onClick={onEdit}
              disabled={loading}
            >
              ✏️ Chỉnh sửa
            </Button>
          )}
          
          <Button
            onClick={handleSave}
            disabled={!validation.isValid || loading}
            loading={loading}
            size="lg"
            className="min-w-[160px]"
          >
            <Save className="w-5 h-5 mr-2" />
            {loading ? 'Đang lưu...' : '💾 Lưu Template'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataPreview;