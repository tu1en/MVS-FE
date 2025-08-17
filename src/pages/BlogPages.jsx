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
import { useAuth } from '../context/AuthContext';

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
  
  const { user: ctxUser } = useAuth();
  const { user, isLogin, role: roleFromState } = useSelector((state) => state.auth);
  const computedRole = (roleFromState || user?.role || ctxUser?.role || localStorage.getItem('role') || '').toString().toUpperCase();
  const isAdmin = computedRole === 'ADMIN' || computedRole === 'ROLE_ADMIN';
  const isAuthenticated = !!ctxUser || isLogin === true || !!localStorage.getItem('token');

  useEffect(() => {
    fetchPublishedBlogs();
  }, []);

  const fetchAllBlogs = async () => {
    setLoading(true);
    try {
      const data = await blogService.getAllBlogs();
      setBlogs(data);
    } catch (error) {
      console.error("Lỗi tải danh sách tin tức:", error);
      message.error("Không thể tải danh sách tin tức");
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
      console.error("Lỗi tải tin tức:", error);
      message.error("Không thể tải tin tức");
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
      console.error("Lỗi tìm kiếm tin tức:", error);
      message.error("Không thể tìm kiếm tin tức");
    } finally {
      setLoading(false);
    }
  };

  const handleViewBlog = (blog) => {
    setSelectedBlog(blog);
    setViewModalVisible(true);
  };

  const handleCreateBlog = () => {
    if (!isAuthenticated || !isAdmin) {
      message.warning("Chỉ quản trị viên mới được tạo tin tức");
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
      message.success("Xoá tin tức thành công");
      fetchPublishedBlogs();
    } catch (error) {
      console.error("Lỗi xoá tin tức:", error);
      message.error("Xoá tin tức thất bại");
    }
  };

  const handlePublishBlog = async (blogId, isPublished) => {
    try {
      if (isPublished) {
        await blogService.unpublishBlog(blogId);
        message.success("Gỡ đăng tin tức thành công");
      } else {
        await blogService.publishBlog(blogId);
        message.success("Đăng tin tức thành công");
      }
      fetchPublishedBlogs();
    } catch (error) {
      console.error("Lỗi thay đổi trạng thái đăng:", error);
      message.error("Không thể thay đổi trạng thái đăng");
    }
  };

  const submitCreateBlog = async (values) => {
    try {
      await blogService.createBlog(values);
      message.success("Tạo tin tức thành công");
      setCreateModalVisible(false);
      fetchPublishedBlogs();
    } catch (error) {
      console.error("Lỗi tạo tin tức:", error);
      message.error("Tạo tin tức thất bại");
    }
  };

  const submitEditBlog = async (values) => {
    try {
      await blogService.updateBlog(selectedBlog.id, values);
      message.success("Cập nhật tin tức thành công");
      setEditModalVisible(false);
      fetchPublishedBlogs();
    } catch (error) {
      console.error("Lỗi cập nhật tin tức:", error);
      message.error("Cập nhật tin tức thất bại");
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
          onClick={() => handleViewBlog(blog)}
          cover={
            blog.thumbnailUrl ? (
              <img 
                alt={blog.title} 
                src={blog.thumbnailUrl} 
                style={{ height: 200, objectFit: "cover" }} 
              />
            ) : (
              <div style={{ height: 200, background: "#f0f2f5", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Text type="secondary">Không có ảnh bìa</Text>
              </div>
            )
          }
          actions={[
             <Tooltip title="Xem">
              <EyeOutlined key="view" onClick={() => handleViewBlog(blog)} />
            </Tooltip>,
                         isAdmin && (
               <Tooltip title="Sửa">
                 <EditOutlined key="edit" onClick={() => handleEditBlog(blog)} />
               </Tooltip>
             ),
             isAdmin && (
               <Tooltip title="Xoá">
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
                {blog.isPublished ? "Gỡ đăng" : "Đăng"}
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
                {isAdmin && renderTags(blog.tags)}
                                 <div style={{ marginTop: 8 }}>
                   <Space>
                     {blog.isPublished && blog.publishedDate && (
                        <Tooltip title="Ngày đăng">
                         <Text type="secondary">
                            <CalendarOutlined /> {new Date(blog.publishedDate).toLocaleDateString('vi-VN')}
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
      {(ctxUser || isLogin) && <NavigationBar />}
      <div className="flex-1 p-6">
        <Title level={2} className="mb-6">Tin tức</Title>
        {isAdmin && (
          <div className="mb-8">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <Space>
                <Input
                  placeholder="Tìm tin tức..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  onPressEnter={handleSearch}
                  suffix={<SearchOutlined onClick={handleSearch} style={{ cursor: "pointer" }} />}
                  style={{ width: 250 }}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateBlog}>
                  Tạo Tin Tức
                </Button>
              </Space>
            </div>
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
          {!isAdmin && (
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
              </Space>
            </div>
          )}
          


          {loading ? (
            <div style={{ textAlign: "center", padding: "50px 0" }}>
              <Spin size="large" />
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {blogs.length > 0 ? renderBlogCards() : (
                <Col span={24}>
                   <div style={{ textAlign: "center", padding: "50px 0" }}>
                     <Text type="secondary">Không có tin tức</Text>
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
            {(selectedBlog.imageUrl || selectedBlog.thumbnailUrl) && (
              <div style={{ marginBottom: 16 }}>
                <Image
                  src={selectedBlog.imageUrl || selectedBlog.thumbnailUrl}
                  alt={selectedBlog.title}
                  style={{ maxWidth: "100%", maxHeight: 400 }}
                />
              </div>
            )}
            
            <Paragraph style={{ whiteSpace: "pre-line" }}>
              {selectedBlog.description}
            </Paragraph>

            {selectedBlog.content && (
              <div style={{ marginTop: 8 }} dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
            )}
            
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
            
            {isAdmin && selectedBlog.tags && (
              <>
                <Divider />
                {renderTags(selectedBlog.tags)}
              </>
            )}
            
                         <div style={{ marginTop: 16 }}>
               <Space>
                 {selectedBlog.isPublished && selectedBlog.publishedDate && (
                    <Text type="secondary">
                      <CalendarOutlined /> Ngày đăng: {new Date(selectedBlog.publishedDate).toLocaleString('vi-VN')}
                   </Text>
                 )}
                 <Text type="secondary">
                    Trạng thái: <Tag color={selectedBlog.isPublished ? "green" : "orange"}>
                      {selectedBlog.isPublished ? "Đã đăng" : "Bản nháp"}
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
                     Sửa
                  </Button>
                  <Button 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={() => {
                      setViewModalVisible(false);
                      handleDeleteBlog(selectedBlog.id);
                    }}
                  >
                     Xoá
                  </Button>
                </Space>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Blog Modal - Only for authenticated users */}
      <Modal
         title="Tạo tin tức mới"
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
             label="Tiêu đề"
             rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
             label="Mô tả"
          >
            <TextArea rows={6} />
          </Form.Item>
          
          <Form.Item
            name="imageUrl"
             label="Ảnh URL"
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
             label="Ảnh bìa URL"
          >
            <Input placeholder="https://example.com/thumbnail.jpg" />
          </Form.Item>
          
          <Form.Item
            name="tags"
             label="Thẻ (tags)"
           >
             <Input placeholder="Nhập các thẻ, cách nhau bằng dấu phẩy" />
          </Form.Item>
          
          <Form.Item
            name="isPublished"
            initialValue={false}
            valuePropName="checked"
          >
             <Button type="primary" htmlType="submit">
               Tạo tin tức
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Blog Modal - Only for managers or author */}
      <Modal
         title="Chỉnh sửa tin tức"
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
             label="Tiêu đề"
             rules={[{ required: true, message: "Vui lòng nhập tiêu đề" }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
             label="Mô tả"
          >
            <TextArea rows={6} />
          </Form.Item>
          
          <Form.Item
            name="imageUrl"
             label="Ảnh URL"
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
             label="Ảnh bìa URL"
          >
            <Input placeholder="https://example.com/thumbnail.jpg" />
          </Form.Item>
          
          <Form.Item
            name="tags"
             label="Thẻ (tags)"
           >
             <Input placeholder="Nhập các thẻ, cách nhau bằng dấu phẩy" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Cập nhật tin tức
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BlogPages; 