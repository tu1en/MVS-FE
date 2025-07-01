import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { auth } from '../config/firebase'; // Đảm bảo file cấu hình firebase đúng
import { ROLE } from '../constants/constants';
import { loginSuccess } from '../store/slices/authSlice';
import RegisterModal from '../components/RegisterModal';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loi, setLoi] = useState(null);
  const [dangDangNhap, setDangDangNhap] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(''); // Lưu email Google khi đăng nhập thất bại
  const navigate = useNavigate();

  const baseUrl = process.env.REACT_APP_BASE_URL || 'http://localhost:8088';
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoi(null);
    setDangDangNhap(true);
    console.log('Đang đăng nhập với:', email, 'URL:', `${baseUrl}/auth/login`);
    
    try {
<<<<<<< Updated upstream
      const res = await fetch(`${baseUrl}/auth/login`, {
=======
      const res = await fetch('/api/auth/login', {
>>>>>>> Stashed changes
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: email,
          password: matKhau,
        }),
      });
      
      console.log('Response status:', res.status);
      
      if (res.ok) {
        const data = await res.json();
        console.log('Login response data:', data);
        
        if (!data.token || !data.role) {
          console.error('Missing token or role in response:', data);
          setLoi('Đăng nhập thất bại: Thiếu thông tin từ server');
          toast.error('Đăng nhập thất bại: Thiếu thông tin từ server');
          return;
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userId', data.userId);
        dispatch(loginSuccess({ token: data.token, role: data.role, userId: data.userId }));
        toast.success('Đăng nhập thành công!');

        console.log('Navigating based on role:', data.role);
        switch (data.role) {
          case ROLE.ADMIN: //ADMIN
            navigate('/admin');
            break;
          case ROLE.TEACHER: //TEACHER
            navigate('/teacher');
            break;
          case ROLE.STUDENT: //STUDENT
            navigate('/student');
            break;
          case ROLE.MANAGER: //MANAGER
            navigate('/manager');
            break;
          case ROLE.ACCOUNTANT: //ACCOUNTANT
            navigate('/accounting/dashboard');
            break;
          default:
            console.warn('Unknown role:', data.role);
            navigate('/');
        }
      } else {
        // Try to parse error response
        try {
          const errorData = await res.json();
          console.error('Error response:', errorData);
          setLoi(errorData.message || 'Tài khoản hoặc mật khẩu không đúng');
          toast.error(errorData.message || 'Tài khoản hoặc mật khẩu không đúng!');
        } catch (e) {
          console.error('Failed to parse error response', e);
          setLoi('Tài khoản hoặc mật khẩu không đúng');
          toast.error('Tài khoản hoặc mật khẩu không đúng!');
        }
        setEmail('');
        setMatKhau('');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      setLoi('Đã xảy ra lỗi khi đăng nhập');
      toast.error('Đã xảy ra lỗi khi đăng nhập!');
      setEmail('');
      setMatKhau('');
    } finally {
      setDangDangNhap(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('Starting Google sign-in process...');
      setDangDangNhap(true);
      
      // 1. Sign in with Google
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Google sign-in successful, user:', user.email);
      
      // 2. Get and verify ID token
      const idToken = await user.getIdToken();
      console.log('Obtained Google ID token:', idToken.substring(0, 20) + '...');
      
      // 3. Send to backend for verification
      console.log('Sending token to backend for verification...', `${baseUrl}/auth/google-login`);
      const res = await fetch(`${baseUrl}/auth/google-login`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ 
          idToken,
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL
        })
      });
  
      console.log('Google login response status:', res.status);
      const data = await res.json();
      console.log('Backend response:', data);
      
      if (res.ok) {
        // 4. Verify token and role in response
        if (!data.token || !data.role) {
          console.error('Missing token or role in response:', data);
          toast.error('Đăng nhập thất bại: Thiếu thông tin từ server');
          throw new Error('Missing token or role in response');
        }
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('email', user.email); // Store email for form autofill
        dispatch(loginSuccess({ token: data.token, role: data.role, userId: data.userId }));
        console.log('Token and role stored in localStorage');
        
        // 6. Verify navigation
        console.log(`Navigating to ${data.role} dashboard...`);
        switch (data.role) {
          case ROLE.ADMIN: //ADMIN
            navigate('/admin');
            break;
          case ROLE.MANAGER: //MANAGER
            navigate('/manager');
            break;
          case ROLE.TEACHER: //TEACHER
            navigate('/teacher');
            break;
          case ROLE.STUDENT: //STUDENT
            navigate('/student');
            break;
          case ROLE.ACCOUNTANT: //ACCOUNTANT
            navigate('/accounting/dashboard');
            break;
          default:
            navigate('/');
        }
      } else {
        // Xử lý khi tài khoản không tồn tại
        if (res.status === 404 && data.message) {
          console.error('Account not registered:', data.message);
          toast.error(data.message);
          
          // Lưu email Google để có thể sử dụng trong form đăng ký
          if (data.email) {
            setGoogleEmail(data.email);
            setEmail(data.email); // Auto-fill the login form with Google email
          }
          
          // Hiển thị modal đăng ký
          setRegisterModalVisible(true);
        } else {
          console.error('Backend error:', data);
          toast.error(`Đăng nhập Google thất bại: ${data.message || 'Lỗi không xác định'}`);
        }
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Đăng nhập Google thất bại!');
    } finally {
      setDangDangNhap(false);
    }
  };

  const openRegisterModal = () => {
    setRegisterModalVisible(true);
  };

  const closeRegisterModal = () => {
    setRegisterModalVisible(false);
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
            Chào mừng bạn đến với Minh Việt Education
          </h2>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                Tên đăng nhập
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
                <button 
                  type="button"
                  onClick={() => navigate('/forgot-password')} 
                  className="text-sm text-indigo-600 hover:text-indigo-500 cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
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

          <button
            onClick={handleGoogleSignIn}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-gray-300 hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
              alt="Google logo"
              className="w-5 h-5"
            />
            Đăng nhập với Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            Chưa có tài khoản?{' '}
            <button 
              type="button"
              onClick={openRegisterModal}
              className="font-semibold text-indigo-600 hover:text-indigo-500 cursor-pointer"
            >
              Gửi yêu cầu đăng ký
            </button>
          </p>
        </div>
      </div>
      
      {/* Modal đăng ký */}
      <RegisterModal open={registerModalVisible} onClose={closeRegisterModal} initialEmail={googleEmail} />
    </div>
  );
}
