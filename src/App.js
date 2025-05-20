import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [backendMessage, setBackendMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        console.log("Đang gọi API đến: /api/v1/greetings/hello");
        const response = await axios.get('/api/v1/greetings/hello');
        console.log("Phản hồi từ API:", response);
        setBackendMessage(response.data);
        setError('');
      } catch (err) {
        console.error("Lỗi khi gọi API backend:", err);
        if (err.response) {
          // Server trả về lỗi
          console.log("Chi tiết lỗi:", err.response);
          setError(`Lỗi từ server: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
          // Request gửi đi nhưng không nhận được response
          console.log("Request gửi nhưng không có response:", err.request);
          setError('Không thể kết nối đến server backend. Vui lòng kiểm tra xem backend có đang chạy không.');
        } else {
          // Lỗi khi thiết lập request
          setError(`Lỗi khi thiết lập request: ${err.message}`);
        }
        setBackendMessage('');
      } finally {
        setLoading(false);
      }
    };

    fetchGreeting();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Ứng dụng Quản lý Lớp học - Frontend</h1>
        <h2>Kết nối với Backend:</h2>
        
        {loading && <p>Đang tải thông điệp từ backend...</p>}
        
        {error && (
          <div>
            <p style={{ color: 'red' }}>Lỗi: {error}</p>
            <p>API đang gọi đến: http://localhost:8090/api/v1/greetings/hello</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        )}
        
        {backendMessage && (
          <p style={{ color: 'lightgreen' }}>
            Thông điệp từ Backend: "{backendMessage}"
          </p>
        )}
      </header>
    </div>
  );
}

export default App;
