import { useEffect, useState } from 'react';
// import api service here

const AdminBlogManagement = () => {
    const [blogs, setBlogs] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // TODO: Gọi API GET /api/v1/blogs để lấy danh sách blog
        // Ví dụ: blogApiService.getAll().then(res => setBlogs(res.data));
        console.log("Fetching blogs for admin...");
        setIsLoading(false);
    }, []);

    const handleAdd = () => {
        // TODO: Mở modal/form để thêm blog mới
        // Gọi API POST /api/v1/admin/add-new-blog
        console.log("Add new blog clicked");
    };

    const handleEdit = (blogId) => {
        // TODO: Mở modal/form để sửa blog
        // Gọi API PUT /api/v1/admin/edit-blog/{id}
        console.log(`Edit blog ${blogId} clicked`);
    };

    const handleDelete = (blogId) => {
        // TODO: Hiển thị xác nhận và gọi API DELETE /api/v1/admin/delete-blog/{id}
        console.log(`Delete blog ${blogId} clicked`);
    };

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Blog Management</h1>
                <button onClick={handleAdd} className="bg-blue-500 text-white px-4 py-2 rounded">
                    Add New Blog
                </button>
            </div>
            {/* TODO: Hiển thị danh sách blog trong bảng */}
            <p>Blog list will be displayed here.</p>
        </div>
    );
};

export default AdminBlogManagement;
