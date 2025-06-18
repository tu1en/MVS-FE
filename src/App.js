import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout.jsx";
import AssignmentsPageNew from "./pages/AssignmentsPageNew.jsx";
import AttendanceMarking from "./pages/AttendanceMarking.jsx";
import AttendancePageNew from "./pages/AttendancePageNew.jsx";
import BlankPage from "./pages/BlankPage.jsx";
import ClassesPage from "./pages/ClassesPage.jsx";
import CommunicationPage from "./pages/CommunicationPage.jsx";
import FeedbackPage from "./pages/FeedbackPage.jsx";
import HomePage from "./pages/HomePage/index.jsx";
import LecturesPageNew from "./pages/LecturesPageNew.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import OnlineClassesPage from "./pages/OnlineClassesPage.jsx";
import SelectRoleLogin from "./pages/SelectRoleLogin.jsx";
import SubmitHomework from "./pages/SubmitHomework.jsx";

import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';
import { AttendanceModule } from './components/attendance';
import AdminDashboard from './pages/AdminDashboard.jsx';
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import RequestList from './pages/RequestList.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';
import TeacherGrading from './pages/TeacherGrading.jsx';

//student pages
import AcademicPerformance from './pages/AcademicPerformance.jsx';
import AttendanceRecords from './pages/AttendanceRecords.jsx';
import BlogPages from './pages/BlogPages.jsx';
import ExamResults from './pages/ExamResults.jsx';
import HomeworkScores from './pages/HomeworkScores.jsx';
import StudentsDashboard from './pages/StudentsDashboard.jsx';

import StudentAccomplishments from "./pages/StudentAccomplishments.jsx";

// Teacher specific pages
import TeacherSchedulePage from "./pages/TeacherSchedulePage.jsx";
import TeacherAnnouncementsPage from "./pages/teacher/TeacherAnnouncementsPage.jsx";
import TeacherMessagesPage from "./pages/teacher/TeacherMessagesPage.jsx";

// New Priority 1 Pages
import AdvancedGrading from "./pages/AdvancedGrading.jsx";
import AnnouncementCenter from "./pages/AnnouncementCenter.jsx";
import CourseDetails from "./pages/CourseDetails.jsx";
import LectureCreator from "./pages/LectureCreator.jsx";
import MaterialDownload from "./pages/MaterialDownload.jsx";
import StudentListManager from "./pages/StudentListManager.jsx";
import TimetableView from "./pages/TimetableView.jsx";
import EnrolledCourses from "./pages/student/EnrolledCourses.jsx";

// Account/Profile pages
import ManagerEditProfile from "./pages/manager/EditProfile.jsx";
import StudentEditProfile from "./pages/student/EditProfile.jsx";
import CourseDetail from "./pages/teacher/CourseDetail.jsx";
import TeacherEditProfile from "./pages/teacher/EditProfile.jsx";
import TeacherCoursesSimple from "./pages/teacher/TeacherCoursesSimple.jsx";

// Placeholder components for missing routes
const StudentRegistration = () => <div className="p-8"><h1>Đăng ký học viên</h1><p>Trang đăng ký dành cho học viên sẽ được triển khai.</p></div>;
const TeacherRegistration = () => <div className="p-8"><h1>Đăng ký giảng viên</h1><p>Trang đăng ký dành cho giảng viên sẽ được triển khai.</p></div>;

const ManagerCommunications = () => <div className="p-8"><h1>Quản lý giao tiếp</h1><p>Trang quản lý giao tiếp dành cho quản lý sẽ được triển khai.</p></div>;
const ManagerUsers = () => <div className="p-8"><h1>Quản lý người dùng</h1><p>Trang quản lý người dùng dành cho quản lý sẽ được triển khai.</p></div>;
const ManagerMessages = () => <div className="p-8"><h1>Tin nhắn quản lý</h1><p>Trang tin nhắn dành cho quản lý sẽ được triển khai.</p></div>;

const AdminUsers = () => <div className="p-8"><h1>Quản lý người dùng (Admin)</h1><p>Trang quản lý người dùng dành cho admin sẽ được triển khai.</p></div>;
const AdminCourses = () => <div className="p-8"><h1>Quản lý khóa học (Admin)</h1><p>Trang quản lý khóa học dành cho admin sẽ được triển khai.</p></div>;
const AdminSettings = () => <div className="p-8"><h1>Cấu hình hệ thống</h1><p>Trang cấu hình hệ thống dành cho admin sẽ được triển khai.</p></div>;
const AdminRequests = () => <div className="p-8"><h1>Quản lý yêu cầu (Admin)</h1><p>Trang quản lý yêu cầu dành cho admin sẽ được triển khai.</p></div>;
const AdminCommunications = () => <div className="p-8"><h1>Quản lý giao tiếp (Admin)</h1><p>Trang quản lý giao tiếp dành cho admin sẽ được triển khai.</p></div>;
const AdminReports = () => <div className="p-8"><h1>Quản lý báo cáo</h1><p>Trang quản lý báo cáo dành cho admin sẽ được triển khai.</p></div>;

// Role-based route protection

/**
 * Component to redirect /user/account to the appropriate role-based account page
 */
const UserAccountRedirect = () => {
  const role = localStorage.getItem("role");
  
  switch (role) {
    case "1":
    case "STUDENT":
      return <Navigate to="/student/account" replace />;
    case "2":
    case "TEACHER":
      return <Navigate to="/teacher/account" replace />;
    case "3":
    case "MANAGER":
      return <Navigate to="/manager/account" replace />;
    case "0":
    case "ADMIN":
      return <Navigate to="/admin/account" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

/**
 * Main App component
 * Sets up routing for the application
 * @returns {JSX.Element} The main application
 */
function App() {
  // Remove unused userRole state since we're using Redux for auth
  // const [userRole, setUserRole] = useState(null);

  // useEffect(() => {
  //   const role = localStorage.getItem("role");
  //   setUserRole(role);
  // }, []);  // Enhanced role-based route protection function
  const ProtectedRoute = ({ element, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    console.log('ProtectedRoute Debug:', { token: !!token, role, allowedRoles });

    // Check for valid token first
    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
      console.log('No valid token found, redirecting to login');
      return <Navigate to="/login" replace />;
    }

    // Check for valid role
    if (!role || role.trim() === '' || role === 'null' || role === 'undefined') {
      console.log('No valid role found, redirecting to login');
      return <Navigate to="/login" replace />;
    }

    // If no role restrictions specified, allow access to authenticated users
    if (!allowedRoles || allowedRoles.length === 0) {
      console.log('No role restrictions, access granted');
      return element;
    }

    // Check if current role is in allowed roles
    if (allowedRoles.includes(role)) {
      console.log('Role directly allowed:', role);
      return element;
    }

    // Handle both numeric and string role formats with comprehensive mapping
    const roleMapping = {
      '0': 'ADMIN',
      '1': 'STUDENT', 
      '2': 'TEACHER',
      '3': 'MANAGER',
      'ADMIN': ['0', 'ADMIN'],
      'STUDENT': ['1', 'STUDENT'],
      'TEACHER': ['2', 'TEACHER'], 
      'MANAGER': ['3', 'MANAGER']
    };
    
    // Check mapped role
    const mappedRole = roleMapping[role];
    console.log('Role mapping check:', { role, mappedRole, allowedRoles });
    
    // If mappedRole is a string, check if it's in allowedRoles
    if (typeof mappedRole === 'string' && allowedRoles.includes(mappedRole)) {
      console.log('Access granted via mapped role');
      return element;
    }
    
    // If mappedRole is an array, check if any value is in allowedRoles
    if (Array.isArray(mappedRole) && mappedRole.some(r => allowedRoles.includes(r))) {
      console.log('Access granted via mapped role array');
      return element;
    }
    
    console.log('Access denied, redirecting based on role:', role);
    
    // Redirect to appropriate dashboard based on role with error handling
    try {
      if (role === "1" || role === "STUDENT") return <Navigate to="/student" replace />;
      if (role === "2" || role === "TEACHER") return <Navigate to="/teacher" replace />;
      if (role === "3" || role === "MANAGER") return <Navigate to="/manager" replace />;
      if (role === "0" || role === "ADMIN") return <Navigate to="/admin" replace />;
    } catch (error) {
      console.error('Error in role-based redirect:', error);
    }
    
    // Final fallback - redirect to login
    console.log('Unknown role, redirecting to login');
    return <Navigate to="/login" replace />;
  };
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <Layout>
        <Routes>          <Route path="/" element={<HomePage />} />
          <Route path="/select-role" element={<SelectRoleLogin />} />
          <Route path="/classes" element={<ClassesPage />} />
          {/* Student assignments routes - consolidated under /student/ */}
          <Route 
            path="/student/assignments" 
            element={<ProtectedRoute element={<AssignmentsPageNew />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/submit-homework" 
            element={<ProtectedRoute element={<SubmitHomework />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/lectures" 
            element={<ProtectedRoute element={<LecturesPageNew />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/online-classes" 
            element={<ProtectedRoute element={<OnlineClassesPage />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/feedback" 
            element={<ProtectedRoute element={<FeedbackPage />} allowedRoles={["1", "STUDENT"]} />} 
          />
          
          {/* Legacy routes for backward compatibility - redirect to /student/ prefix */}
          <Route path="/assignments" element={<Navigate to="/student/assignments" replace />} />
          <Route path="/assignments-old" element={<Navigate to="/student/assignments" replace />} />
          <Route path="/assignments-new" element={<Navigate to="/student/assignments" replace />} />
          <Route path="/submit-homework" element={<Navigate to="/student/submit-homework" replace />} />
          <Route path="/lectures" element={<Navigate to="/student/lectures" replace />} />
          <Route path="/lectures-new" element={<Navigate to="/student/lectures" replace />} />
          <Route path="/online-classes" element={<Navigate to="/student/online-classes" replace />} />
            {/* Attendance routes with role protection */}
          <Route 
            path="/attendance-marking" 
            element={<ProtectedRoute element={<AttendanceMarking />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/attendance-new" 
            element={<ProtectedRoute element={<AttendancePageNew />} allowedRoles={["2", "0", "TEACHER", "ADMIN"]} />} 
          />
          <Route 
            path="/attendance" 
            element={<ProtectedRoute element={<AttendanceModule />} allowedRoles={["1", "2", "STUDENT", "TEACHER"]} />} 
          />
          <Route 
            path="/student/attendance" 
            element={<ProtectedRoute element={<AttendanceModule />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/teacher/attendance-new" 
            element={<ProtectedRoute element={<AttendanceModule />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route path="/messaging" element={<Navigate to="/student/messages" replace />} />
          <Route path="/communication" element={<Navigate to="/student/messages" replace />} />
          <Route path="/feedback" element={<Navigate to="/student/feedback" replace />} />
          <Route path="/blog" element={<Navigate to="/blogs" replace />} />
          <Route path="/blogs" element={<BlogPages />} />
          <Route path="/blank" element={<BlankPage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          
          {/* Registration routes */}
          <Route path="/register/student" element={<StudentRegistration />} />
          <Route path="/register/teacher" element={<TeacherRegistration />} />
            {/* admin */}
          <Route 
            path="/admin" 
            element={<ProtectedRoute element={<AdminDashboard />} allowedRoles={["0", "ADMIN"]} />} 
          />
          
          {/* Additional admin routes */}
          <Route 
            path="/admin/users" 
            element={<ProtectedRoute element={<AdminUsers />} allowedRoles={["0", "ADMIN"]} />} 
          />
          <Route 
            path="/admin/courses" 
            element={<ProtectedRoute element={<AdminCourses />} allowedRoles={["0", "ADMIN"]} />} 
          />
          <Route 
            path="/admin/settings" 
            element={<ProtectedRoute element={<AdminSettings />} allowedRoles={["0", "ADMIN"]} />} 
          />
          <Route 
            path="/admin/requests" 
            element={<ProtectedRoute element={<AdminRequests />} allowedRoles={["0", "ADMIN"]} />} 
          />
          <Route 
            path="/admin/communications" 
            element={<ProtectedRoute element={<AdminCommunications />} allowedRoles={["0", "ADMIN"]} />} 
          />
          <Route 
            path="/admin/reports" 
            element={<ProtectedRoute element={<AdminReports />} allowedRoles={["0", "ADMIN"]} />} 
          />
          
          {/* teacher */}
          <Route 
            path="/teacher" 
            element={<ProtectedRoute element={<TeacherDashboard />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/teacher/grading" 
            element={<ProtectedRoute element={<TeacherGrading />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/teacher/advanced-grading" 
            element={<ProtectedRoute element={<AdvancedGrading />} allowedRoles={["2", "TEACHER"]} />}          />
          <Route 
            path="/teacher/student-list"
            element={<ProtectedRoute element={<StudentListManager />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/teacher/lecture-creator" 
            element={<ProtectedRoute element={<LectureCreator />} allowedRoles={["2", "TEACHER"]} />} 
          />
          
          {/* Additional teacher routes */}
          <Route 
            path="/teacher/assignments" 
            element={<ProtectedRoute element={<AssignmentsPageNew />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/teacher/lectures" 
            element={<ProtectedRoute element={<LecturesPageNew />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/teacher/attendance" 
            element={<ProtectedRoute element={<AttendancePageNew />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/teacher/courses" 
            element={<ProtectedRoute element={<TeacherCoursesSimple />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/teacher/courses/:courseId" 
            element={<ProtectedRoute element={<CourseDetail />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/teacher/courses/:courseId/assignments" 
            element={<ProtectedRoute element={<AssignmentsPageNew />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/teacher/schedule" 
            element={<ProtectedRoute element={<TeacherSchedulePage />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/teacher/messages" 
            element={<ProtectedRoute element={<TeacherMessagesPage />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/teacher/announcements" 
            element={<ProtectedRoute element={<TeacherAnnouncementsPage />} allowedRoles={["2", "TEACHER"]} />} 
          />
          
          {/* manager */}
          <Route 
            path="/manager" 
            element={<ProtectedRoute element={<ManagerDashboard />} allowedRoles={["3", "MANAGER"]} />}
          />          <Route 
            path="/request-list" 
            element={<ProtectedRoute element={<RequestList />} allowedRoles={["3", "0", "MANAGER", "ADMIN"]} />} 
          />
          
          {/* Additional manager routes */}
          <Route 
            path="/manager/communications" 
            element={<ProtectedRoute element={<ManagerCommunications />} allowedRoles={["3", "MANAGER"]} />} 
          />
          <Route 
            path="/manager/users" 
            element={<ProtectedRoute element={<ManagerUsers />} allowedRoles={["3", "MANAGER"]} />} 
          />
          <Route 
            path="/manager/messages" 
            element={<ProtectedRoute element={<ManagerMessages />} allowedRoles={["3", "MANAGER"]} />} 
          />
          
          {/* Student routes - all under /student/ prefix for consistency */}
          <Route 
            path="/student" 
            element={<ProtectedRoute element={<StudentsDashboard />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/academic-performance" 
            element={<ProtectedRoute element={<AcademicPerformance />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/attendance-records" 
            element={<ProtectedRoute element={<AttendanceRecords />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/homework" 
            element={<ProtectedRoute element={<HomeworkScores />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/exam-results" 
            element={<ProtectedRoute element={<ExamResults />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/accomplishments" 
            element={<ProtectedRoute element={<StudentAccomplishments />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/course-details" 
            element={<ProtectedRoute element={<CourseDetails />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/announcements" 
            element={<ProtectedRoute element={<AnnouncementCenter />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/timetable" 
            element={<ProtectedRoute element={<TimetableView />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/materials" 
            element={<ProtectedRoute element={<MaterialDownload />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/student/my-courses" 
            element={<ProtectedRoute element={<EnrolledCourses />} allowedRoles={["1", "STUDENT"]} />} 
          />
          
          {/* Additional student routes */}
          <Route 
            path="/student/messages" 
            element={<ProtectedRoute element={<CommunicationPage />} allowedRoles={["1", "STUDENT"]} />} 
          />
          
          {/* Account routes for all roles */}
          <Route 
            path="/student/account" 
            element={<ProtectedRoute element={<StudentEditProfile />} allowedRoles={["1", "STUDENT"]} />} 
          />
          <Route 
            path="/teacher/account" 
            element={<ProtectedRoute element={<TeacherEditProfile />} allowedRoles={["2", "TEACHER"]} />} 
          />
          <Route 
            path="/manager/account" 
            element={<ProtectedRoute element={<ManagerEditProfile />} allowedRoles={["3", "MANAGER"]} />} 
          />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/student-academic-performance" element={<Navigate to="/student/academic-performance" replace />} />
          <Route path="/student-attendance-records" element={<Navigate to="/student/attendance-records" replace />} />
          <Route path="/student-homework" element={<Navigate to="/student/homework" replace />} />
          <Route path="/student-exam-result" element={<Navigate to="/student/exam-results" replace />} />
          <Route 
            path="/admin/account" 
            element={<ProtectedRoute element={<ManagerEditProfile />} allowedRoles={["0", "ADMIN"]} />} 
          />
          
          {/* Generic /user/account route - redirect based on role */}
          <Route 
            path="/user/account" 
            element={<UserAccountRedirect />} 
          />
          
          {/* Wildcard route - MUST be last */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
