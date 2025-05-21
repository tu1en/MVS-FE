# Classroom Frontend

## Tổng quan dự án
Dự án "Classroom Frontend" là phần giao diện người dùng (frontend) của ứng dụng Quản lý Lớp học. Ứng dụng này được xây dựng bằng React và tương tác với backend Spring Boot thông qua các API RESTful.

## Công nghệ sử dụng
- **React**: Thư viện JavaScript để xây dựng giao diện người dùng
- **Axios**: Thư viện HTTP client để thực hiện các yêu cầu API
- **Create React App**: Công cụ để khởi tạo và cấu hình dự án React

## Cấu trúc dự án
```
classroom-frontend/
├── node_modules/       # Thư viện và dependencies
├── public/             # Tài nguyên tĩnh
│   ├── index.html      # File HTML chính
│   ├── favicon.ico     # Icon trang web
│   └── ...
├── src/                # Mã nguồn
│   ├── App.js          # Component chính của ứng dụng
│   ├── index.js        # Điểm vào của ứng dụng
│   ├── App.css         # CSS cho App component
│   └── ...
├── package.json        # Cấu hình dự án và dependencies
└── README.md           # Tài liệu dự án
```

## Phân tích mã nguồn chính

### App.js
- **Mục đích**: Component chính của ứng dụng, hiển thị giao diện người dùng và kết nối với backend
- **Chức năng chính**:
  - Sử dụng React Hooks (useState, useEffect) để quản lý state và side effects
  - Gọi API backend thông qua axios để lấy thông điệp chào mừng
  - Xử lý và hiển thị kết quả hoặc lỗi từ API
- **Code phân tích**:
  ```jsx
  // State management cho thông điệp và lỗi
  const [backendMessage, setBackendMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // API call thông qua useEffect
  useEffect(() => {
    const fetchGreeting = async () => {
      try {
        // Gọi API backend thông qua proxy
        const response = await axios.get('/api/v1/greetings/hello');
        setBackendMessage(response.data);
      } catch (err) {
        // Xử lý lỗi chi tiết theo loại
        // ...
      } finally {
        setLoading(false);
      }
    };
    fetchGreeting();
  }, []);
  ```

## Cấu hình quan trọng

### Proxy Configuration (package.json)
```json
"proxy": "http://localhost:8090"
```
- Cấu hình này cho phép gọi API tương đối (ví dụ: `/api/v1/greetings/hello`) từ React app, sẽ được tự động chuyển tiếp đến backend đang chạy trên `http://localhost:8090`
- Tránh vấn đề CORS trong quá trình phát triển

## Hướng dẫn cài đặt và chạy

### Yêu cầu
- Node.js và npm đã được cài đặt
- Backend Spring Boot đã được cài đặt và đang chạy trên cổng 8090

### Các bước cài đặt
1. Clone repository:
   ```
   git clone https://github.com/tu1en/classroom-frontend.git
   ```

2. Di chuyển vào thư mục dự án:
   ```
   cd classroom-frontend
   ```

3. Cài đặt các dependencies:
   ```
   npm install
   ```

4. Chạy ứng dụng:
   ```
   npm start
   ```

5. Truy cập ứng dụng tại: http://localhost:3000

## Điều cần chú ý trong dự án

### 1. Kết nối Backend
- Đảm bảo backend Spring Boot đang chạy trên cổng 8090 trước khi chạy frontend
- Kiểm tra cấu hình "proxy" trong file package.json phù hợp với cổng backend
- Nếu thay đổi cấu hình proxy, cần khởi động lại server React

### 2. API Endpoints
- API gọi đến `/api/v1/greetings/hello` để lấy thông điệp chào mừng
- Khi thêm các API mới, cần đảm bảo endpoint đúng với cấu hình của backend

### 3. Xử lý lỗi
- Ứng dụng có cơ chế xử lý lỗi chi tiết phân loại theo:
  - Lỗi từ server backend (HTTP status codes)
  - Lỗi kết nối (không thể liên hệ với backend)
  - Lỗi khác khi thiết lập request

### 4. State Management
- Hiện tại sử dụng React Hooks để quản lý state
- Khi ứng dụng phát triển lớn hơn, có thể cần cân nhắc giải pháp quản lý state phức tạp hơn như Redux hoặc Context API

### 5. Quy trình phát triển
- Tạo branch mới cho tính năng mới: `git checkout -b feature/ten-tinh-nang`
- Commit code thường xuyên với thông điệp commit rõ ràng
- Sử dụng Conventional Commits cho format thông điệp: `feat:`, `fix:`, `docs:`, v.v.
- Push lên GitHub và tạo Pull Request cho code review

## Kế hoạch phát triển tiếp theo
- Xây dựng các trang và component cho quản lý lớp học
- Tích hợp hệ thống xác thực người dùng (authentication)
- Phát triển giao diện người dùng đáp ứng (responsive)
- Thêm các chức năng như quản lý bài tập, điểm số, v.v.

## Tài liệu tham khảo
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Axios Documentation](https://axios-http.com/docs/intro)
