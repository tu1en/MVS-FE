import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Typography, Card, Spin, message, Button, Tag, Divider } from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  EyeOutlined, 
  ArrowLeftOutlined,
  TagOutlined
} from '@ant-design/icons';
import { getBlogById } from '../services/blogService';

const { Title, Text, Paragraph } = Typography;

const BlogDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [blog, setBlog] = useState(location.state?.blog || null);
  const [loading, setLoading] = useState(!location.state?.blog);

  useEffect(() => {
    if (!blog) {
      fetchBlog();
    }
  }, [id, blog]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const data = await getBlogById(id);
      setBlog(data);
    } catch (error) {
      console.error('Error fetching blog:', error);
      message.error('Không thể tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderTags = (tagString) => {
    if (!tagString) return null;
    const tags = tagString.split(',').map(tag => tag.trim()).filter(tag => tag);
    return tags.map((tag, index) => (
      <Tag key={index} color="blue" className="mb-2">
        <TagOutlined className="mr-1" />
        {tag}
      </Tag>
    ));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="mt-4 text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Title level={3} className="text-red-500">Không tìm thấy bài viết</Title>
          <Button type="primary" onClick={() => navigate('/')}>
            Về trang chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="mx-auto px-4 sm:px-6 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/')}
            className="mb-4"
          >
            Về trang chủ
          </Button>
        </div>

        {/* Blog Content */}
        <Card className="shadow-lg rounded-xl overflow-hidden">
          {/* Header Image */}
          {blog.thumbnailUrl && (
            <div className="w-full h-64 md:h-96 overflow-hidden mb-6">
              <img
                src={blog.thumbnailUrl}
                alt={blog.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              <div 
                className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-6xl font-bold"
                style={{ display: 'none' }}
              >
                {blog.title.charAt(0).toUpperCase()}
              </div>
            </div>
          )}

          {/* Blog Header */}
          <div className="px-6 pb-6">
            <Title level={1} className="text-3xl md:text-4xl font-bold mb-4">
              {blog.title}
            </Title>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
              <div className="flex items-center">
                <UserOutlined className="mr-2" />
                <Text strong>{blog.authorName || 'Admin'}</Text>
              </div>
              <div className="flex items-center">
                <CalendarOutlined className="mr-2" />
                <Text>{formatDate(blog.publishedDate)}</Text>
              </div>
              {blog.viewCount && (
                <div className="flex items-center">
                  <EyeOutlined className="mr-2" />
                  <Text>{blog.viewCount} lượt xem</Text>
                </div>
              )}
            </div>

            {/* Tags */}
            {blog.tags && (
              <div className="mb-6">
                {renderTags(blog.tags)}
              </div>
            )}

            <Divider />

            {/* Blog Content */}
            <div className="prose prose-lg max-w-none">
              {blog.description && (
                <div 
                  className="text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: blog.description }}
                />
              )}
            </div>

            {/* Video if available */}
            {blog.videoUrl && (
              <div className="mt-8">
                <Title level={3} className="mb-4">Video liên quan</Title>
                <div className="aspect-w-16 aspect-h-9">
                  <iframe
                    src={blog.videoUrl}
                    title={blog.title}
                    className="w-full h-96 rounded-lg"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}

            {/* Footer */}
            <Divider />
            <div className="text-center text-gray-500">
              <Text>Bài viết được cập nhật lần cuối: {formatDate(blog.lastEditedDate)}</Text>
              {blog.lastEditedByName && blog.lastEditedByName !== blog.authorName && (
                <Text className="block mt-1">
                  Chỉnh sửa bởi: {blog.lastEditedByName}
                </Text>
              )}
            </div>
          </div>
        </Card>

        {/* Related Actions */}
        <div className="mt-8 text-center">
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/blog')}
            className="mr-4"
          >
            Xem tất cả tin tức
          </Button>
          <Button 
            size="large"
            onClick={() => navigate('/')}
          >
            Về trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage; 