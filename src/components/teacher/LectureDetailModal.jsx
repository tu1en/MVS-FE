import {
  CalendarOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  UserOutlined,
  VideoCameraOutlined
} from '@ant-design/icons';
import { Collapse, Modal, Tabs, Tag } from 'antd';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const { TabPane } = Tabs;
const { Panel } = Collapse;

const LectureDetailModal = ({ visible, onClose, lecture, currentUser, loading = false }) => {
  const [activeTab, setActiveTab] = useState('content');

  if (!lecture && !loading) return null;

  // Format date to DD/MM/YYYY
  const formatDate = (dateString) => {
    if (!dateString) return 'Chưa xác định';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Get lecture status based on date
  const getLectureStatus = (lectureDate) => {
    if (!lectureDate) return { status: 'Chưa xác định', color: 'default' };
    
    const today = new Date();
    const lecDate = new Date(lectureDate);
    
    if (lecDate.toDateString() === today.toDateString()) {
      return { status: 'Đang diễn ra', color: 'processing' };
    } else if (lecDate > today) {
      return { status: 'Sắp tới', color: 'warning' };
    } else {
      return { status: 'Đã hoàn thành', color: 'success' };
    }
  };

  // Get material icon based on content type
  const getMaterialIcon = (contentType) => {
    if (contentType === 'video/youtube') return <VideoCameraOutlined className="text-red-500" />;
    if (contentType?.includes('image')) return <FileTextOutlined className="text-blue-500" />;
    if (contentType?.includes('pdf')) return <FileTextOutlined className="text-red-600" />;
    return <FileTextOutlined className="text-gray-500" />;
  };

  // Get material type display name
  const getMaterialTypeName = (contentType) => {
    if (contentType === 'video/youtube') return 'Video YouTube';
    if (contentType?.includes('pdf')) return 'Tài liệu PDF';
    if (contentType?.includes('image')) return 'Hình ảnh';
    if (contentType?.includes('word')) return 'Tài liệu Word';
    return 'Tài liệu';
  };

  const lectureStatus = lecture ? getLectureStatus(lecture.lectureDate) : { status: 'Đang tải...', color: 'default' };
  const isDeveloper = currentUser?.role === 'ADMIN' || currentUser?.role === 'DEVELOPER';

  // Loading skeleton component
  const LoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-32 bg-gray-200 rounded"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  );

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={null}
      width={900}
      className="lecture-detail-modal"
      styles={{
        body: { padding: 0 }
      }}
    >
      {/* Custom Header */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b">
        {loading ? (
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ) : (
          <>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              Bài giảng: {lecture?.title || 'Đang tải...'}
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed">
              {lecture?.description || 'Bài giảng trong khóa học Công nghệ thông tin cơ bản'}
            </p>
          </>
        )}
      </div>

      {/* Metadata Section */}
      <div className="px-6 py-4 bg-gray-50 border-b">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-2 animate-pulse">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <CalendarOutlined className="text-blue-500" />
              <div>
                <span className="text-xs text-gray-500 block">Ngày giảng</span>
                <span className="text-sm font-medium">{formatDate(lecture?.lectureDate)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <UserOutlined className="text-green-500" />
              <div>
                <span className="text-xs text-gray-500 block">Giảng viên</span>
                <span className="text-sm font-medium">{lecture?.teacherName || 'Chưa xác định'}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <ClockCircleOutlined className="text-orange-500" />
              <div>
                <span className="text-xs text-gray-500 block">Trạng thái</span>
                <Tag color={lectureStatus.color} className="mt-1">
                  {lectureStatus.status}
                </Tag>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Content */}
      <div className="px-6 py-4">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          className="lecture-detail-tabs"
        >
          <TabPane tab="Nội dung" key="content">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                  <FileTextOutlined className="mr-2 text-blue-500" />
                  Nội dung bài giảng
                </h3>

                {loading ? (
                  <LoadingSkeleton />
                ) : lecture?.content ? (
                  <div
                    className="prose prose-sm max-w-none bg-white border rounded-lg p-4 max-h-80 overflow-y-auto markdown-content"
                    style={{ maxHeight: '300px' }}
                    role="article"
                    aria-label="Nội dung bài giảng"
                  >
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                    >
                      {lecture.content}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <FileTextOutlined className="text-4xl mb-2" />
                    <p>Chưa có nội dung bài giảng</p>
                  </div>
                )}
              </div>
            </div>
          </TabPane>

          <TabPane
            tab={`Tài liệu (${loading ? '...' : lecture?.materials?.length || 0})`}
            key="materials"
          >
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <DownloadOutlined className="mr-2 text-green-500" />
                Tài liệu & Tài nguyên
              </h3>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="border rounded-lg p-4 animate-pulse">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-gray-200 rounded"></div>
                          <div>
                            <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded w-20"></div>
                          </div>
                        </div>
                        <div className="h-8 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : lecture?.materials && lecture.materials.length > 0 ? (
                <div className="space-y-3">
                  {lecture.materials.map((material, index) => (
                    <div 
                      key={index} 
                      className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getMaterialIcon(material.contentType)}
                          <div>
                            <h4 className="font-medium text-gray-800">
                              {material.fileName}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {getMaterialTypeName(material.contentType)}
                              {material.fileSize && material.fileSize > 0 && 
                                ` • ${(material.fileSize / 1024 / 1024).toFixed(2)} MB`
                              }
                            </p>
                          </div>
                        </div>
                        
                        {material.downloadUrl && (
                          <a
                            href={material.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-1 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                            aria-label={material.contentType === 'video/youtube'
                              ? `Xem video ${material.fileName}`
                              : `Tải xuống tài liệu ${material.fileName}`
                            }
                          >
                            {material.contentType === 'video/youtube' ? (
                              <>
                                <VideoCameraOutlined aria-hidden="true" />
                                <span>Xem video</span>
                              </>
                            ) : (
                              <>
                                <DownloadOutlined aria-hidden="true" />
                                <span>Tải xuống</span>
                              </>
                            )}
                          </a>
                        )}
                      </div>
                      
                      {/* Render YouTube video embed */}
                      {material.contentType === 'video/youtube' && material.downloadUrl && (
                        <div className="mt-3">
                          <div className="youtube-embed-container">
                            <iframe
                              src={material.downloadUrl}
                              title={material.fileName}
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                              className="rounded-lg"
                              loading="lazy"
                            ></iframe>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <DownloadOutlined className="text-4xl mb-3" />
                  <h4 className="text-lg font-medium mb-2">Chưa có tài liệu đính kèm</h4>
                  <p className="text-sm">Tài liệu sẽ được cập nhật sau</p>
                </div>
              )}
            </div>
          </TabPane>

          <TabPane tab="Thông tin khác" key="info">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                <InfoCircleOutlined className="mr-2 text-purple-500" />
                Thông tin bổ sung
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Thời gian tạo</h4>
                  <p className="text-sm text-gray-600">
                    {lecture.createdAt ? formatDate(lecture.createdAt) : 'Không xác định'}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Cập nhật lần cuối</h4>
                  <p className="text-sm text-gray-600">
                    {lecture.updatedAt ? formatDate(lecture.updatedAt) : 'Không xác định'}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">ID Lớp học</h4>
                  <p className="text-sm text-gray-600">
                    {lecture.classroomId || 'Không xác định'}
                  </p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">Số lượng tài liệu</h4>
                  <p className="text-sm text-gray-600">
                    {lecture.materials?.length || 0} tài liệu
                  </p>
                </div>
              </div>

              {/* Developer Debug Section */}
              {isDeveloper && (
                <Collapse className="mt-6">
                  <Panel 
                    header="Thông tin chi tiết (dành cho developer)" 
                    key="debug"
                    className="bg-yellow-50"
                  >
                    <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-60">
                      {JSON.stringify(lecture, null, 2)}
                    </pre>
                  </Panel>
                </Collapse>
              )}
            </div>
          </TabPane>
        </Tabs>
      </div>
    </Modal>
  );
};

export default LectureDetailModal;
