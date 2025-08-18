import {
    ArrowLeftOutlined,
    CalendarOutlined,
    CheckCircleOutlined,
    ClockCircleOutlined,
    ExclamationCircleOutlined,
    FileTextOutlined,
    PaperClipOutlined,
    UploadOutlined
} from '@ant-design/icons';
import { Button, Card, Divider, Form, Input, Space, Spin, Tag, Typography, Upload, message } from 'antd';
import moment from 'moment';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import WysiwygEditor from '../../components/common/WysiwygEditor';
import { ROLE } from '../../constants/constants';
import { useAuth } from '../../context/AuthContext';
import AssignmentService from '../../services/assignmentService';
import FileUploadService from '../../services/fileUploadService';
import SubmissionService from '../../services/submissionService';
import UTF8EncodingFixer from '../../utils/utf8EncodingFixer';

const { Title, Text, Paragraph } = Typography;

const AssignmentDetail = () => {
    const { assignmentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [assignment, setAssignment] = useState(null);
    const [submission, setSubmission] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [fileList, setFileList] = useState([]);
    const [form] = Form.useForm();
    const [isDeadlinePassed, setIsDeadlinePassed] = useState(false);
    const [richTextContent, setRichTextContent] = useState('');

    const fetchAssignmentData = async () => {
        setIsLoading(true);
        try {
            const assignmentDetails = await AssignmentService.getAssignmentById(assignmentId);

            if (!assignmentDetails) {
                throw new Error("Assignment data is null or undefined.");
            }

            setAssignment(assignmentDetails);

            if (moment().isAfter(moment(assignmentDetails.dueDate))) {
                setIsDeadlinePassed(true);
            }

            if (user?.id) {
                try {
                    console.log(`Fetching submission for assignment ${assignmentId} and student ${user.id}`);
                    const studentSubmission = await SubmissionService.getStudentSubmission(assignmentId, user.id);
                    console.log('Student submission data:', studentSubmission);
                    
                    // Fix UTF-8 encoding issues in submission data
                    const fixedSubmission = UTF8EncodingFixer.fixObjectTextFields(studentSubmission);
                    
                    setSubmission(fixedSubmission);
                    if (fixedSubmission && fixedSubmission.attachments) {
                        setFileList(fixedSubmission.attachments.map((att, index) => ({
                            uid: att.id || -index,
                            name: att.fileName,
                            status: 'done',
                            url: att.downloadUrl,
                        })));
                    }
                } catch (e) {
                    console.error('Error fetching student submission:', e);
                    if (e.response && e.response.status === 404) {
                        console.log('No submission found for this student');
                        setSubmission(null);
                    } else {
                        throw e;
                    }
                }
            }
            setError(null);
        } catch (err) {
            console.error('Failed to fetch assignment data:', err);
            setError('Không thể tải dữ liệu bài tập.');
            message.error('Không thể tải dữ liệu bài tập.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (assignmentId && user?.id) {
            fetchAssignmentData();
        }
    }, [assignmentId, user]);


    const getAssignmentStatus = (dueDate) => {
        if (!dueDate) return { text: "Không có hạn nộp", color: "gray" };
        const now = moment();
        const due = moment(dueDate);

        if (now.isAfter(due)) return { text: "Hết hạn", color: "red", icon: <ExclamationCircleOutlined /> };

        const diffDays = due.diff(now, 'days');

        if (diffDays < 1) return { text: "Sắp hết hạn", color: "orange", icon: <ClockCircleOutlined /> };
        if (diffDays <= 3) return { text: "Còn ít thời gian", color: "gold", icon: <ClockCircleOutlined /> };
        return { text: "Còn thời gian", color: "green", icon: <CheckCircleOutlined /> };
    };

    const formatDate = (dateString) => {
        if (!dateString || !moment(dateString).isValid()) {
            return "N/A";
        }
        return moment(dateString).format('HH:mm [ngày] DD/MM/YYYY');
    };

    const handleFileChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
    };

    const handleSubmit = async (values) => {
        setSubmitting(true);
        try {
            // Check if there are files to upload
            let attachments = [];
            if (fileList && fileList.length > 0) {
                try {
                    // Upload each file that has originFileObj (new files)
                    const uploadPromises = fileList
                        .filter(file => file.originFileObj)
                        .map(async (file) => {
                            console.log('Uploading file (Firebase preferred):', file.originFileObj);
                            // Wrap FileUploadService (callback-style) to Promise
                            const uploaded = await new Promise((resolve, reject) => {
                                FileUploadService.uploadFile({
                                    file: file.originFileObj,
                                    onSuccess: (data) => resolve(data),
                                    onError: (err) => reject(err),
                                    onProgress: () => {}
                                }, 'assignments');
                            });
                            console.log('File upload response:', uploaded);
                            return {
                                fileName: uploaded?.name || file.originFileObj.name,
                                fileUrl: uploaded?.url
                            };
                        });
                    
                    const uploadedFiles = await Promise.all(uploadPromises);
                    attachments = uploadedFiles;
                    console.log('All files uploaded:', attachments);
                } catch (uploadError) {
                    console.error('Error uploading files:', uploadError);
                    message.error('Không thể tải lên tệp đính kèm. Vui lòng thử lại.');
                    setSubmitting(false);
                    return;
                }
            }

            // Prepare submission data
            const submissionData = {
                assignmentId: parseInt(assignmentId, 10),
                comment: values.comment || '',
                richTextContent: richTextContent || '',
                attachments: attachments,
            };

            console.log('Submitting assignment data:', submissionData);

            // Create or update submission
            let result;
            if (submission && submission.id) {
                result = await SubmissionService.updateSubmission(submission.id, submissionData);
            } else {
                result = await SubmissionService.createSubmission(submissionData);
            }

            console.log('Submission result:', result);
            message.success('Bài tập đã được nộp thành công!');
            setSubmission(result);
            fetchAssignmentData(); // Refresh all data

        } catch (err) {
            console.error("Submission error:", err);
            message.error(err.response?.data?.message || 'Nộp bài thất bại. Vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };


    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (error || !assignment) {
        return (
            <div className="p-8">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => {
                        const token = localStorage.getItem('token');
                        const role = localStorage.getItem('role');
                        if (!token) {
                            navigate('/');
                        } else {
                            switch (role) {
                                case ROLE.ADMIN:
                                    navigate('/admin');
                                    break;
                                case ROLE.TEACHER:
                                    navigate('/teacher');
                                    break;
                                case ROLE.MANAGER:
                                    navigate('/manager');
                                    break;
                                case ROLE.STUDENT:
                                    navigate('/student');
                                    break;
                                case ROLE.ACCOUNTANT:
                                    navigate('/accountant');
                                    break;
                                default:
                                    navigate('/');
                            }
                        }
                    }}
                    className="mb-4"
                >
                    Quay lại
                </Button>
                <div className="text-center">
                    <Text type="danger" className="text-lg">
                        {error || 'Không tìm thấy thông tin bài tập.'}
                    </Text>
                </div>
            </div>
        );
    }

    const status = getAssignmentStatus(assignment.dueDate);
    const canSubmit = !isDeadlinePassed || (submission && !submission.score);


    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => {
                        const token = localStorage.getItem('token');
                        const role = localStorage.getItem('role');
                        if (!token) {
                            navigate('/');
                        } else {
                            switch (role) {
                                case ROLE.ADMIN:
                                    navigate('/admin');
                                    break;
                                case ROLE.TEACHER:
                                    navigate('/teacher');
                                    break;
                                case ROLE.MANAGER:
                                    navigate('/manager');
                                    break;
                                case ROLE.STUDENT:
                                    navigate('/student');
                                    break;
                                case ROLE.ACCOUNTANT:
                                    navigate('/accountant');
                                    break;
                                default:
                                    navigate('/');
                            }
                        }
                    }}
                    className="mb-4"
                >
                    Quay lại
                </Button>

                <div className="flex items-center gap-4 mb-4">
                    <FileTextOutlined className="text-3xl text-blue-600" />
                    <Title level={2} className="mb-0 flex-grow">{assignment.title}</Title>
                    <Tag color={status.color} icon={status.icon} className="text-sm font-semibold px-3 py-1 rounded-full">
                        {status.text}
                    </Tag>
                </div>
            </div>

            {/* Assignment Details */}
            <Card className="mb-6 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div className="flex items-start gap-3">
                        <CalendarOutlined className="text-blue-500 text-xl mt-1" />
                        <div>
                            <Text type="secondary" className="block font-medium">Hạn nộp</Text>
                            <Text strong className="text-base">{formatDate(assignment.dueDate)}</Text>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <CheckCircleOutlined className="text-green-500 text-xl mt-1" />
                        <div>
                            <Text type="secondary" className="block font-medium">Điểm tối đa</Text>
                            <Text strong className="text-base">{assignment.points || '100'}</Text>
                        </div>
                    </div>
                </div>

                <Divider />

                <div>
                    <Title level={4}>Mô tả bài tập</Title>
                    <Paragraph className="whitespace-pre-line text-base">
                        {assignment.description}
                    </Paragraph>
                </div>

                {assignment.attachments && assignment.attachments.length > 0 && (
                    <>
                        <Divider />
                        <Title level={5}>Tài liệu đính kèm</Title>
                        <Space direction="vertical">
                            {assignment.attachments.map(att => (
                                <Button
                                    key={att.id}
                                    type="link"
                                    icon={<PaperClipOutlined />}
                                    href={att.downloadUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {att.fileName}
                                </Button>
                            ))}
                        </Space>
                    </>
                )}
            </Card>

            {/* Submission Area */}
            <Card className="shadow-sm">
                <Title level={3}>Bài nộp của bạn</Title>
                <Divider />

                {submission ? (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 text-green-700 font-semibold mb-2">
                            <CheckCircleOutlined />
                            <span>Đã nộp bài lúc: {formatDate(submission.submittedAt)}</span>
                        </div>
                        {submission.score && (
                            <div className="font-semibold">
                                <Text>Điểm số: </Text>
                                <Text strong className="text-blue-600 text-lg">{submission.score} / {assignment.points || 100}</Text>
                            </div>
                        )}
                         {submission.feedback && (
                            <div className="mt-2">
                                <Text strong>Nhận xét từ giáo viên:</Text>
                                <Paragraph className="mt-1 p-2 bg-gray-100 rounded">
                                    {UTF8EncodingFixer.normalizeVietnameseText(submission.feedback)}
                                </Paragraph>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                         <div className="flex items-center gap-2 text-yellow-700 font-semibold">
                            <ClockCircleOutlined />
                            <span>Chưa nộp bài</span>
                        </div>
                    </div>
                )}


                {canSubmit && (
                    <Form form={form} onFinish={handleSubmit} layout="vertical">
                        <Form.Item
                            name="attachments"
                            label={<Text strong>Tệp đính kèm</Text>}
                            help={isDeadlinePassed ? "Đã quá hạn nộp, nhưng bạn vẫn có thể nộp lại nếu chưa có điểm." : "Kéo thả hoặc nhấn để chọn file."}
                        >
                            <Upload.Dragger
                                fileList={fileList}
                                onChange={handleFileChange}
                                beforeUpload={() => false} // Prevent auto-upload
                                multiple
                            >
                                <p className="ant-upload-drag-icon">
                                    <UploadOutlined />
                                </p>
                                <p className="ant-upload-text">Nhấn hoặc kéo file vào đây để tải lên</p>
                                <p className="ant-upload-hint">
                                    Bạn có thể nộp nhiều file cùng lúc.
                                </p>
                            </Upload.Dragger>
                        </Form.Item>

                        <Form.Item
                            name="comment"
                            label={<Text strong>Bình luận (tùy chọn)</Text>}
                        >
                            <Input.TextArea rows={3} placeholder="Bình luận ngắn gọn..." />
                        </Form.Item>

                        <Form.Item
                            label={<Text strong>Nội dung bài làm (Rich Text Editor)</Text>}
                        >
                            <WysiwygEditor
                                value={richTextContent}
                                onChange={setRichTextContent}
                                placeholder="Nhập nội dung bài làm với formatting, hình ảnh, file đính kèm..."
                                height="300px"
                                // allowFileUpload={true}
                                // allowImageUpload={true}
                                className="w-full"
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={submitting}
                                disabled={fileList.length === 0 && !submission?.id}
                                size="large"
                            >
                                {submission ? 'Nộp lại bài' : 'Nộp bài'}
                            </Button>
                        </Form.Item>
                    </Form>
                )}

                {!canSubmit && submission && (
                     <div className="mt-4">
                        <Title level={5}>Các file đã nộp</Title>
                        {submission.attachments?.map(att => (
                             <Button
                                key={att.id}
                                type="link"
                                icon={<PaperClipOutlined />}
                                href={att.downloadUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {att.fileName}
                            </Button>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AssignmentDetail;
