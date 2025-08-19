import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Typography, Spin, message, Modal } from 'antd';
import { CalendarOutlined, CloseOutlined } from '@ant-design/icons';
import { getPublishedBlogs } from '../../../services/blogService';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Paragraph } = Typography;

export default function RoleCards() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPublishedBlogs();
  }, []);

  const fetchPublishedBlogs = async () => {
    try {
      const data = await getPublishedBlogs();
      console.log('Blogs data:', data); // Debug log
      setBlogs(data.slice(0, 6));
    } catch (error) {
      message.error('Không thể tải tin tức');
    } finally {
      setLoading(false);
    }
  };

  const handleBlogClick = (blog) => {
    setSelectedBlog(blog);
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedBlog(null);
  };

  const formatDate = (dateString) => {
    console.log('formatDate called with:', dateString); // Debug log
    if (!dateString) return '';
    try {
      let date;
      // Handle different date formats
      if (typeof dateString === 'string') {
        // Try parsing ISO format first
        if (dateString.includes('T')) {
          date = new Date(dateString);
        } else {
          // Try parsing MySQL format (yyyy-MM-dd HH:mm:ss)
          date = new Date(dateString.replace(' ', 'T'));
        }
      } else {
        date = new Date(dateString);
      }
      
      console.log('Parsed date:', date); // Debug log
      if (isNaN(date.getTime())) {
        console.log('Invalid date detected'); // Debug log
        return '';
      }
      
      return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error); // Debug log
      return '';
    }
  };

  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  return (
    <section className="py-20 px-6 w-full">
      <div className="text-center mb-12">
        <Title level={2} className="text-3xl font-bold mb-4" style={{ color: 'white' }}>
          Tin Tức Giáo Dục
        </Title>
        <Text className="text-lg" style={{ color: 'white' }}>
          Cập nhật những tin tức mới nhất về giáo dục và công nghệ
        </Text>
      </div>
      {loading ? (
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4" style={{ color: 'white' }}>Đang tải tin tức...</p>
        </div>
      ) : blogs.length === 0 ? (
        <div className="text-center" style={{ color: 'white' }}>Chưa có tin tức nào.</div>
      ) : (
        <Row gutter={[24, 24]}>
          {blogs.map((blog) => {
            console.log('Rendering blog:', blog.id, 'publishedDate:', blog.publishedDate); // Debug log
            return (
              <Col xs={24} sm={12} lg={8} key={blog.id}>
                <Card
                  hoverable
                  className="h-full rounded-xl shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
                  onClick={() => handleBlogClick(blog)}
                  cover={
                    blog.thumbnailUrl ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          alt={blog.title}
                          src={blog.thumbnailUrl}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div 
                          className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold"
                          style={{ display: 'none' }}
                        >
                          {blog.title.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold">
                        {blog.title.charAt(0).toUpperCase()}
                      </div>
                    )
                  }
                >
                  <div className="p-4">
                    <Title level={4} className="mb-3 line-clamp-2">
                      {blog.title}
                    </Title>
                    <Paragraph className="text-gray-600 mb-4 line-clamp-3">
                      {truncateText(blog.description, 120)}
                    </Paragraph>
                    <div className="flex items-center justify-end text-sm text-gray-500">
                      <div className="flex items-center">
                        <CalendarOutlined className="mr-1" />
                        <Text>{formatDate(blog.publishedDate)}</Text>
                      </div>
                    </div>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}
      {blogs.length >= 6 && !loading && (
        <div className="text-center mt-8">
          <button
            onClick={() => {
              const token = localStorage.getItem('token');
              if (!token) {
                window.location.href = '/login';
              } else {
                navigate('/blog');
              }
            }}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-medium"
          >
            Xem thêm
          </button>
        </div>
      )}
      
      {/* Blog Detail Modal */}
      <Modal
        title={null}
        open={isModalVisible}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        centered
        closeIcon={<CloseOutlined style={{ fontSize: '20px', color: '#666' }} />}
        styles={{
          body: { padding: '24px' }
        }}
      >
        {selectedBlog && (
          <div className="blog-detail-modal">
            {/* Header */}
            <div className="mb-6">
              <Title level={2} className="mb-4 text-2xl font-bold">
                {selectedBlog.title}
              </Title>
                             <div className="flex items-center justify-end text-sm text-gray-500 mb-4">
                 <div className="flex items-center">
                   <CalendarOutlined className="mr-2" />
                   <Text>{formatDate(selectedBlog.publishedDate)}</Text>
                 </div>
               </div>
               {console.log('Modal selectedBlog.publishedDate:', selectedBlog.publishedDate)} {/* Debug log */}
            </div>

            {/* Image */}
            {selectedBlog.thumbnailUrl && (
              <div className="mb-6">
                <img
                  src={selectedBlog.thumbnailUrl}
                  alt={selectedBlog.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}

            {/* Content */}
            <div className="mb-6">
              <Paragraph className="text-gray-700 leading-relaxed text-base">
                {selectedBlog.description}
              </Paragraph>
              {selectedBlog.content && (
                <div 
                  className="text-gray-700 leading-relaxed text-base"
                  dangerouslySetInnerHTML={{ __html: selectedBlog.content }}
                />
              )}
            </div>

            
          </div>
        )}
      </Modal>
    </section>
  );
}
