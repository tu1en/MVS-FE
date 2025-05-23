# Classroom Frontend - Tài liệu Phát triển Chi tiết

## 1. Tổng quan dự án
Dự án "Classroom Frontend" là phần giao diện người dùng (frontend) của ứng dụng Quản lý Lớp học. Ứng dụng này được xây dựng bằng React và tương tác với backend Spring Boot thông qua các API RESTful.

### 1.1. Mục tiêu dự án
- Xây dựng giao diện người dùng trực quan, dễ sử dụng cho hệ thống quản lý lớp học
- Tạo môi trường học tập trực tuyến hiệu quả cho giáo viên và học sinh
- Kết nối liền mạch với backend để quản lý dữ liệu và xử lý nghiệp vụ

### 1.2. Chức năng chính
- Hiển thị thông tin lớp học, bài tập, tài liệu
- Quản lý tài khoản người dùng (đăng nhập, đăng ký, phân quyền)
- Giao tiếp với backend thông qua RESTful API
- Hỗ trợ các chức năng nộp bài, chấm điểm và phản hồi

## 2. Công nghệ sử dụng
- **React 19.1.0**: Thư viện JavaScript để xây dựng giao diện người dùng, sử dụng Hooks API và functional components
- **Axios 1.9.0**: Thư viện HTTP client để thực hiện các yêu cầu API, hỗ trợ Promise và xử lý lỗi toàn diện
- **Create React App**: Công cụ để khởi tạo và cấu hình dự án React, cung cấp cấu trúc dự án tối ưu và các công cụ phát triển
- **React Hooks**: useState, useEffect và các hooks khác để quản lý trạng thái và vòng đời của component
- **Node.js & NPM**: Môi trường chạy JavaScript phía server và quản lý gói

## 3. Cấu trúc dự án chi tiết
```
classroom-frontend/
├── node_modules/         # Thư viện và dependencies
├── public/               # Tài nguyên tĩnh
│   ├── index.html        # File HTML chính, điểm vào của ứng dụng
│   ├── favicon.ico       # Icon trang web
│   ├── manifest.json     # Web App Manifest cho PWA
│   └── robots.txt        # Cấu hình cho web crawlers
├── src/                  # Mã nguồn chính
│   ├── App.js            # Component chính của ứng dụng
│   ├── index.js          # Điểm vào JavaScript, render App vào DOM
│   ├── App.css           # CSS cho App component
│   └── index.css         # CSS toàn cục
├── package.json          # Cấu hình dự án và dependencies
├── package-lock.json     # Lock file đảm bảo cài đặt dependencies nhất quán
├── .gitignore            # Danh sách file/thư mục bị bỏ qua bởi Git
└── README.md             # Tài liệu dự án (file này)
```

### 3.1. Các file chính và mục đích

#### public/index.html
File HTML cơ bản chứa thẻ `<div id="root"></div>` nơi React sẽ render toàn bộ ứng dụng. File này cũng chứa các meta tags và liên kết đến tài nguyên bên ngoài.

#### src/index.js
Điểm vào của ứng dụng React. File này import và render component App vào DOM:
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
```

#### src/App.js
Component chính của ứng dụng, xử lý gọi API và render giao diện chính.

#### package.json
Định nghĩa metadata của dự án, dependencies, và các scripts npm:
```json
{
  "name": "classroom-frontend",
  "version": "0.1.0",
  "private": true,
  "proxy": "http://localhost:8090",
  "dependencies": {
    "axios": "^1.9.0",
    "react": "^19.1.0",
    "react-dom": "^19.1.0",
    "react-scripts": "5.0.1",
    ...
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  ...
}
```

## 4. Kiến trúc và luồng dữ liệu

### 4.1. Kiến trúc tổng thể
```
+----------------+       +------------------+       +------------------+
|                |       |                  |       |                  |
|  React Frontend| <---> | Proxy Middleware | <---> | Spring Backend   |
|  (port 3000)   |       | (package.json)   |       | (port 8090)      |
|                |       |                  |       |                  |
+----------------+       +------------------+       +------------------+
```

### 4.2. Luồng dữ liệu
1. **Component React** (App.js) khởi tạo API call thông qua useEffect hook
2. **Axios** thực hiện HTTP request đến endpoint tương đối (/api/v1/greetings/hello)
3. **Proxy Middleware** (được cấu hình trong package.json) chuyển tiếp request đến backend
4. **Backend Spring Boot** xử lý request và trả về response
5. **Component React** cập nhật state và re-render giao diện với dữ liệu mới

## 5. Phân tích mã nguồn chi tiết

### 5.1. App.js - Component chính
```jsx
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import './App.css';

function App() {
  // State hooks để quản lý trạng thái ứng dụng
  const [backendMessage, setBackendMessage] = useState(''); // Lưu thông điệp từ backend
  const [error, setError] = useState(''); // Lưu thông báo lỗi nếu có
  const [loading, setLoading] = useState(true); // Trạng thái loading

  // useEffect hook để thực hiện side effect (gọi API) sau khi component được render
  useEffect(() => {
    // Hàm async để gọi API
    const fetchGreeting = async () => {
      try {
        console.log("Đang gọi API đến: /api/v1/greetings/hello");
        
        // Gọi API sử dụng axios
        const response = await axios.get('/api/v1/greetings/hello');
        console.log("Phản hồi từ API:", response);
        
        // Cập nhật state với dữ liệu từ API
        setBackendMessage(response.data);
        setError('');
      } catch (err) {
        // Xử lý các trường hợp lỗi khác nhau
        console.error("Lỗi khi gọi API backend:", err);
        
        if (err.response) {
          // Lỗi từ server (status code không phải 2xx)
          console.log("Chi tiết lỗi:", err.response);
          setError(`Lỗi từ server: ${err.response.status} - ${JSON.stringify(err.response.data)}`);
        } else if (err.request) {
          // Không nhận được response (server không hoạt động)
          console.log("Request gửi nhưng không có response:", err.request);
          setError('Không thể kết nối đến server backend. Vui lòng kiểm tra xem backend có đang chạy không.');
        } else {
          // Lỗi khi thiết lập request
          setError(`Lỗi khi thiết lập request: ${err.message}`);
        }
        
        setBackendMessage('');
      } finally {
        // Luôn thực hiện sau khi try/catch hoàn thành
        setLoading(false);
      }
    };

    // Gọi hàm fetchGreeting
    fetchGreeting();
    
    // Mảng dependencies rỗng đảm bảo useEffect chỉ chạy một lần sau khi mount
  }, []);

  // Render UI dựa trên state
  return (
    <div className="App">
      <header className="App-header">
        <h1>Ứng dụng Quản lý Lớp học - Frontend</h1>
        <h2>Kết nối với Backend:</h2>
        
        {/* Hiển thị trạng thái loading */}
        {loading && <p>Đang tải thông điệp từ backend...</p>}
        
        {/* Hiển thị lỗi nếu có */}
        {error && (
          <div>
            <p style={{ color: 'red' }}>Lỗi: {error}</p>
            <p>API đang gọi đến: http://localhost:8090/api/v1/greetings/hello</p>
            <button onClick={() => window.location.reload()}>Thử lại</button>
          </div>
        )}
        
        {/* Hiển thị thông điệp nếu có */}
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
```

### 5.2. Phân tích chi tiết các hooks trong App.js

#### useState
- **backendMessage**: Lưu trữ phản hồi từ API backend
- **error**: Lưu trữ thông báo lỗi nếu quá trình gọi API thất bại
- **loading**: Theo dõi trạng thái loading để hiển thị UI phù hợp

#### useEffect
- Thực hiện gọi API khi component mount
- Sử dụng async/await để xử lý Promise từ axios
- Xử lý các trường hợp lỗi chi tiết
- Mảng dependencies rỗng `[]` đảm bảo hook chỉ chạy một lần sau khi component mount

### 5.3. Xử lý lỗi
Xử lý lỗi chi tiết chia làm 3 trường hợp:
1. **err.response**: Server phản hồi với status code lỗi (4xx hoặc 5xx)
2. **err.request**: Request đã được gửi nhưng không nhận được phản hồi (backend không hoạt động)
3. **Lỗi khác**: Lỗi xảy ra trong quá trình thiết lập request

## 6. Cấu hình chi tiết

### 6.1. Proxy Configuration (package.json)
```json
"proxy": "http://localhost:8090"
```

#### Cách hoạt động của proxy:
1. Khi React app chạy ở development mode (npm start), Create React App sẽ thiết lập một development server tại port 3000
2. Khi browser gửi request đến `/api/*` hoặc bất kỳ path nào không được tìm thấy trong public folder
3. Development server sẽ chuyển tiếp request đến backend đang chạy tại http://localhost:8090
4. Response từ backend sẽ được chuyển tiếp về React app

#### Lợi ích:
- Tránh vấn đề CORS (Cross-Origin Resource Sharing)
- Cho phép sử dụng URL tương đối trong code thay vì URL tuyệt đối
- Tách biệt môi trường phát triển frontend và backend

### 6.2. NPM Scripts
- **start**: Khởi động development server
- **build**: Tạo phiên bản production của ứng dụng
- **test**: Chạy các bài test
- **eject**: Đẩy cấu hình ra bên ngoài (không khuyến khích)

## 7. Hướng dẫn cài đặt và chạy chi tiết

### 7.1. Yêu cầu hệ thống
- **Node.js**: v16.0.0 trở lên
- **npm**: v8.0.0 trở lên
- **Trình duyệt hiện đại**: Chrome, Firefox, Edge, Safari
- **Không gian đĩa**: Tối thiểu 500MB cho dependencies và build files
- **Backend Spring Boot** đã được cài đặt và đang chạy trên cổng 8090

### 7.2. Các bước cài đặt
1. **Clone repository**:
   ```bash
   git clone https://github.com/tu1en/classroom-frontend.git
   ```

2. **Di chuyển vào thư mục dự án**:
   ```bash
   cd classroom-frontend
   ```

3. **Cài đặt dependencies**:
   ```bash
   npm install
   ```
   Quá trình này có thể mất vài phút tùy thuộc vào tốc độ mạng và hệ thống.

4. **Kiểm tra cấu hình proxy**:
   Mở file `package.json` và đảm bảo cấu hình proxy trỏ đến backend đúng:
   ```json
   "proxy": "http://localhost:8090"
   ```
   Nếu backend đang chạy ở cổng khác, hãy điều chỉnh cho phù hợp.

5. **Chạy ứng dụng**:
   ```bash
   npm start
   ```
   Sau khi lệnh được thực thi:
   - Development server sẽ khởi động
   - Trình duyệt mặc định sẽ tự động mở với URL http://localhost:3000
   - Nếu cổng 3000 đã được sử dụng, bạn sẽ được hỏi có muốn sử dụng cổng khác không

6. **Kiểm tra kết nối với backend**:
   - Đảm bảo backend Spring Boot đang chạy
   - Trang web sẽ hiển thị thông điệp từ backend nếu kết nối thành công
   - Nếu có lỗi, hãy kiểm tra console trình duyệt (F12) để xem chi tiết

## 8. Quy trình phát triển và làm việc nhóm

### 8.1. Quy trình Git chi tiết
1. **Clone repository (chỉ làm một lần)**:
   ```bash
   git clone https://github.com/tu1en/classroom-frontend.git
   cd classroom-frontend
   ```

2. **Cập nhật code mới nhất từ repository chính**:
   ```bash
   git checkout master
   git pull origin master
   ```

3. **Tạo branch mới cho tính năng/fix**:
   ```bash
   git checkout -b feature/ten-tinh-nang
   # hoặc
   git checkout -b fix/ten-loi
   ```
   Quy ước đặt tên branch:
   - `feature/`: Cho tính năng mới
   - `fix/`: Cho việc sửa lỗi
   - `docs/`: Cho cập nhật tài liệu
   - `refactor/`: Cho việc cải tiến code không thêm tính năng/sửa lỗi

4. **Phát triển tính năng/sửa lỗi**:
   - Viết code và kiểm tra kỹ lưỡng
   - Chạy tests nếu có
   - Đảm bảo code tuân theo coding standards

5. **Commit thường xuyên với thông điệp rõ ràng**:
   ```bash
   git add .
   git commit -m "feat: Thêm form đăng nhập"
   ```
   
   Conventional Commits format:
   - `feat:` - Tính năng mới
   - `fix:` - Sửa lỗi
   - `docs:` - Thay đổi tài liệu
   - `style:` - Thay đổi không ảnh hưởng đến logic (định dạng, semicolons, v.v.)
   - `refactor:` - Cải tiến code không thêm tính năng/sửa lỗi
   - `test:` - Thêm/sửa tests
   - `chore:` - Thay đổi công cụ build, dependencies, v.v.

6. **Cập nhật từ master nếu cần**:
   ```bash
   git checkout master
   git pull origin master
   git checkout feature/ten-tinh-nang
   git merge master
   ```
   Giải quyết conflicts nếu có.

7. **Push branch lên GitHub**:
   ```bash
   git push -u origin feature/ten-tinh-nang
   ```

8. **Tạo Pull Request (PR)**:
   - Vào GitHub, chọn repository và branch của bạn
   - Nhấn "New Pull Request"
   - Điền thông tin chi tiết về PR
   - Chọn reviewers

9. **Code review và điều chỉnh**:
   - Đợi feedback từ team
   - Thực hiện các thay đổi cần thiết
   - Commit và push các thay đổi vào cùng branch

10. **Merge vào master**:
    - Sau khi PR được approve
    - Merge PR trên GitHub

### 8.2. Phương pháp làm việc hiệu quả
1. **Daily Stand-up**: Cập nhật ngắn gọn về:
   - Những gì đã làm hôm qua
   - Những gì sẽ làm hôm nay
   - Những vấn đề gặp phải

2. **Code Review**: Đảm bảo mọi PR đều được review bởi ít nhất 1 thành viên khác

3. **Pair Programming**: Làm việc cùng nhau cho các tính năng phức tạp

4. **Task Tracking**: Sử dụng GitHub Issues hoặc công cụ khác để theo dõi công việc

## 9. Debug và xử lý lỗi

### 9.1. Debug trong môi trường phát triển
1. **Console.log**: Sử dụng `console.log()`, `console.error()`, và `console.table()` để ghi log
   ```javascript
   console.log("Dữ liệu:", data);
   console.error("Lỗi:", error);
   console.table(arrayOfObjects); // Hiển thị dữ liệu dạng bảng
   ```

2. **React Developer Tools**: Cài đặt extension cho Chrome/Firefox để debug React components và state
   - Xem component tree
   - Kiểm tra props và state
   - Theo dõi renders

3. **Network Tab trong DevTools**:
   - Kiểm tra API requests và responses
   - Xem thời gian load và kích thước dữ liệu
   - Mô phỏng kết nối chậm để test UX

### 9.2. Các lỗi thường gặp và cách xử lý

1. **CORS (Cross-Origin Resource Sharing)**:
   - **Triệu chứng**: Lỗi "Access to XMLHttpRequest at '...' from origin 'http://localhost:3000' has been blocked by CORS policy"
   - **Giải pháp**: 
     - Đảm bảo proxy được cấu hình đúng trong package.json
     - Kiểm tra backend có đang cho phép CORS từ origin của frontend không

2. **Network Errors**:
   - **Triệu chứng**: "Network Error" hoặc timeout khi gọi API
   - **Giải pháp**:
     - Kiểm tra backend có đang chạy không
     - Kiểm tra URL và port có đúng không
     - Kiểm tra firewall hoặc antivirus có chặn kết nối không

3. **Vấn đề về State/Lifecycle**:
   - **Triệu chứng**: Component không re-render khi state thay đổi
   - **Giải pháp**:
     - Đảm bảo sử dụng setter function từ useState
     - Kiểm tra mảng dependencies trong useEffect
     - Tránh mutate state trực tiếp

## 10. Kế hoạch phát triển tiếp theo

### 10.1. Roadmap tính năng
1. **Phase 1: Core Framework** (Hiện tại)
   - Kết nối cơ bản với backend
   - Thiết lập cấu trúc dự án
   - Quy trình phát triển

2. **Phase 2: Authentication & Authorization**
   - Đăng nhập/Đăng ký
   - Quản lý phiên đăng nhập
   - Phân quyền người dùng

3. **Phase 3: Classroom Management**
   - Tạo và tham gia lớp học
   - Dashboard hiển thị lớp học
   - Quản lý thành viên lớp học

4. **Phase 4: Assignment System**
   - Tạo và giao bài tập
   - Nộp bài và nhận xét
   - Chấm điểm và thống kê

5. **Phase 5: Advanced Features**
   - Chat và thảo luận
   - Thông báo thời gian thực
   - Tích hợp tài liệu và media

### 10.2. Cải tiến kỹ thuật
1. **State Management**:
   - Triển khai Redux hoặc Context API cho quản lý state toàn cục
   - Cấu trúc state hợp lý theo từng domain

2. **Routing**:
   - Thêm React Router để quản lý nhiều trang
   - Cấu hình lazy loading cho các route

3. **UI Framework**:
   - Triển khai thư viện UI như Material-UI hoặc Chakra UI
   - Xây dựng hệ thống design system

4. **Testing**:
   - Viết unit tests cho components và hooks
   - Viết integration tests cho luồng chính

5. **Performance**:
   - Tối ưu rendering với memo, useMemo, useCallback
   - Code splitting và lazy loading

## 11. Tài liệu tham khảo và học liệu

### 11.1. Tài liệu chính thức
- [React Documentation](https://reactjs.org/docs/getting-started.html)
- [Create React App Documentation](https://create-react-app.dev/docs/getting-started/)
- [Axios Documentation](https://axios-http.com/docs/intro)
- [React Hooks API Reference](https://reactjs.org/docs/hooks-reference.html)

### 11.2. Khóa học và tutorials
- [React - The Complete Guide](https://www.udemy.com/course/react-the-complete-guide-incl-redux/)
- [React Hooks Course](https://www.youtube.com/watch?v=TNhaISOUy6Q)
- [RESTful API with Axios Tutorial](https://blog.logrocket.com/how-to-make-http-requests-like-a-pro-with-axios/)

### 11.3. Tools hữu ích
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Postman](https://www.postman.com/) - Test API endpoints
- [VS Code Extensions for React](https://marketplace.visualstudio.com/search?term=react&target=VSCode)
