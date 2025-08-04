// src/components/syllabus/ExcelImportWizard.jsx
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { useState } from 'react';
import { useFileUpload } from '../../hooks/useFileUpload';
import { useNotification } from '../../hooks/useNotification';
import { Button } from '../ui/button';
import { Modal } from '../ui/Modal';
import DataPreview from './DataPreview';
import FileUpload from './FileUpload';
import TemplateDownload from './TemplateDownload';

const STEPS = {
  DOWNLOAD: 1,
  UPLOAD: 2,
  PREVIEW: 3,
};

const STEP_TITLES = {
  [STEPS.DOWNLOAD]: 'Bước 1: Tải Template Excel',
  [STEPS.UPLOAD]: 'Bước 2: Upload File Excel',
  [STEPS.PREVIEW]: 'Bước 3: Xem lại dữ liệu',
};

const ExcelImportWizard = ({ isOpen, onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(STEPS.DOWNLOAD);
  const [parsedData, setParsedData] = useState(null);
  
  const { saveImportedData, uploading } = useFileUpload();
  const { showSuccess } = useNotification();

  // Handle step navigation
  const nextStep = () => {
    if (currentStep < STEPS.PREVIEW) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > STEPS.DOWNLOAD) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (step) => {
    setCurrentStep(step);
  };

  // Handle download success
  const handleDownloadSuccess = () => {
    showSuccess('Template đã được tải xuống! Hãy điền thông tin và quay lại upload.');
    // Auto advance to next step after short delay
    setTimeout(() => {
      nextStep();
    }, 1500);
  };

  // Handle upload success
  const handleUploadSuccess = (data) => {
    setParsedData(data);
    showSuccess('File đã được upload và phân tích thành công!');
    nextStep();
  };

  // Handle save template
  const handleSaveTemplate = async (data) => {
    try {
      const result = await saveImportedData(data);
      showSuccess('Template đã được lưu thành công!');
      onSuccess?.(result);
      handleClose();
    } catch (error) {
      // Error already handled by hook
    }
  };

  // Handle close
  const handleClose = () => {
    setCurrentStep(STEPS.DOWNLOAD);
    setParsedData(null);
    onClose();
  };

  // Progress calculation
  const progress = (currentStep / Object.keys(STEPS).length) * 100;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      className="min-h-[90vh]"
    >
      <div className="flex flex-col min-h-[85vh]">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                📥 Import Kế Hoạch Dạy Học từ Excel
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {STEP_TITLES[currentStep]}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Tiến độ</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Step Navigation */}
          <div className="flex items-center justify-center mt-4 space-x-8">
            {Object.values(STEPS).map((step) => (
              <div
                key={step}
                className={`flex items-center cursor-pointer transition-colors ${
                  step <= currentStep ? 'text-blue-600' : 'text-gray-400'
                }`}
                onClick={() => step <= currentStep && goToStep(step)}
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                    ${step === currentStep 
                      ? 'bg-blue-600 text-white' 
                      : step < currentStep 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-600'
                    }
                  `}
                >
                  {step < currentStep ? '✓' : step}
                </div>
                <span className="ml-2 text-sm font-medium hidden sm:inline">
                  {step === STEPS.DOWNLOAD && 'Tải Template'}
                  {step === STEPS.UPLOAD && 'Upload File'}
                  {step === STEPS.PREVIEW && 'Xem lại'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {currentStep === STEPS.DOWNLOAD && (
            <TemplateDownload onDownloadSuccess={handleDownloadSuccess} />
          )}

          {currentStep === STEPS.UPLOAD && (
            <FileUpload
              onUploadSuccess={handleUploadSuccess}
              onCancel={prevStep}
            />
          )}

          {currentStep === STEPS.PREVIEW && parsedData && (
            <DataPreview
              data={parsedData}
              onSave={handleSaveTemplate}
              onBack={prevStep}
              loading={uploading}
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Left side - Help text */}
            <div className="text-sm text-gray-600">
              {currentStep === STEPS.DOWNLOAD && (
                <span>💡 Tải template Excel và điền thông tin theo mẫu</span>
              )}
              {currentStep === STEPS.UPLOAD && (
                <span>📤 Chọn file Excel đã điền để upload</span>
              )}
              {currentStep === STEPS.PREVIEW && (
                <span>👀 Kiểm tra dữ liệu trước khi lưu vào hệ thống</span>
              )}
            </div>

            {/* Right side - Navigation */}
            <div className="flex items-center space-x-3">
              {/* Cancel/Close */}
              <Button
                variant="outline"
                onClick={currentStep === STEPS.DOWNLOAD ? handleClose : prevStep}
                disabled={uploading}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                {currentStep === STEPS.DOWNLOAD ? 'Đóng' : 'Quay lại'}
              </Button>

              {/* Next (only show for first step) */}
              {currentStep === STEPS.DOWNLOAD && (
                <Button
                  onClick={nextStep}
                  disabled={uploading}
                >
                  Tiếp tục
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              )}

              {/* Skip to upload (if already have file) */}
              {currentStep === STEPS.DOWNLOAD && (
                <Button
                  variant="secondary"
                  onClick={() => setCurrentStep(STEPS.UPLOAD)}
                  disabled={uploading}
                >
                  📁 Đã có file, skip
                </Button>
              )}
            </div>
          </div>

          {/* Additional Tips */}
          <div className="mt-3 text-xs text-gray-500">
            <div className="flex items-center space-x-4">
              <span>💾 Tự động lưu tiến độ</span>
              <span>🔒 Dữ liệu được mã hóa</span>
              <span>⚡ Xử lý nhanh chóng</span>
              <span>📞 Hỗ trợ 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ExcelImportWizard;