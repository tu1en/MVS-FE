import { App as AntApp } from "antd";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import TestHomePage from "./TestHomePage.jsx";
import Layout from "./components/Layout.jsx";
import AssignmentsPageNew from "./pages/AssignmentsPageNew.jsx";
import AttendanceMarking from "./pages/AttendanceMarking.jsx";
import AttendancePage from "./pages/AttendancePage.jsx";
import BlankPage from "./pages/BlankPage.jsx";
import ClassesPage from "./pages/ClassesPage.jsx";
import CommunicationPage from "./pages/CommunicationPage.jsx";
import FeedbackPage from "./pages/FeedbackPage.jsx";
import LecturesPageNew from "./pages/LecturesPageNew.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import OnlineClassesPage from "./pages/OnlineClassesPage.jsx";
import SelectRoleLogin from "./pages/SelectRoleLogin.jsx";
import SubmitHomework from "./pages/SubmitHomework.jsx";

import ForgotPassword from './components/ForgotPassword.jsx';
import ResetPassword from './components/ResetPassword.jsx';
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
import AdminBlogManagement from "./pages/Admin/AdminBlogManagement.js";
import ManagerEditProfile from "./pages/manager/EditProfile.jsx";
import ManagerReports from "./pages/manager/ManagerReports.js";
import StudentEditProfile from "./pages/student/EditProfile.jsx";
import CourseDetail from "./pages/teacher/CourseDetail.jsx";
import TeacherEditProfile from "./pages/teacher/EditProfile.jsx";
import TeacherCoursesSimple from "./pages/teacher/TeacherCoursesSimple.jsx";

// Manager pages
import CreateAnnouncement from "./pages/manager/CreateAnnouncement.jsx";
import ManageAnnouncements from "./pages/manager/ManageAnnouncements.jsx";
import ManageCourses from "./pages/manager/ManageCourses.jsx";
import ManageSchedule from "./pages/manager/ManageSchedule.jsx";
import ManageUserAccounts from "./pages/manager/ManageUserAccounts.jsx";
import ManagerMessages from "./pages/manager/ManagerMessages.jsx";

// Auth utilities
import { useEffect } from "react";
import { ensureRoleConsistency } from "./utils/authUtils.js";

// Placeholder components for missing routes
const StudentRegistration = () => <div className="p-8"><h1>Đăng ký học viên</h1><p>Trang đăng ký dành cho học viên sẽ được triển khai.</p></div>;
const TeacherRegistration = () => <div className="p-8"><h1>Đăng ký giảng viên</h1><p>Trang đăng ký dành cho giảng viên sẽ được triển khai.</p></div>;

// Placeholder components for routes that don't have implementations yet
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
 * Component to redirect from the root path based on authentication status and role.
 */
const RootRedirect = () => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    // If not logged in, redirect to login page.
    return <Navigate to="/login" replace />;
  }

  // Redirect to the appropriate dashboard based on the user's role.
  switch (role) {
    case "1":
    case "STUDENT":
      return <Navigate to="/student" replace />;
    case "2":
    case "TEACHER":
      return <Navigate to="/teacher" replace />;
    case "3":
    case "MANAGER":
      return <Navigate to="/manager" replace />;
    case "0":
    case "ADMIN":
      return <Navigate to="/admin" replace />;
    default:
      // If the role is unknown or not set, redirect to the login page as a fallback.
      return <Navigate to="/login" replace />;
  }
};

/**
 * Main App component
 * Sets up routing for the application
 * @returns {JSX.Element} The main application
 */
function App() {
  // Ensure role consistency on mount
  useEffect(() => {
    const normalizedRole = ensureRoleConsistency();
    console.log('Authentication check - Role normalized to:', normalizedRole);
  }, []);

  const ProtectedRoute = ({ children, allowedRoles }) => {
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
      return children;
    }

    // Define a more comprehensive role checking function
    const isRoleAllowed = (currentRole, allowedRoles) => {
      if (allowedRoles.includes(currentRole)) {
        return true;
      }

      // Map numeric roles to string roles and vice versa
      const roleMap = {
        '0': 'ADMIN', 'ADMIN': '0',
        '1': 'STUDENT', 'STUDENT': '1',
        '2': 'TEACHER', 'TEACHER': '2', 
        '3': 'MANAGER', 'MANAGER': '3'
      };

      // Check if the mapped role is allowed
      const mappedRole = roleMap[currentRole];
      if (mappedRole && allowedRoles.includes(mappedRole)) {
        return true;
      }

      return false;
    };

    // Use the role checking function
    if (isRoleAllowed(role, allowedRoles)) {
      console.log('Role allowed:', role);
      return children;
    }
    
    console.log('Access denied, redirecting based on role:', role);
    
    // Redirect to appropriate dashboard based on role
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
    <AntApp>
      <Router
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Layout>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/testhome" element={<TestHomePage />} />
          <Route path="/select-role" element={<SelectRoleLogin />} />
          <Route path="/classes" element={<ClassesPage />} />
          {/* Student assignments routes - consolidated under /student/ */}
          <Route 
            path="/student/assignments" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><AssignmentsPageNew /></ProtectedRoute>} 
          />
          <Route 
            path="/student/submit-homework" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><SubmitHomework /></ProtectedRoute>} 
          />
          <Route 
            path="/student/lectures" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><LecturesPageNew /></ProtectedRoute>} 
          />
          <Route 
            path="/student/online-classes" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><OnlineClassesPage /></ProtectedRoute>} 
          />
          <Route 
            path="/student/feedback" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><FeedbackPage /></ProtectedRoute>} 
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
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><AttendanceMarking /></ProtectedRoute>} 
          />
          <Route 
            path="/attendance-new" 
            element={<ProtectedRoute allowedRoles={["2", "0", "TEACHER", "ADMIN"]}><AttendancePage /></ProtectedRoute>} 
          />
          <Route 
            path="/attendance" 
            element={<ProtectedRoute allowedRoles={["1", "2", "STUDENT", "TEACHER"]}><AttendancePage /></ProtectedRoute>} 
          />
          <Route 
            path="/student/attendance" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><AttendancePage /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/attendance-new" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><AttendancePage /></ProtectedRoute>} 
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
            element={<ProtectedRoute allowedRoles={["0", "ADMIN"]}><AdminDashboard /></ProtectedRoute>} 
          />
          
          {/* Additional admin routes */}
          <Route 
            path="/admin/users" 
            element={<ProtectedRoute allowedRoles={["0", "ADMIN"]}><AdminUsers /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/courses" 
            element={<ProtectedRoute allowedRoles={["0", "ADMIN"]}><AdminCourses /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/settings" 
            element={<ProtectedRoute allowedRoles={["0", "ADMIN"]}><AdminSettings /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/requests" 
            element={<ProtectedRoute allowedRoles={["0", "ADMIN"]}><AdminRequests /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/communications" 
            element={<ProtectedRoute allowedRoles={["0", "ADMIN"]}><AdminCommunications /></ProtectedRoute>} 
          />
          <Route 
            path="/admin/reports" 
            element={<ProtectedRoute allowedRoles={["0", "ADMIN"]}><AdminReports /></ProtectedRoute>}
          />
          <Route 
            path="/admin/blogs" 
            element={<ProtectedRoute allowedRoles={["0", "ADMIN"]}><AdminBlogManagement /></ProtectedRoute>}
          />
          
          {/* teacher */}
          <Route 
            path="/teacher" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><TeacherDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/grading" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><TeacherGrading /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/advanced-grading" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><AdvancedGrading /></ProtectedRoute>}          />
          <Route 
            path="/teacher/student-list"
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><StudentListManager /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/lecture-creator" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><LectureCreator /></ProtectedRoute>} 
          />
          
          {/* Additional teacher routes */}
          <Route 
            path="/teacher/assignments" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><AssignmentsPageNew /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/lectures" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><LecturesPageNew /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/attendance" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><AttendancePage /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/courses" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><TeacherCoursesSimple /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/courses/:courseId" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><CourseDetail /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/courses/:courseId/edit" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><CourseDetail /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/courses/:courseId/assignments" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><AssignmentsPageNew /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/schedule" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><TeacherSchedulePage /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/messages" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><TeacherMessagesPage /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/announcements" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><TeacherAnnouncementsPage /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/online-classes" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><OnlineClassesPage /></ProtectedRoute>} 
          />
          
          {/* manager */}
          <Route 
            path="/manager" 
            element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><ManagerDashboard /></ProtectedRoute>}
          />
          <Route 
            path="/manager/dashboard" 
            element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><ManagerDashboard /></ProtectedRoute>}
          />
          <Route 
            path="/request-list" 
            element={<ProtectedRoute allowedRoles={["3", "0", "MANAGER", "ADMIN"]}><RequestList /></ProtectedRoute>} 
          />
          
          {/* Manager feature routes */}
          <Route 
            path="/manager/courses" 
            element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><ManageCourses /></ProtectedRoute>} 
          />
          <Route 
            path="/manager/schedule" 
            element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><ManageSchedule /></ProtectedRoute>} 
          />
          <Route 
            path="/manager/announcements" 
            element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><ManageAnnouncements /></ProtectedRoute>} 
          />
          <Route 
            path="/manager/create-announcement" 
            element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><CreateAnnouncement /></ProtectedRoute>} 
          />
          <Route 
            path="/manager/reports" 
            element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><ManagerReports /></ProtectedRoute>}
          />
          <Route 
            path="/manager/profile" 
            element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><ManagerEditProfile /></ProtectedRoute>} 
          />
          <Route 
            path="/manager/messages" 
            element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><ManagerMessages /></ProtectedRoute>} 
          />
          <Route 
            path="/manager/users" 
            element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><ManageUserAccounts /></ProtectedRoute>} 
          />
          
          {/* Student routes - all under /student/ prefix for consistency */}
          <Route 
            path="/student" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><StudentsDashboard /></ProtectedRoute>} 
          />
          <Route 
            path="/student/academic-performance" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><AcademicPerformance /></ProtectedRoute>} 
          />
          <Route 
            path="/student/attendance-records" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><AttendanceRecords /></ProtectedRoute>} 
          />
          <Route 
            path="/student/homework" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><HomeworkScores /></ProtectedRoute>} 
          />
          <Route 
            path="/student/exam-results" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><ExamResults /></ProtectedRoute>} 
          />
          <Route 
            path="/student/accomplishments" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><StudentAccomplishments /></ProtectedRoute>} 
          />
          <Route 
            path="/student/course-details" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><CourseDetails /></ProtectedRoute>} 
          />
          <Route 
            path="/student/announcements" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><AnnouncementCenter /></ProtectedRoute>} 
          />
          <Route 
            path="/student/timetable" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><TimetableView /></ProtectedRoute>} 
          />
          <Route 
            path="/student/materials" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><MaterialDownload /></ProtectedRoute>} 
          />
          <Route 
            path="/student/my-courses" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><EnrolledCourses /></ProtectedRoute>} 
          />
          
          {/* Additional student routes */}
          <Route 
            path="/student/messages" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><CommunicationPage /></ProtectedRoute>} 
          />
          
          {/* Account routes for all roles */}
          <Route 
            path="/student/account" 
            element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><StudentEditProfile /></ProtectedRoute>} 
          />
          <Route 
            path="/teacher/account" 
            element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><TeacherEditProfile /></ProtectedRoute>} 
          />
          <Route 
            path="/manager/account" 
            element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><ManagerEditProfile /></ProtectedRoute>} 
          />
          
          {/* Legacy routes for backward compatibility */}
          <Route path="/student-academic-performance" element={<Navigate to="/student/academic-performance" replace />} />
          <Route path="/student-attendance-records" element={<Navigate to="/student/attendance-records" replace />} />
          <Route path="/student-homework" element={<Navigate to="/student/homework" replace />} />
          <Route path="/student-exam-result" element={<Navigate to="/student/exam-results" replace />} />
          <Route 
            path="/admin/account" 
            element={<ProtectedRoute allowedRoles={["0", "ADMIN"]}><ManagerEditProfile /></ProtectedRoute>} 
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
    </AntApp>
  );
}

export default App;
