import { signInWithPopup } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import RegisterModal from '../components/RegisterModal';
import { auth, googleProvider } from '../config/firebase'; // Đảm bảo file cấu hình firebase đúng
import { ROLE } from '../constants/constants';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook
import authService from '../services/authService'; // Import the new authService
import ProfileDataService from '../services/profileDataService';
import { loginSuccess } from '../store/slices/authSlice';
import { isUserLoggedIn } from '../utils/authUtils';

export default function LoginScreen() {
  const dispatch = useDispatch();
  const { login, syncLoginState } = useAuth(); // Use the login function from AuthContext
  const { isLogin } = useSelector((state) => state.auth);
  const [email, setEmail] = useState('');
  const [matKhau, setMatKhau] = useState('');
  const [loi, setLoi] = useState(null);
  const [dangDangNhap, setDangDangNhap] = useState(false);
  const [registerModalVisible, setRegisterModalVisible] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(''); // Lưu email Google khi đăng nhập thất bại
  const [googlePopupClosed, setGooglePopupClosed] = useState(false); // Track khi user đóng popup Google
  const navigate = useNavigate();

  // Redirect nếu đã đăng nhập
  useEffect(() => {
    const isLoggedIn = isUserLoggedIn() && isLogin;
    if (isLoggedIn) {
      const role = localStorage.getItem('role');
      let dashboardPath = '/';
      
      switch (role) {
        case 'ADMIN':
        case '0':
          dashboardPath = '/admin';
          break;
        case 'STUDENT':
        case '1':
          dashboardPath = '/student';
          break;
        case 'TEACHER':
        case '2':
          dashboardPath = '/teacher';
          break;
        case 'MANAGER':
        case '3':
          dashboardPath = '/manager';
          break;
        case 'ACCOUNTANT':
        case '5':
          dashboardPath = '/accountant';
          break;
        default:
          dashboardPath = '/';
      }
      
      navigate(dashboardPath, { replace: true });
    }
  }, [isLogin, navigate]);

  // Use relative path for proxy to work correctly
    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoi(null);
    setDangDangNhap(true);
    
    try {
      const userData = await authService.login(email, matKhau);
      
      // 1) Store basic auth payload first
      login(userData);
      syncLoginState();

      // 2) Hydrate profile to get fullName/email/username/avatar immediately after login
      try {
        const result = await ProfileDataService.fetchProfileWithFallback();
        const data = result?.data || {};
        const mergedUser = {
          ...userData,
          fullName: data.fullName || data.name || userData.fullName,
          email: data.email || userData.email,
          username: data.username || userData.username,
          avatar: data.avatar || userData.avatar,
        };
        // Update context and Redux with hydrated info
        login(mergedUser);
        dispatch(loginSuccess(mergedUser));
      } catch (hydrateErr) {
        console.log('Post-login profile hydration failed (non-blocking):', hydrateErr);
        // Fallback to dispatch basic payload
        dispatch(loginSuccess(userData));
      }
      
      // Reset popup closed flag khi đăng nhập thành công
      setGooglePopupClosed(false);
      
      toast.success('Đăng nhập thành công!');

      console.log('Navigating based on role:', userData.role);
      // userData.role is normalized by authService to a plain role name
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
        case ROLE.TEACHING_ASSISTANT:
          console.log(`Navigating to TEACHING_ASSISTANT dashboard...`);
          navigate('/teaching-assistant');
          break;
        case ROLE.PARENT:
          console.log(`Navigating to PARENT dashboard...`);
          navigate('/parent');
          break;
        default:
          console.warn('Unknown role after login:', userData.role);
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
      console.log('Starting Google sign-in process...');
      console.log('Firebase auth object:', auth);
      console.log('Google provider:', googleProvider);
      
      // Reset popup closed flag khi bắt đầu đăng nhập Google mới
      setGooglePopupClosed(false);
      
      setDangDangNhap(true);
      
      // 1. Sign in with Google
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      console.log('Google sign-in successful, user:', user.email);
      console.log('User ID token available:', !!result.credential);
      
      // 2. Get ID token
      const idToken = await user.getIdToken();
      
      // 3. Send to backend via authService
      let userData;
      try {
        userData = await authService.googleLogin(idToken, user);
      } catch (error) {
        if (error.message === 'Tài khoản này chưa được đăng ký trong hệ thống') {
          toast.error('Email này chưa được đăng ký trong hệ thống. Vui lòng liên hệ quản trị viên.');
        } else if (error.message === 'Tài khoản chưa được kích hoạt') {
          toast.error('Tài khoản chưa được kích hoạt. Vui lòng chờ tạo hợp đồng để có thể đăng nhập bằng Google.');
        } else {
          toast.error(error.message || 'Đã xảy ra lỗi khi đăng nhập bằng Google.');
        }
        setDangDangNhap(false);
        return;
      }

      // 1) Store basic auth payload first
      login(userData);
      syncLoginState();

      // 2) Hydrate profile to get fullName/email/username/avatar immediately after login
      try {
        const result = await ProfileDataService.fetchProfileWithFallback();
        const data = result?.data || {};
        const mergedUser = {
          ...userData,
          fullName: data.fullName || data.name || userData.fullName,
          email: data.email || userData.email,
          username: data.username || userData.username,
          avatar: data.avatar || userData.avatar,
        };
        login(mergedUser);
        dispatch(loginSuccess(mergedUser));
      } catch (hydrateErr) {
        console.log('Post-google-login profile hydration failed (non-blocking):', hydrateErr);
        dispatch(loginSuccess(userData));
      }
      
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
        case ROLE.TEACHING_ASSISTANT:
          console.log(`Navigating to TEACHING_ASSISTANT dashboard...`);
          navigate('/teaching-assistant');
          break;
        case ROLE.PARENT:
          console.log(`Navigating to PARENT dashboard...`);
          navigate('/parent');
          break;
        default:
          navigate('/');
      }
    } catch (error) {
        console.error('Google login error:', error);
        console.error('Error code:', error.code);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        // Handle Firebase auth errors
        if (error.code === 'auth/popup-closed-by-user') {
            console.log('User closed Google popup, refreshing session...');
            toast.info('Đăng nhập Google bị hủy. Bạn có thể đăng nhập bằng tài khoản thường.');
            
            // Set flag để track trạng thái đóng popup
            setGooglePopupClosed(true);
            
            // Refresh session để đảm bảo có thể đăng nhập bằng username
            try {
              // Clear any Firebase auth state
              await auth.signOut();
              console.log('Firebase auth signed out successfully');
            } catch (signOutError) {
              console.warn('Error signing out from Firebase:', signOutError);
            }
            
            // Clear any stored auth data
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('userId');
            localStorage.removeItem('email');
            localStorage.removeItem('user');
            
            // Reset form state
            setEmail('');
            setMatKhau('');
            setLoi(null);
            
            console.log('Session refreshed, ready for username login');
            
        } else if (error.code === 'auth/popup-blocked') {
            toast.error('Popup bị chặn bởi trình duyệt. Vui lòng cho phép popup cho trang web này');
        } else if (error.code === 'auth/network-request-failed') {
            toast.error('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet');
        } else if (error.code === 'auth/api-key-not-valid') {
            toast.error('Lỗi cấu hình Firebase. Vui lòng liên hệ quản trị viên');
            console.error('Firebase API key error:', error);
            console.error('Current API key:', 'AIzaSyBaee83bB8PfzzesOyozvx6VDrdv-2y8co');
        } else if (error.code === 'auth/unauthorized-domain') {
            toast.error('Domain không được phép. Vui lòng liên hệ quản trị viên');
            console.error('Current domain:', window.location.hostname);
        } else if (error.code === 'auth/operation-not-allowed') {
            toast.error('Google sign-in chưa được bật. Vui lòng liên hệ quản trị viên');
        } else if (error.code === 'auth/invalid-credential') {
            toast.error('Thông tin đăng nhập không hợp lệ');
        } else if (error.status === 404 && error.message) {
            // Handle specific error from googleLogin service - Account not registered
            console.error('Account not registered:', error.message);
            toast.error('Tài khoản chưa được đăng ký!');
            
            // Set email for registration
            if (error.email) {
                setGoogleEmail(error.email);
                setEmail(error.email);
            }
            
            // Show registration modal
            setRegisterModalVisible(true);
            
            // Clear Firebase auth state
            try {
              await auth.signOut();
              console.log('Firebase auth signed out after account not found');
            } catch (signOutError) {
              console.warn('Error signing out from Firebase:', signOutError);
            }
            
        } else if (error.response && error.response.status === 404) {
            // Handle 404 from backend - Account not found
            console.error('Account not found in backend:', error.response.data);
            toast.error('Tài khoản chưa được đăng ký!');
            
            // Try to get email from error response
            const errorData = error.response.data;
            if (errorData && errorData.email) {
                setGoogleEmail(errorData.email);
                setEmail(errorData.email);
            }
            
            // Show registration modal
            setRegisterModalVisible(true);
            
            // Clear Firebase auth state
            try {
              await auth.signOut();
              console.log('Firebase auth signed out after account not found');
            } catch (signOutError) {
              console.warn('Error signing out from Firebase:', signOutError);
            }
            
        } else {
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
           
           {googlePopupClosed && (
             <div className="mt-2 text-center">
               <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded-md">
                 💡 Bạn có thể đăng nhập bằng tài khoản thường ở trên
               </p>
             </div>
           )}

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
