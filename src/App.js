import { App as AntApp } from "antd";
import { useEffect } from "react";
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";
import "./App.css";
import MessagingDebug from "./pages/MessagingDebug.jsx";
import MessagingPage from "./pages/MessagingPage.jsx";
import OnlineClassesPage from './pages/OnlineClassesPage.jsx';
import QuickMessagingTest from "./pages/QuickMessagingTest.jsx";
import "./styles/vietnamese-fonts.css"; // Import Vietnamese fonts CSS

// Layout & Core
import Layout from "./components/Layout.jsx";
import BlankPage from "./pages/BlankPage.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import SelectRoleLogin from "./pages/SelectRoleLogin.jsx";

// Auth Context
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from './context/AuthContext.js'; // Import useAuth

// Dashboards
import AdminDashboard from './pages/AdminDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import StudentsDashboard from './pages/StudentsDashboard.jsx';
import TeacherDashboard from './pages/TeacherDashboard.jsx';

// Teacher Pages
import CourseDetail from "./pages/teacher/CourseDetail.jsx";
import EditCoursePage from "./pages/teacher/EditCoursePage";
import TeacherEditProfile from "./pages/teacher/EditProfile.jsx";
import GradeHomework from "./pages/teacher/GradeHomework.jsx";
import RealtimeAttendancePage from './pages/teacher/RealtimeAttendancePage.jsx'; // Import the new page
import TeacherSchedule from "./pages/teacher/Schedule.jsx";
import TakeAttendancePage from './pages/teacher/TakeAttendancePage'; // OUR NEW PAGE
import TeacherAnnouncementsPage from "./pages/teacher/TeacherAnnouncementsPage.jsx";
import TeacherCoursesSimple from "./pages/teacher/TeacherCoursesSimple.jsx";
import TeacherLectures from "./pages/teacher/TeacherLectures.jsx";
import TeacherMessagesPage from "./pages/teacher/TeacherMessagesPage.jsx";
import TeachingHistoryPage from './pages/teacher/TeachingHistoryPage.jsx';
import VideoConference from './pages/teacher/VideoConference.jsx';
import Whiteboard from './pages/teacher/Whiteboard.jsx';
import UnifiedStudentMessaging from "./pages/UnifiedStudentMessaging.jsx";
import UnifiedTeacherMessaging from "./pages/UnifiedTeacherMessaging.jsx";

// Unified Messaging Pages

// Manager Pages
import CreateAnnouncement from "./pages/manager/CreateAnnouncement.jsx";
import CreateSchedulePage from "./pages/manager/CreateSchedulePage.jsx";
import ManagerEditProfile from "./pages/manager/EditProfile.jsx";
import ManageAnnouncements from "./pages/manager/ManageAnnouncements.jsx";
import ManageCourses from "./pages/manager/ManageCourses.jsx";
import ManagerMessages from "./pages/manager/ManagerMessages.jsx";
import ManagerReports from "./pages/manager/ManagerReports.js";
import ManageSchedule from "./pages/manager/ManageSchedule.jsx";
import ManageUserAccounts from "./pages/manager/ManageUserAccounts.jsx";

// Student Pages
import NotFoundPage from "./pages/NotFoundPage.jsx";
import AssignmentDetail from "./pages/student/AssignmentDetail.jsx";
import DoExamPage from './pages/student/DoExamPage'; // Import the new DoExamPage
import StudentEditProfile from "./pages/student/EditProfile.jsx";
import EnrolledCourses from "./pages/student/EnrolledCourses.jsx";
import MyAttendancePage from "./pages/student/MyAttendancePage.jsx";
import StudentAnnouncements from "./pages/student/StudentAnnouncements.jsx";
import StudentAssignments from "./pages/student/StudentAssignments.jsx";
import StudentAttendanceHub from "./pages/student/StudentAttendanceHub.jsx";
import StudentCourseDetail from "./pages/student/StudentCourseDetail.jsx";
import StudentGradesAttendance from "./pages/student/StudentGradesAttendance.jsx";
import StudentMaterials from "./pages/student/StudentMaterials.jsx";
import StudentTimetable from "./pages/student/StudentTimetable.jsx";

// Common/Legacy Pages
import AcademicPerformance from './pages/AcademicPerformance.jsx';
import AnnouncementCenter from "./pages/AnnouncementCenter.jsx";
import AssignmentsPageNew from "./pages/AssignmentsPageNew.jsx";
import AttendancePageNew from "./pages/AttendancePageNew.jsx";
import BlogPages from "./pages/BlogPages.jsx";
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import HomePage from "./pages/HomePage/index.jsx"; // Import a new page
import LecturesPageNew from "./pages/LecturesPageNew.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx"; // Import a new page
import StudentAccomplishments from './pages/StudentAccomplishments.jsx';
import TestPage from "./pages/TestPage.jsx";
import TestUpload from "./pages/TestUpload.jsx";
import { ensureRoleConsistency } from "./utils/authUtils.js";

// A component to redirect based on user role
const RoleBasedRedirect = ({ targetPath }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // Or a loading spinner
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    const userRoleName = user.role?.replace('ROLE_', '').toLowerCase();

    // Construct the role-specific path
    const finalPath = `/${userRoleName}/${targetPath}`;

    return <Navigate to={finalPath} replace />;
};

// Simplified ProtectedRoute that relies on the AuthContext state
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after a
    // successful login.
    return <Navigate to="/login" replace />;
  }

  // The role from the context now includes the "ROLE_" prefix, so we adjust.
  // We remove "ROLE_" from the context role to match the simple role names in `allowedRoles`.
  const userRoleName = user.role?.replace('ROLE_', '');

  if (allowedRoles && !allowedRoles.includes(userRoleName)) {
    console.log(`ProtectedRoute: User role ${userRoleName} not in allowed roles:`, allowedRoles);
    // Redirect to their own dashboard if they try to access a page they don't have permission for
    if (userRoleName === "STUDENT") return <Navigate to="/student" replace />;
    if (userRoleName === "TEACHER") return <Navigate to="/teacher" replace />;
    if (userRoleName === "MANAGER") return <Navigate to="/manager" replace />;
    if (userRoleName === "ADMIN") return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};


const RootRedirect = () => {
    const { user, loading } = useAuth(); // Use the hook

    if (loading) {
      return null; // Or a loading spinner
    }

    if (!user) {
        return <HomePage />;
    }

    const userRoleName = user.role?.replace('ROLE_', '');

    switch (userRoleName) {
        case "STUDENT": return <Navigate to="/student" replace />;
        case "TEACHER": return <Navigate to="/teacher" replace />;
        case "MANAGER": return <Navigate to="/manager" replace />;
        case "ADMIN": return <Navigate to="/admin" replace />;
        default: return <Navigate to="/login" replace />;
    }
};



function App() {
  useEffect(() => {
    ensureRoleConsistency();
  }, []);

  return (
    <AuthProvider>
      <AntApp>
        <Router>
          <Layout>
            <Routes>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/select-role" element={<SelectRoleLogin />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/" element={<RootRedirect />} />

              {/* Teacher Routes */}
              <Route path="/teacher" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherDashboard /></ProtectedRoute>} />
              <Route path="/teacher/courses" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherCoursesSimple /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId" element={<ProtectedRoute allowedRoles={["TEACHER"]}><CourseDetail /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/assignments" element={<ProtectedRoute allowedRoles={["TEACHER"]}><AssignmentsPageNew /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/lectures" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherLectures /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/attendance-session" element={<ProtectedRoute allowedRoles={["TEACHER"]}><RealtimeAttendancePage /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/edit" element={<ProtectedRoute allowedRoles={["TEACHER"]}><EditCoursePage /></ProtectedRoute>} />
              <Route path="/teacher/schedule" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherSchedule /></ProtectedRoute>} />
              <Route path="/teacher/edit-profile" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherEditProfile /></ProtectedRoute>} />
              <Route path="/teacher/account" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherEditProfile /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/videocall" element={<ProtectedRoute allowedRoles={["TEACHER"]}><VideoConference /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/whiteboard" element={<ProtectedRoute allowedRoles={["TEACHER"]}><Whiteboard /></ProtectedRoute>} />
              <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={["TEACHER"]}><AssignmentsPageNew /></ProtectedRoute>} />
              <Route path="/teacher/assignments/:assignmentId/grade" element={<ProtectedRoute allowedRoles={["TEACHER"]}><GradeHomework /></ProtectedRoute>} />
              <Route path="/teacher/lectures" element={<ProtectedRoute allowedRoles={["TEACHER", "STUDENT"]}><LecturesPageNew /></ProtectedRoute>} />
              <Route path="/teacher/attendance/take/:classroomId/:lectureId" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TakeAttendancePage /></ProtectedRoute>} />
              <Route path="/teacher/attendance/take/:classroomId" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TakeAttendancePage /></ProtectedRoute>} />
              <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={["TEACHER"]}><AttendancePageNew /></ProtectedRoute>} />
              <Route path="/teacher/messages" element={<ProtectedRoute allowedRoles={["TEACHER"]}><UnifiedTeacherMessaging /></ProtectedRoute>} />
              <Route path="/teacher/messages-unified" element={<ProtectedRoute allowedRoles={["TEACHER"]}><UnifiedTeacherMessaging /></ProtectedRoute>} />
              <Route path="/teacher/messages-old" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherMessagesPage /></ProtectedRoute>} />
              <Route path="/teacher/announcements" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherAnnouncementsPage /></ProtectedRoute>} />
              <Route path="/teacher/teaching-history" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeachingHistoryPage /></ProtectedRoute>} />
              <Route path="/teacher/online-classes" element={<ProtectedRoute allowedRoles={["TEACHER"]}><OnlineClassesPage /></ProtectedRoute>} />

              {/* Student Routes */}
              <Route path="/student" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentsDashboard /></ProtectedRoute>} />
              <Route path="/student/courses" element={<ProtectedRoute allowedRoles={["STUDENT"]}><EnrolledCourses /></ProtectedRoute>} />
              <Route path="/student/my-courses" element={<ProtectedRoute allowedRoles={["STUDENT"]}><EnrolledCourses /></ProtectedRoute>} />
              <Route path="/student/courses/:courseId" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentCourseDetail /></ProtectedRoute>} />
              <Route path="/student/courses/:courseId/my-attendance" element={<ProtectedRoute allowedRoles={["STUDENT"]}><MyAttendancePage /></ProtectedRoute>} />
              <Route path="/student/attendance-records" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAttendanceHub /></ProtectedRoute>} />
              <Route path="/student/schedule" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentTimetable /></ProtectedRoute>} />
              <Route path="/student/edit-profile" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentEditProfile /></ProtectedRoute>} />
              <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAssignments /></ProtectedRoute>} />
              <Route path="/student/assignments/:assignmentId" element={<ProtectedRoute allowedRoles={["STUDENT"]}><AssignmentDetail /></ProtectedRoute>} />
              <Route path="/student/grades-attendance" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentGradesAttendance /></ProtectedRoute>} />
              <Route path="/student/announcements" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAnnouncements /></ProtectedRoute>} />
              <Route path="/student/materials" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentMaterials /></ProtectedRoute>} />
              <Route path="/student/lectures" element={<ProtectedRoute allowedRoles={["TEACHER", "STUDENT"]}><LecturesPageNew /></ProtectedRoute>} />
              <Route path="/student/academic-performance" element={<ProtectedRoute allowedRoles={["STUDENT"]}><AcademicPerformance /></ProtectedRoute>} />
              <Route path="/student/announcements" element={<ProtectedRoute allowedRoles={["STUDENT"]}><AnnouncementCenter /></ProtectedRoute>} />
              <Route path="/student/messages" element={<ProtectedRoute allowedRoles={["STUDENT"]}><UnifiedStudentMessaging /></ProtectedRoute>} />
              <Route path="/student/messages-unified" element={<ProtectedRoute allowedRoles={["STUDENT"]}><UnifiedStudentMessaging /></ProtectedRoute>} />
              <Route path="/student/messages-old" element={<ProtectedRoute allowedRoles={["STUDENT"]}><MessagingPage /></ProtectedRoute>} />
              <Route path="/debug/messaging" element={<ProtectedRoute allowedRoles={["STUDENT", "TEACHER"]}><MessagingDebug /></ProtectedRoute>} />
              <Route path="/debug/messaging-quick" element={<ProtectedRoute allowedRoles={["STUDENT", "TEACHER"]}><QuickMessagingTest /></ProtectedRoute>} />
              <Route path="/student/accomplishments" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAccomplishments /></ProtectedRoute>} />
              <Route path="/student/account" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentEditProfile /></ProtectedRoute>} />
              <Route path="/courses/:courseId/exams/:examId/do" element={<ProtectedRoute allowedRoles={["STUDENT"]}><DoExamPage /></ProtectedRoute>} />

              {/* Admin and Manager stubs */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/manager" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerDashboard /></ProtectedRoute>} />

              {/* Manager Routes */}
              <Route path="/manager/users" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManageUserAccounts /></ProtectedRoute>} />
              <Route path="/manager/courses" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManageCourses /></ProtectedRoute>} />
              <Route path="/manager/schedule" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManageSchedule /></ProtectedRoute>} />
              <Route path="/manager/schedule/create" element={<ProtectedRoute allowedRoles={["MANAGER"]}><CreateSchedulePage /></ProtectedRoute>} />
              <Route path="/manager/announcements" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManageAnnouncements /></ProtectedRoute>} />
              <Route path="/manager/announcements/create" element={<ProtectedRoute allowedRoles={["MANAGER"]}><CreateAnnouncement /></ProtectedRoute>} />
              <Route path="/manager/messages" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerMessages /></ProtectedRoute>} />
              <Route path="/manager/reports" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerReports /></ProtectedRoute>} />
              <Route path="/manager/profile" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerEditProfile /></ProtectedRoute>} />

              {/* Test Pages */}
              <Route path="/test-upload" element={<TestUpload />} />
              <Route path="/test" element={<TestPage />} />

              {/* Generic and Fallback */}
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="/blog" element={<ProtectedRoute allowedRoles={["TEACHER", "STUDENT", "ADMIN", "MANAGER"]}><BlogPages /></ProtectedRoute>} />
              <Route path="/blank" element={<BlankPage />} />

              {/* Add generic routes for profile and notifications */}
              <Route path="/profile" element={<RoleBasedRedirect targetPath="edit-profile" />} />
              <Route path="/notifications" element={<RoleBasedRedirect targetPath="announcements" />} />

              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </AntApp>
    </AuthProvider>
  );
}

export default App;
