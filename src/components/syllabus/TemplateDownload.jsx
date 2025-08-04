// src/components/syllabus/TemplateDownload.jsx
import { Download, FileText, Info } from 'lucide-react';
import { useSyllabusApi } from '../../hooks/useSyllabusApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader } from '../ui/card';

const TemplateDownload = ({ onDownloadSuccess }) => {
  const { downloadTemplate, loading } = useSyllabusApi();

  const handleDownload = async () => {
    try {
      await downloadTemplate();
      onDownloadSuccess?.();
    } catch (error) {
      // Error already handled by hook
      console.error('Download failed:', error);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              📥 Tải Template Excel
            </h3>
            <p className="text-sm text-gray-500">
              Tải file mẫu để tạo kế hoạch dạy học
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Template Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-2">
                Thông tin Template:
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Dữ liệu mẫu:</strong> Vật Lý 10 với 25 chủ đề</li>
                <li>• <strong>Format:</strong> Excel 2016+ (.xlsx)</li>
                <li>• <strong>Tên file:</strong> Syllabus_Template.xlsx</li>
                <li>• <strong>Nội dung:</strong> Form nhập thông tin khóa học và danh sách chủ đề</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-gray-900">
            🔍 Hướng dẫn sử dụng:
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">1</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Tải Template</p>
                  <p className="text-xs text-gray-600">Click nút tải để download file Excel mẫu</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">2</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Điền thông tin</p>
                  <p className="text-xs text-gray-600">Thay đổi dữ liệu mẫu theo môn học của bạn</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">3</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Lưu file</p>
                  <p className="text-xs text-gray-600">Lưu với định dạng .xlsx (Excel)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-600">4</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Upload</p>
                  <p className="text-xs text-gray-600">Quay lại và upload file đã điền</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <div className="flex justify-center pt-4">
          <Button
            onClick={handleDownload}
            loading={loading}
            size="lg"
            className="w-full md:w-auto"
          >
            <Download className="w-5 h-5 mr-2" />
            {loading ? 'Đang tải xuống...' : 'Tải Template Excel'}
          </Button>
        </div>

        {/* Additional Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h5 className="text-sm font-medium text-gray-900 mb-2">
            💡 Lưu ý quan trọng:
          </h5>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Không thay đổi tên các cột trong Excel</li>
            <li>• Tuần học phải là số nguyên dương (1, 2, 3...)</li>
            <li>• Tên chủ đề không được để trống</li>
            <li>• File không được vượt quá 5MB</li>
            <li>• Nên backup file trước khi upload</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateDownload;