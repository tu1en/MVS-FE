import {
    CalendarOutlined,
    DeleteOutlined,
    EditOutlined,
    EyeOutlined,
    PlusOutlined,
    SearchOutlined, TagOutlined,
    VideoCameraOutlined
} from "@ant-design/icons";
import {
    App,
    Button,
    Card,
    Col,
    Divider,
    Form,
    Image,
    Input,
    Modal,
    Row,
    Space,
    Spin,
    Tabs,
    Tag,
    Tooltip,
    Typography,
    Table,
    Popconfirm
} from "antd";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import * as blogService from "../services/blogService";
import NavigationBar from '../components/NavigationBar';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const BlogPages = () => {
  const { message } = App.useApp();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  
  const { user, isLogin } = useSelector((state) => state.auth);
  const isAdmin = user && (user.role === 'ADMIN' || user.role === 'ROLE_ADMIN');
  const isAuthenticated = !!user;

  useEffect(() => {
    fetchPublishedBlogs();
  }, []);

  const fetchAllBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogService.getAllBlogs();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching all blogs:", error);
      message.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const fetchPublishedBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogService.getPublishedBlogs();
      setBlogs(data);
    } catch (error) {
      console.error("Error fetching published blogs:", error);
      message.error("Failed to fetch published blogs");
    } finally {
      setLoading(false);
    }
  };



  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      fetchPublishedBlogs();
      return;
    }
    
    setLoading(true);
    try {
      const data = await blogService.searchBlogs(searchKeyword);
      setBlogs(data);
    } catch (error) {
      console.error("Error searching blogs:", error);
      message.error("Failed to search blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    setViewModalVisible(true);
  };

  const handleCreateBlog = () => {
    if (!isAuthenticated) {
      message.warning("Please log in to create a blog");
      return;
    }
    form.resetFields();
    setCreateModalVisible(true);
  };

  const handleEditBlog = (blog) => {
    setSelectedBlog(blog);
    editForm.setFieldsValue({
      title: blog.title,
      description: blog.description,
      imageUrl: blog.imageUrl,
      videoUrl: blog.videoUrl,
      tags: blog.tags,
      thumbnailUrl: blog.thumbnailUrl,
      isPublished: blog.isPublished
    });
    setEditModalVisible(true);
  };

  const handleDeleteBlog = async (blogId) => {
    try {
      await blogService.deleteBlog(blogId);
      message.success("Blog deleted successfully");
      fetchPublishedBlogs();
    } catch (error) {
      console.error("Error deleting blog:", error);
      message.error("Failed to delete blog");
    }
  };

  const handlePublishBlog = async (blogId, isPublished) => {
    try {
      if (isPublished) {
        await blogService.unpublishBlog(blogId);
        message.success("Blog unpublished successfully");
      } else {
        await blogService.publishBlog(blogId);
        message.success("Blog published successfully");
      }
      fetchPublishedBlogs();
    } catch (error) {
      console.error("Error changing blog publish status:", error);
      message.error("Failed to change blog publish status");
    }
  };

  const submitCreateBlog = async (values) => {
    try {
      await blogService.createBlog(values);
      message.success("Blog created successfully");
      setCreateModalVisible(false);
      fetchPublishedBlogs();
    } catch (error) {
      console.error("Error creating blog:", error);
      message.error("Failed to create blog");
    }
  };

  const submitEditBlog = async (values) => {
    try {
      await blogService.updateBlog(selectedBlog.id, values);
      message.success("Blog updated successfully");
      setEditModalVisible(false);
      fetchPublishedBlogs();
    } catch (error) {
      console.error("Error updating blog:", error);
      message.error("Failed to update blog");
    }
  };

  const renderTags = (tagString) => {
    if (!tagString) return null;
    
    const tags = tagString.split(',').map(tag => tag.trim());
    return (
      <Space size={[0, 8]} wrap>
        {tags.map((tag, index) => (
          <Tag key={index} color="blue">
            <TagOutlined /> {tag}
          </Tag>
        ))}
      </Space>
    );
  };

  const renderBlogCards = () => {
    return blogs.map((blog) => (
      <Col xs={24} sm={12} md={8} lg={8} key={blog.id} style={{ marginBottom: 16 }}>
        <Card
          hoverable
          cover={
            blog.thumbnailUrl ? (
              <img 
                alt={blog.title} 
                src={blog.thumbnailUrl} 
                style={{ height: 200, objectFit: "cover" }} 
              />
            ) : (
              <div style={{ height: 200, background: "#f0f2f5", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Text type="secondary">No thumbnail</Text>
              </div>
            )
          }
          actions={[
            <Tooltip title="View">
              <EyeOutlined key="view" onClick={() => handleViewBlog(blog)} />
            </Tooltip>,
                         isAdmin && (
               <Tooltip title="Edit">
                 <EditOutlined key="edit" onClick={() => handleEditBlog(blog)} />
               </Tooltip>
             ),
             isAdmin && (
               <Tooltip title="Delete">
                 <DeleteOutlined key="delete" onClick={() => handleDeleteBlog(blog.id)} />
               </Tooltip>
             ),
          ].filter(Boolean)}
                     extra={
             isAdmin && (
               <Button 
                 type={blog.isPublished ? "default" : "primary"} 
                 size="small"
                 onClick={() => handlePublishBlog(blog.id, blog.isPublished)}
               >
                 {blog.isPublished ? "Unpublish" : "Publish"}
               </Button>
             )
           }
        >
          <Card.Meta
            title={blog.title}
            description={
              <>
                <Paragraph ellipsis={{ rows: 2 }}>
                  {blog.description}
                </Paragraph>
                {renderTags(blog.tags)}
                                 <div style={{ marginTop: 8 }}>
                   <Space>
                     {blog.isPublished && blog.publishedDate && (
                       <Tooltip title="Published Date">
                         <Text type="secondary">
                           <CalendarOutlined /> {new Date(blog.publishedDate).toLocaleDateString()}
                         </Text>
                       </Tooltip>
                     )}
                   </Space>
                 </div>
              </>
            }
          />
        </Card>
      </Col>
    ));
  };



  return (
    <div className="flex min-h-screen bg-gray-50">
      {isLogin && <NavigationBar />}
      <div className="flex-1 p-6">
        <Title level={2} className="mb-6">Tin Tức</Title>
        {/* Only show Create Blog for admin */}
        {isAdmin && (
          <Button type="primary" icon={<PlusOutlined />} className="mb-4" onClick={() => setCreateModalVisible(true)}>
            Tạo Blog Mới
          </Button>
        )}
        {/* Blog Management for admin */}
        {isAdmin && (
          <div className="mb-8">
            <Title level={4}>Quản Lý Blog</Title>
            <Table
              dataSource={blogs}
              rowKey="id"
              columns={[
                { title: 'Tiêu đề', dataIndex: 'title', key: 'title' },
                { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
                { title: 'Ngày đăng', dataIndex: 'publishedDate', key: 'publishedDate', render: (date) => date ? new Date(date).toLocaleDateString('vi-VN') : '' },
                {
                  title: 'Hành động',
                  key: 'actions',
                  render: (_, blog) => (
                    <Space>
                      <Button icon={<EyeOutlined />} onClick={() => handleViewBlog(blog)} />
                      <Button icon={<EditOutlined />} onClick={() => handleEditBlog(blog)} />
                      <Popconfirm title="Xoá blog này?" onConfirm={() => handleDeleteBlog(blog.id)} okText="Xoá" cancelText="Huỷ">
                        <Button icon={<DeleteOutlined />} danger />
                      </Popconfirm>
                    </Space>
                  )
                }
              ]}
              pagination={false}
            />
          </div>
        )}
        {/* Blog list for all users */}
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
            <Space>
              <Input
                placeholder="Tìm tin tức..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onPressEnter={handleSearch}
                suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: "pointer" }} />}
                style={{ width: 250 }}
              />
              {/* Only show Create Blog for admin */}
              {isAdmin && (
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateBlog}>
                  Create Blog
                </Button>
              )}
            </Space>
          </div>
          


          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {blogs.length > 0 ? renderBlogCards() : (
                <Col span={24}>
                  <div style={{ textAlign: "center", padding: "50px 0" }}>
                    <Text type="secondary">No blogs found</Text>
                  </div>
                </Col>
              )}
            </Row>
          )}
        </div>
      </div>

      {/* View Blog Modal - Anyone can view details */}
      <Modal
        title={selectedBlog?.title}
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedBlog && (
          <div>
            {selectedBlog.imageUrl && (
              <div style={{ marginBottom: 16 }}>
                <Image
                  src={selectedBlog.imageUrl}
                  alt={selectedBlog.title}
                  style={{ maxWidth: "100%", maxHeight: 400 }}
                />
              </div>
            )}
            
            <Paragraph style={{ whiteSpace: "pre-line" }}>
              {selectedBlog.description}
            </Paragraph>
            
            {selectedBlog.videoUrl && (
              <div style={{ marginTop: 16 }}>
                <Title level={4}><VideoCameraOutlined /> Video</Title>
                <iframe
                  width="100%"
                  height="315"
                  src={selectedBlog.videoUrl}
                  title="Video"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            )}
            
            <Divider />
            
            {renderTags(selectedBlog.tags)}
            
                         <div style={{ marginTop: 16 }}>
               <Space>
                 {selectedBlog.isPublished && selectedBlog.publishedDate && (
                   <Text type="secondary">
                     <CalendarOutlined /> Published: {new Date(selectedBlog.publishedDate).toLocaleString()}
                   </Text>
                 )}
                 <Text type="secondary">
                   Status: <Tag color={selectedBlog.isPublished ? "green" : "orange"}>
                     {selectedBlog.isPublished ? "Published" : "Draft"}
                   </Tag>
                 </Text>
               </Space>
             </div>
            
                         {/* Edit/Delete buttons only for admins */}
             {isAdmin && (
              <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    onClick={() => {
                      setViewModalVisible(false);
                      handleEditBlog(selectedBlog);
                    }}
                  >
                    Edit
                  </Button>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => {
                      setViewModalVisible(false);
                      handleDeleteBlog(selectedBlog.id);
                    }}
                  >
                    Delete
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Blog Modal - Only for authenticated users */}
      <Modal
        title="Create New Blog"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={submitCreateBlog}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={6} />
          </Form.Item>
          
          <Form.Item
            name="imageUrl"
            label="Image URL"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
          
          <Form.Item
            name="videoUrl"
            label="Video URL"
          >
            <Input placeholder="https://example.com/video" />
          </Form.Item>
          
          <Form.Item
            name="thumbnailUrl"
            label="Thumbnail URL"
          >
            <Input placeholder="https://example.com/thumbnail.jpg" />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="Tags"
          >
            <Input placeholder="Enter tags separated by commas" />
          </Form.Item>
          
          <Form.Item
            name="isPublished"
            initialValue={false}
            valuePropName="checked"
          >
            <Button type="primary" htmlType="submit">
              Create Blog
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Blog Modal - Only for managers or author */}
      <Modal
        title="Edit Blog"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={submitEditBlog}
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: "Please enter a title" }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Description"
          >
            <TextArea rows={6} />
          </Form.Item>
          
          <Form.Item
            name="imageUrl"
            label="Image URL"
          >
            <Input placeholder="https://example.com/image.jpg" />
          </Form.Item>
          
          <Form.Item
            name="videoUrl"
            label="Video URL"
          >
            <Input placeholder="https://example.com/video" />
          </Form.Item>
          
          <Form.Item
            name="thumbnailUrl"
            label="Thumbnail URL"
          >
            <Input placeholder="https://example.com/thumbnail.jpg" />
          </Form.Item>
          
          <Form.Item
            name="tags"
            label="Tags"
          >
            <Input placeholder="Enter tags separated by commas" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Update Blog
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogPages; 