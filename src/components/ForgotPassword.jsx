import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
const baseUrl = process.env.REACT_APP_BASE_URL;

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);

  const validateEmail = (email) => {
    if (!email.endsWith('@gmail.com')) {
      setEmailError('Email phải đúng dạng @gmail.com');
      return false;
    }
    if (email.length > 50) {
      setEmailError('Email must be 50 characters or less');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateEmail(email)) {
      return;
    }
    
    try {
      const response = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.text();
        setSuccess('Mật khẩu mới đã được gửi đến email của bạn. Bạn sẽ được chuyển về trang đăng nhập sau 5 giây.');
        setError('');
        setEmail('');
        
        // Bắt đầu đếm ngược để chuyển hướng
        let timer = 5;
        const countdownInterval = setInterval(() => {
          timer--;
          setCountdown(timer);
          if (timer <= 0) {
            clearInterval(countdownInterval);
            navigate('/login');
          }
        }, 1000);
      } else {
        const errorData = await response.text();
        setError(errorData || 'Email không tồn tại trong hệ thống');
        setSuccess('');
      }
    } catch (err) {
      setError('Đã xảy ra lỗi. Vui lòng thử lại sau.');
      setSuccess('');
    }
  };

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-900">
          Quên mật khẩu?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập email của bạn để nhận mật khẩu mới
        </p>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm/6 font-medium text-gray-900">
              Tài khoản email
            </label>
            <div className="mt-2">
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={50}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  validateEmail(e.target.value);
                }}
                className="block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6"
              />
              {emailError && <p className="text-sm text-red-500 mt-1">{emailError}</p>}
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm/6 font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Gửi mật khẩu mới
            </button>
          </div>
        </form>

        {success && (
          <div className="mt-4">
            <p className="text-sm text-green-500">{success}</p>
            <p className="text-sm text-blue-600 mt-2">
              Chuyển về trang đăng nhập sau: <span className="font-bold">{countdown}</span> giây
            </p>
          </div>
        )}
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}