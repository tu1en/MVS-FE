import React, { useState, useEffect } from 'react';
import { Button, message } from 'antd';
import { getPublishedBlogs } from '../services/blogService';

const BlogTest = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);

  const testBlogAPI = async () => {
    setLoading(true);
    try {
      const data = await getPublishedBlogs();
      setBlogs(data);
      message.success(`Fetched ${data.length} blogs successfully`);
      console.log('Blogs data:', data);
    } catch (error) {
      console.error('Error testing blog API:', error);
      message.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Blog API Test</h2>
      <Button 
        type="primary" 
        onClick={testBlogAPI} 
        loading={loading}
        style={{ marginBottom: '20px' }}
      >
        Test Blog API
      </Button>
      
      {blogs.length > 0 && (
        <div>
          <h3>Found {blogs.length} blogs:</h3>
          <ul>
            {blogs.map(blog => (
              <li key={blog.id}>
                <strong>{blog.title}</strong> - {blog.isPublished ? 'Published' : 'Draft'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BlogTest; 