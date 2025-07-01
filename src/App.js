import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import React from "react";
import "./App.css";
import Layout from "./components/Layout.jsx";
import AssignmentsPage from "./pages/AssignmentsPage.jsx";
import BlankPage from "./pages/BlankPage.jsx";
import ClassesPage from "./pages/ClassesPage.jsx";
import HomePage from "./pages/HomePage/index.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import SelectRoleLogin from "./pages/SelectRoleLogin.jsx";

import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import RequestList from './pages/RequestList';
import ChangePasswordPage from './pages/ChangePasswordPage';

//student pages
import StudentsDashboard from './pages/StudentsDashboard';
import AcademicPerformance from './pages/AcademicPerformance';
import AttendanceRecords from './pages/AttendanceRecords';
import HomeworkScores from './pages/HomeworkScores';
import ExamResults from './pages/ExamResults';
import BlogPages from './pages/BlogPages';
import { ROLE } from "./constants/constants.js";

//accounting pages
import AccountantDashboard from './pages/accounting/AccountantDashboard.jsx';

import StudentAccomplishments from "./pages/StudentAccomplishments.jsx";
import { AuthProvider } from './context/AuthContext';


/**
 * Main App component
 * Sets up routing for the application
 * @returns {JSX.Element} The main application
 */
function App() {
<<<<<<< Updated upstream
  // useEffect(() => {
  //   const token = localStorage.getItem("token");
  //   if (token) {
  //     const role = localStorage.getItem("role");
  //     switch (role) {
  //       case ROLE.ADMIN:  //ADMIN
  //         window.location.href = "/admin";
  //         break;
  //       case ROLE.TEACHER:  //TEACHER
  //         window.location.href = "/teacher";
  //         break;
  //       case ROLE.STUDENT:  //STUDENT
  //         window.location.href = "/student";
  //         break;
  //       default:
  //         window.location.href = "/";
  //     }
  //   }
  // }, []);
=======
  // Ensure role consistency on mount
  useEffect(() => {
  // Reset localStorage khi FE khởi động (DEV ONLY)
  localStorage.clear();
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
        '3': 'MANAGER', 'MANAGER': '3',
        '5': 'ACCOUNTANT', 'ACCOUNTANT': '5'
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
      if (role === "5" || role === "ACCOUNTANT") return <Navigate to="/accounting/dashboard" replace />;
    } catch (error) {
      console.error('Error in role-based redirect:', error);
    }
    
    // Final fallback - redirect to login
    console.log('Unknown role, redirecting to login');
    return <Navigate to="/login" replace />;
  };
>>>>>>> Stashed changes
  return (

    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select-role" element={<SelectRoleLogin />} />
          <Route path="/classes" element={<ClassesPage />} />
<<<<<<< Updated upstream
          <Route path="/assignments" element={<AssignmentsPage />} />
=======
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

          {/* Accountant dashboard route */}
          <Route path="/accounting/dashboard" element={
            <ProtectedRoute allowedRoles={["5", "ACCOUNTANT"]}>
              <AccountantDashboard />
            </ProtectedRoute>
          } />
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
>>>>>>> Stashed changes
          <Route path="/blogs" element={<BlogPages />} />
          <Route path="/blank" element={<BlankPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          {/* admin */}
          <Route path="/admin" element={<AdminDashboard />} />
          {/* teacher */}
          <Route path="/teacher" element={<TeacherDashboard />} />
          {/* manager */}
<<<<<<< Updated upstream
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/request-list" element={<RequestList />} />
          {/* student */}
          <Route path="/student" element={<StudentsDashboard />} />
          <Route path="/student-academic-performance" element={<AcademicPerformance />} />
          <Route path="/student-attendance-records" element={<AttendanceRecords />} />
          <Route path="/student-homework" element={<HomeworkScores />} />
          <Route path="/student-exam-result" element={<ExamResults />} />
          <Route path="/student/accomplishments" element={<StudentAccomplishments />} />
=======
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
          
          {/* Accountant dashboard route */}
          <Route
            path="/accounting/dashboard"
            element={<ProtectedRoute allowedRoles={["5", "ACCOUNTANT"]}><AccountantDashboard /></ProtectedRoute>}
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
>>>>>>> Stashed changes
        </Routes>
      </Layout>
    </Router>

  );
}

export default App;
