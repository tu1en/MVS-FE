import { message } from 'antd';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const roleLabels = {
  ADMIN: 'Quản trị viên',
  MANAGER: 'Quản lý',
  TEACHER: 'Giáo viên',
  STUDENT: 'Học viên',
  GUEST: 'Khách',
};

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loi, setLoi] = useState(null);
  const [dangDangNhap, setDangDangNhap] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const roleParam = searchParams.get('role')?.toUpperCase() || 'GUEST';
  const roleLabel = roleLabels[roleParam] || 'Khách';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoi(null);
    setDangDangNhap(true);
    try {
      const res = await axios.post('http://localhost:8088/api/auth/login', {
        username: email,
        password: matKhau,
        role: roleParam,
      });

      const data = res.data;
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);

      toast.success('Đăng nhập thành công!');

      switch (data.role) {
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'TEACHER':
          navigate('/teacher');
          break;
        case 'STUDENT':
          navigate('/student');
          break;
        default:
          navigate('/');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setLoi('Tài khoản hoặc mật khẩu không đúng');
      toast.error('Tài khoản hoặc mật khẩu không đúng!');
      setEmail('');
      setMatKhau('');
    } finally {
      setDangDangNhap(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 justify-center items-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img
            alt="Logo"
            src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
            className="mx-auto h-12 w-auto"
          />
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-gray-900">
            Đăng nhập với vai trò: {roleLabel}
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Tên đăng nhập / Email
              </label>
              <input
                id="email"
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <div className="flex justify-between">
                <label htmlFor="matKhau" className="block text-sm font-medium text-gray-900">
                  Mật khẩu
                </label>
                <a href="/quen-mat-khau" className="text-sm text-indigo-600 hover:text-indigo-500">
                  Quên mật khẩu?
                </a>
              </div>
              <input
                id="matKhau"
                type="password"
                required
                value={matKhau}
                onChange={(e) => setMatKhau(e.target.value)}
                className="mt-2 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder-gray-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              {loi && <p className="text-sm text-red-500 mt-1">{loi}</p>}
            </div>

            <div>
              <button
                type="submit"
                disabled={dangDangNhap}
                className={`w-full flex justify-center rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm ${
                  dangDangNhap
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500'
                } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600`}
              >
                {dangDangNhap ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500">
              Gửi yêu cầu đăng ký
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
