import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_BASE = '/api/admin/users';

const roleMap = {
  STUDENT: 'Học sinh',
  TEACHER: 'Giáo viên',
  MANAGER: 'Quản lý',
  ACCOUNTANT: 'Kế toán',
  ADMIN: 'Quản trị viên',
};

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    fullName: '',
    role: 'ADMIN',
  });
  const [editId, setEditId] = useState(null);

  // Fetch all users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_BASE);
      setUsers(res.data);
      setError('');
    } catch (err) {
      setError('Lỗi tải danh sách người dùng!');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);


  // Handle add/edit user
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_BASE}/${editId}`, formData);
      } else {
        await axios.post(API_BASE, formData);
      }
      setShowForm(false);
      setEditId(null);
      setFormData({ username: '', password: '', email: '', fullName: '', role: 'STUDENT' });
      fetchUsers();
    } catch (err) {
      setError('Lỗi lưu thông tin người dùng!');
    }
  };

  // Handle delete user
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) return;
    try {
      await axios.delete(`${API_BASE}/${id}`);
      alert('Xóa tài khoản thành công!');
      fetchUsers();
    } catch {
      setError('Lỗi xóa người dùng!');
    }
  };

  // Handle edit user
  const handleEdit = (user) => {
    setEditId(user.id);
    setFormData({
      username: user.username,
      password: '', // Để trống, nếu muốn đổi thì nhập mới
      email: user.email,
      fullName: user.fullName,
      role: user.role,
    });
    setShowForm(true);
  };

  // Handle role change
  const handleRoleChange = async (id, newRole) => {
    if (!window.confirm('Bạn có chắc chắn muốn đổi vai trò cho tài khoản này?')) return;
    try {
      await axios.put(`${API_BASE}/${id}/role`, { role: newRole });
      alert('Đổi vai trò thành công!');
      fetchUsers();
    } catch {
      setError('Lỗi đổi vai trò!');
    }
  };

  // Handle reset password
  const handleResetPassword = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn reset mật khẩu cho tài khoản này?')) return;
    try {
      const res = await axios.post(`${API_BASE}/${id}/reset-password`);
      alert(`Mật khẩu mới: ${res.data}`);
    } catch {
      setError('Lỗi reset mật khẩu!');
    }
  };

  // Handle lock/unlock
  const handleLock = async (id, lock) => {
    const action = lock ? 'khóa' : 'mở khóa';
    if (!window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) return;
    try {
      if (lock) {
        await axios.post(`${API_BASE}/${id}/lock`);
      } else {
        await axios.post(`${API_BASE}/${id}/unlock`);
      }
      alert(`${lock ? 'Khóa' : 'Mở khóa'} tài khoản thành công!`);
      fetchUsers();
    } catch {
      setError('Lỗi khóa/mở khóa tài khoản!');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Quản lý người dùng</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <button className="mb-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => { setShowForm(true); setEditId(null); setFormData({ username: '', password: '', email: '', fullName: '', role: 'STUDENT' }); }}>Thêm người dùng</button>
      {showForm && (
        <form className="bg-white p-4 rounded shadow mb-4" onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="block">Tên đăng nhập</label>
            <input className="border p-2 w-full" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required disabled={!!editId} />
          </div>
          <div className="mb-2">
            <label className="block">Mật khẩu {editId ? '(bỏ qua nếu không đổi)' : ''}</label>
            <input className="border p-2 w-full" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!editId} />
          </div>
          <div className="mb-2">
            <label className="block">Email</label>
            <input className="border p-2 w-full" type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
          </div>
          <div className="mb-2">
            <label className="block">Họ tên</label>
            <input className="border p-2 w-full" value={formData.fullName} onChange={e => setFormData({ ...formData, fullName: e.target.value })} required />
          </div>
          <div className="mb-2">
            <label className="block">Vai trò</label>
            <select className="border p-2 w-full" value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
              {Object.keys(roleMap).map(r => <option key={r} value={r}>{roleMap[r]}</option>)}
            </select>
          </div>
          <button className="px-4 py-2 bg-green-600 text-white rounded mr-2" type="submit">Lưu</button>
          <button className="px-4 py-2 bg-gray-400 text-white rounded" type="button" onClick={() => setShowForm(false)}>Hủy</button>
        </form>
      )}
      {loading ? <div className="text-center text-gray-600 py-6">Đang tải...</div> : (
        <div className="overflow-x-auto rounded-lg shadow">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th className="border px-4 py-2 text-left font-semibold text-gray-700">Tên đăng nhập</th>
                <th className="border px-4 py-2 text-left font-semibold text-gray-700">Email</th>
                <th className="border px-4 py-2 text-left font-semibold text-gray-700">Họ tên</th>
                <th className="border px-4 py-2 text-left font-semibold text-gray-700">Vai trò</th>
                <th className="border px-4 py-2 text-left font-semibold text-gray-700">Trạng thái</th>
                <th className="border px-4 py-2 text-center font-semibold text-gray-700">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="hover:bg-blue-50 transition">
                  <td className="border px-4 py-2">{user.username}</td>
                  <td className="border px-4 py-2">{user.email}</td>
                  <td className="border px-4 py-2">{user.fullName}</td>
                  <td className="border px-4 py-2">
                    <select 
                      value={user.role} 
                      onChange={e => handleRoleChange(user.id, e.target.value)}
                      className="border rounded px-2 py-1 bg-white hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-300"
                    >
                      {Object.keys(roleMap).map(r => <option key={r} value={r}>{roleMap[r]}</option>)}
                    </select>
                  </td>
                  <td className="border px-4 py-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${user.status === '0' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                      {user.status === '0' ? 'Khoá' : 'Hoạt động'}
                    </span>
                  </td>
                  <td className="border px-4 py-2 flex flex-wrap gap-2 justify-center">
                    <button className="px-3 py-1 bg-yellow-400 text-white rounded shadow hover:bg-yellow-500 transition" onClick={() => handleEdit(user)}>Sửa</button>
                    <button className="px-3 py-1 bg-red-500 text-white rounded shadow hover:bg-red-600 transition" onClick={() => handleDelete(user.id)}>Xóa</button>
                    <button className="px-3 py-1 bg-blue-500 text-white rounded shadow hover:bg-blue-600 transition" onClick={() => handleResetPassword(user.id)}>Reset mật khẩu</button>
                    {user.status === '1' ? (
                      <button className="px-3 py-1 bg-gray-700 text-white rounded shadow hover:bg-gray-900 transition" onClick={() => handleLock(user.id, true)}>Khoá</button>
                    ) : (
                      <button className="px-3 py-1 bg-green-600 text-white rounded shadow hover:bg-green-700 transition" onClick={() => handleLock(user.id, false)}>Mở khoá</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
