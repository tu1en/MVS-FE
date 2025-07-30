import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import RegisterModal from '../components/RegisterModal';
import { auth } from '../config/firebase'; // Đảm bảo file cấu hình firebase đúng
import { ROLE } from '../constants/constants';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import authService from '../services/authService'; // Import the new authService
import { loginSuccess } from '../store/slices/authSlice';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const { login, syncLoginState } = useAuth(); // Use the login function from AuthContext
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loi, setLoi] = useState(null);  const [dangDangNhap, setDangDangNhap] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(''); // Lưu email Google khi đăng nhập thất bại
  const navigate = useNavigate();

  // Use relative path for proxy to work correctly
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoi(null);
    setDangDangNhap(true);
    
    try {
      const userData = await authService.login(email, matKhau);
      
      // Store in AuthContext (this will also store in localStorage)
      login(userData);
      
      // Force a sync with localStorage to ensure state is up-to-date
      syncLoginState();

      // Also dispatch to Redux for components using Redux
      dispatch(loginSuccess(userData));
      
      toast.success('Đăng nhập thành công!');

      console.log('Navigating based on role:', userData.role);
      switch (userData.role) {
        case ROLE.ADMIN:
          navigate('/admin');
          break;
        case ROLE.TEACHER:
          navigate('/teacher');
          break;
        case ROLE.STUDENT:
          navigate('/student');
          break;
        case ROLE.MANAGER:
          navigate('/manager');
          break;
        case ROLE.ACCOUNTANT:
          console.log(`Navigating to ACCOUNTANT dashboard...`);
          navigate('/accountant');
          break;
        default:
          console.warn('Unknown role:', userData.role);
          navigate('/');
      }
    } catch (err) {
      console.error('Lỗi đăng nhập:', err);
      const errorMessage = err.message || 'Đã xảy ra lỗi khi đăng nhập.';
      setLoi(errorMessage);
      toast.error(errorMessage);
      setEmail('');
      setMatKhau('');
    } finally {
      setDangDangNhap(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      console.log('🚀 Starting Google sign-in process...');
      setDangDangNhap(true);

      // Check if Firebase is properly initialized
      if (!auth) {
        throw new Error('Firebase Auth not initialized');
      }

      // 1. Sign in with Google
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      console.log('📱 Opening Google sign-in popup...');
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('✅ Google sign-in successful, user:', user.email);
      
      // 2. Get ID token
      const idToken = await user.getIdToken();
      
      // 3. Send to backend via authService
      const userData = await authService.googleLogin(idToken, user);

      // Store in AuthContext (this will also store in localStorage)
      login(userData);
      
      // Force a sync with localStorage to ensure state is up-to-date
      syncLoginState();
      
      // Also dispatch to Redux for components using Redux
      dispatch(loginSuccess(userData));
      
      console.log('Token and role stored in localStorage');
      
      // 6. Verify navigation
      console.log(`Navigating to ${userData.role} dashboard...`);
      switch (userData.role) {
        case ROLE.ADMIN:
          navigate('/admin');
          break;
        case ROLE.MANAGER:
          navigate('/manager');
          break;
        case ROLE.TEACHER:
          navigate('/teacher');
          break;
        case ROLE.STUDENT:
          navigate('/student');
          break;
        case ROLE.ACCOUNTANT:
          console.log(`Navigating to ACCOUNTANT dashboard...`);
          navigate('/accountant');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
        console.error('❌ Google login error:', error);

        // Handle Firebase Auth errors specifically
        if (error.code) {
          switch (error.code) {
            case 'auth/api-key-not-valid':
              console.error('🔑 Firebase API key is invalid');
              toast.error('Lỗi cấu hình Firebase. Vui lòng liên hệ quản trị viên.');
              break;
            case 'auth/popup-closed-by-user':
              console.log('👤 User closed the popup');
              toast.info('Đăng nhập bị hủy');
              break;
            case 'auth/popup-blocked':
              console.error('🚫 Popup was blocked');
              toast.error('Popup bị chặn. Vui lòng cho phép popup và thử lại.');
              break;
            case 'auth/cancelled-popup-request':
              console.log('🔄 Popup request was cancelled');
              break;
            default:
              console.error('🔥 Firebase Auth error:', error.code, error.message);
              toast.error(`Lỗi Firebase: ${error.message}`);
          }
        } else if (error.status === 404 && error.message) {
            // Handle specific error from googleLogin service
            console.error('Account not registered:', error.message);
            toast.error(error.message);
            if (error.email) {
                setGoogleEmail(error.email);
                setEmail(error.email);
            }
            setRegisterModalVisible(true);
        } else {
            console.error('General error:', error);
            toast.error(error.message || 'Đăng nhập Google thất bại!');
        }
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
    <div className="flex min-h-screen bg-gray-50 justify-center items-start pt-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <img
            alt="Logo"
            src={process.env.PUBLIC_URL + '/logo/mvs.jpg'}
            className="mx-auto h-64 w-auto"
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
