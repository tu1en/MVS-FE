import {
    DeleteOutlined,
    DownloadOutlined,
    EditOutlined,
    PlusOutlined,
    UploadOutlined
} from '@ant-design/icons';
import {
    Button,
    Card,
    DatePicker,
    Form,
    Input,
    message,
    Modal,
    Popconfirm,
    Space,
    Spin,
    Table,
    Tag,
    Typography,
    Upload
} from 'antd';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { teacherLectureService } from '../../services/teacherLectureService';

const { Title } = Typography;
const { TextArea } = Input;

const TeacherLectures = () => {
  const { courseId } = useParams();
  
  // State
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLecture, setEditingLecture] = useState(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);

  useEffect(() => {
    if (courseId) {
      fetchLectures();
    }
  }, [courseId]);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const data = await teacherLectureService.getClassroomLectures(courseId);
      setLectures(data);
    } catch (error) {
      console.error('Error fetching lectures:', error);
      message.error('Không thể tải danh sách bài giảng');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLecture = () => {
    setEditingLecture(null);
    form.resetFields();
    setFileList([]);
    setModalVisible(true);
  };

  const handleEditLecture = (lecture) => {
    setEditingLecture(lecture);
    form.setFieldsValue({
      title: lecture.title,
      description: lecture.description,
      date: lecture.date ? dayjs(lecture.date) : null
    });
    setFileList([]);
    setModalVisible(true);
  };

  const handleDeleteLecture = async (lectureId) => {
    try {
      await teacherLectureService.deleteLecture(lectureId);
      message.success('Đã xóa bài giảng thành công');
      fetchLectures();
    } catch (error) {
      console.error('Error deleting lecture:', error);
      message.error('Không thể xóa bài giảng');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const lectureData = {
        ...values,
        classroomId: courseId,
        date: values.date ? values.date.toISOString() : null
      };

      let result;
      if (editingLecture) {
        result = await teacherLectureService.updateLecture(editingLecture.id, lectureData);
        message.success('Đã cập nhật bài giảng thành công');
      } else {
        result = await teacherLectureService.createLecture(lectureData);
        message.success('Đã tạo bài giảng thành công');
      }

      // Upload materials if any
      if (fileList.length > 0) {
        const formData = new FormData();
        fileList.forEach(file => {
          formData.append('files', file.originFileObj);
        });
        formData.append('lectureId', result.id);

        await teacherLectureService.uploadLectureMaterials(formData);
        message.success('Đã tải lên tài liệu thành công');
      }

      setModalVisible(false);
      form.resetFields();
      setFileList([]);
      fetchLectures();
    } catch (error) {
      console.error('Error saving lecture:', error);
      message.error('Không thể lưu bài giảng');
    }
  };

  const handleFileChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleDownloadMaterial = (materialUrl, filename) => {
    const link = document.createElement('a');
    link.href = materialUrl;
    link.download = filename || 'material';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const columns = [
    {
      title: 'Tiêu đề bài giảng',
      dataIndex: 'title',
      key: 'title',
      width: '25%'
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      width: '30%',
      ellipsis: true
    },
    {
      title: 'Ngày giảng',
      dataIndex: 'date',
      key: 'date',
      width: '15%',
      render: (date) => date ? dayjs(date).format('DD/MM/YYYY HH:mm') : 'Chưa xác định'
    },
    {
      title: 'Tài liệu',
      dataIndex: 'materials',
      key: 'materials',
      width: '15%',
      render: (materials) => (
        <Space direction="vertical" size="small">
          {materials && materials.length > 0 ? (
            materials.map((material, index) => (
              <Button
                key={index}
                size="small"
                icon={<DownloadOutlined />}
                onClick={() => handleDownloadMaterial(material.url, material.filename)}
              >
                {material.filename || `Tài liệu ${index + 1}`}
              </Button>
            ))
          ) : (
            <Tag color="default">Chưa có tài liệu</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: '15%',
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditLecture(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài giảng này?"
            onConfirm={() => handleDeleteLecture(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
            >
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const uploadProps = {
    multiple: true,
    beforeUpload: () => false, // Prevent auto upload
    onChange: handleFileChange,
    fileList,
    accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.mp4,.mp3'
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '20px' }}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>Quản lý bài giảng</Title>
        
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={lectures}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} bài giảng`
          }}
        />
      </Card>

      {/* Create/Edit Modal */}
      <Modal
        title={editingLecture ? 'Chỉnh sửa bài giảng' : 'Tạo bài giảng mới'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
          setFileList([]);
        }}
        width={700}
        okText={editingLecture ? 'Cập nhật' : 'Tạo bài giảng'}
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="Tiêu đề bài giảng"
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề bài giảng' }]}
          >
            <Input placeholder="Nhập tiêu đề bài giảng..." />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả bài giảng' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Nhập mô tả chi tiết về bài giảng..."
              maxLength={1000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày và giờ giảng"
            rules={[{ required: true, message: 'Vui lòng chọn ngày giảng' }]}
          >
            <DatePicker 
              showTime
              format="DD/MM/YYYY HH:mm"
              placeholder="Chọn ngày và giờ giảng"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item
            label="Tài liệu bài giảng"
          >
            <Upload.Dragger {...uploadProps}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">Nhấp hoặc kéo thả file vào đây để tải lên</p>
              <p className="ant-upload-hint">
                Hỗ trợ: PDF, DOC, PPT, Excel, hình ảnh, video, audio
              </p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TeacherLectures;
