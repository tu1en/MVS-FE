import { App as AntApp } from "antd";
import { useEffect } from "react";
import {
    Navigate,
    Route,
    BrowserRouter as Router,
    Routes,
} from "react-router-dom";
import "./App.css";
import AccountantEvidencePage from './pages/manager/AccountantEvidencePage.jsx';
import OnlineClassesPage from './pages/OnlineClassesPage.jsx';
import "./styles/vietnamese-fonts.css"; // Import Vietnamese fonts CSS

// Layout & Core
import Layout from "./components/Layout.jsx";
import PreventBackNavigation from "./components/PreventBackNavigation.jsx";
import BlankPage from "./pages/BlankPage.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import SelectRoleLogin from "./pages/SelectRoleLogin.jsx";

// Auth Context
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from './context/AuthContext.js'; // Import useAuth

// Dashboards
import AccountantDashboard from './pages/AccountantDashboard'; // Import AccountantDashboard
import AdminDashboard from './pages/AdminDashboard.jsx';
import AllStaffAttendanceLogs from './pages/manager/AllStaffAttendanceLogs.jsx';
import DailyShiftAttendance from './pages/manager/DailyShiftAttendance.jsx';
import ExplanationReports from './pages/manager/ExplanationReports.jsx';
import PersonalAttendanceHistory from './pages/manager/PersonalAttendanceHistory.jsx';
import TeacherAttendanceStatus from './pages/manager/TeacherAttendanceStatus.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import StudentsDashboard from './pages/StudentsDashboard.jsx';
import SystemActivityLogsPage from './pages/SystemActivityLogsPage.jsx';
import SystemChartsPage from './pages/SystemChartsPage.jsx';
import SystemSettingsPage from './pages/SystemSettingsPage.jsx';
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
import TeacherCourseManagement from "./pages/teacher/TeacherCourseManagement.jsx";
import TeacherCoursesSimple from "./pages/teacher/TeacherCoursesSimple.jsx";
import TeacherExplanationRequest from './pages/teacher/TeacherExplanationRequest.jsx';
import TeacherLeaveRequest from './pages/teacher/TeacherLeaveRequest.jsx';
import TeacherLectures from "./pages/teacher/TeacherLectures.jsx";
import TeacherMessagesPage from "./pages/teacher/TeacherMessagesPage.jsx";
import TeachingHistoryPage from './pages/teacher/TeachingHistoryPage.jsx';

import VideoConference from './pages/teacher/VideoConference.jsx';
import Whiteboard from './pages/teacher/Whiteboard.jsx';

// Manager Pages
import CourseManagementSystem from "./components/course/CourseManagementSystem.jsx";
import CreateAnnouncement from "./pages/manager/CreateAnnouncement.jsx";
import CreateSchedulePage from "./pages/manager/CreateSchedulePage.jsx";
import ManagerEditProfile from "./pages/manager/EditProfile.jsx";
import LeaveManagement from "./pages/manager/LeaveManagement.jsx";
import ManageAnnouncements from "./pages/manager/ManageAnnouncements.jsx";
import ManageCourses from "./pages/manager/ManageCourses.jsx";
import ManagerMessages from "./pages/manager/ManagerMessages.jsx";
import ManagerReports from "./pages/manager/ManagerReports.js";
import ManageSchedule from "./pages/manager/ManageSchedule.jsx";
import RecruitmentManagement from './pages/manager/RecruitmentManagement';
import RequestList from "./pages/RequestList.jsx";

// Student Pages
import AccountList from "./pages/AccountList.jsx";
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
import BlogDetailPage from "./pages/BlogDetailPage.jsx";
import BlogPages from "./pages/BlogPages.jsx";
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import HomePage from "./pages/HomePage/index.jsx"; // Import a new page
import LecturesPageNew from "./pages/LecturesPageNew.jsx";
import MessagingPage from "./pages/MessagingPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx"; // Import a new page
import StudentAccomplishments from './pages/StudentAccomplishments.jsx';
import TestUpload from "./pages/TestUpload.jsx";
import { ensureRoleConsistency } from "./utils/authUtils.js";

import AccountantAnnouncementsPage from './pages/accountant/AccountantAnnouncementsPage';
import AccountantExplanationRequest from './pages/accountant/AccountantExplanationRequest';
import AccountantLeaveRequest from './pages/accountant/AccountantLeaveRequest';

import AccountantPayrollGeneration from './pages/accountant/AccountantPayrollGeneration.jsx';
import ContractManagement from './pages/accountant/ContractManagement';
import PayrollManagement from './pages/accountant/PayrollManagement';

// Public Course Pages
import EnrollmentRequestsManager from './pages/manager/EnrollmentRequestsManager.jsx';
import DebugPublicCourses from './pages/public/DebugPublicCourses.jsx';
import PublicCourseDashboard from './pages/public/PublicCourseDashboard.jsx';
import PublicCourseDetail from './pages/public/PublicCourseDetail.jsx';

// Attendance Components
import AttendanceModule from './components/attendance/AttendanceModule.jsx';

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
    if (userRoleName === "ACCOUNTANT") return <Navigate to="/accountant" replace />;
    return <Navigate to="/login" replace />;
  }

  return children;
};

// GuestRoute component to redirect unauthenticated users to home page
const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!user) {
    console.log('GuestRoute: User not authenticated, redirecting to home page');
    return <Navigate to="/" replace />;
  }

  return children;
};

// PublicRoute component for routes that are always accessible (login, home, etc.)
const PublicRoute = ({ children }) => {
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
        case "ACCOUNTANT": return <Navigate to="/accountant" replace />;
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
          <PreventBackNavigation />
          <Layout>
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginScreen /></PublicRoute>} />
              <Route path="/select-role" element={<PublicRoute><SelectRoleLogin /></PublicRoute>} />
              <Route path="/reset-password" element={<PublicRoute><ResetPasswordPage /></PublicRoute>} />
              <Route path="/" element={<PublicRoute><RootRedirect /></PublicRoute>} />

              {/* Public Course Routes - No authentication required */}
              <Route path="/public/courses" element={<PublicRoute><PublicCourseDashboard /></PublicRoute>} />
              <Route path="/public/courses/:id" element={<PublicRoute><PublicCourseDetail /></PublicRoute>} />
              <Route path="/courses" element={<PublicRoute><PublicCourseDashboard /></PublicRoute>} />
              <Route path="/debug/courses" element={<PublicRoute><DebugPublicCourses /></PublicRoute>} />

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
              <Route path="/teacher/messages" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherMessagesPage /></ProtectedRoute>} />
              <Route path="/teacher/announcements" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherAnnouncementsPage /></ProtectedRoute>} />
              <Route path="/teacher/teaching-history" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeachingHistoryPage /></ProtectedRoute>} />
              <Route path="/teacher/leave-requests" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherLeaveRequest /></ProtectedRoute>} />
              <Route path="/teacher/explanation-request" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherExplanationRequest /></ProtectedRoute>} />
              <Route path="/teacher/course-management" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherCourseManagement /></ProtectedRoute>} />

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
              <Route path="/student/messages" element={<ProtectedRoute allowedRoles={["STUDENT"]}><MessagingPage /></ProtectedRoute>} />
              <Route path="/student/accomplishments" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAccomplishments /></ProtectedRoute>} />
              <Route path="/student/account" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentEditProfile /></ProtectedRoute>} />
              <Route path="/courses/:courseId/exams/:examId/do" element={<ProtectedRoute allowedRoles={["STUDENT"]}><DoExamPage /></ProtectedRoute>} />

              {/* Admin and Manager stubs */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AccountList /></ProtectedRoute>} />
              <Route path="/admin/system-logs" element={<ProtectedRoute allowedRoles={["ADMIN"]}><SystemActivityLogsPage /></ProtectedRoute>} />
              <Route path="/admin/system-charts" element={<ProtectedRoute allowedRoles={["ADMIN"]}><SystemChartsPage /></ProtectedRoute>} />
              <Route path="/admin/system-settings" element={<ProtectedRoute allowedRoles={["ADMIN"]}><SystemSettingsPage /></ProtectedRoute>} />
              <Route path="/manager" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerDashboard /></ProtectedRoute>} />

              {/* Manager Routes */}
              <Route path="/manager/courses" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManageCourses /></ProtectedRoute>} />
              <Route path="/manager/course-templates" element={<ProtectedRoute allowedRoles={["MANAGER"]}><CourseManagementSystem /></ProtectedRoute>} />
              <Route path="/manager/schedule" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManageSchedule /></ProtectedRoute>} />
              <Route path="/manager/schedule/create" element={<ProtectedRoute allowedRoles={["MANAGER"]}><CreateSchedulePage /></ProtectedRoute>} />
              <Route path="/manager/announcements" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManageAnnouncements /></ProtectedRoute>} />
              <Route path="/manager/announcements/create" element={<ProtectedRoute allowedRoles={["MANAGER"]}><CreateAnnouncement /></ProtectedRoute>} />
              <Route path="/manager/messages" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerMessages /></ProtectedRoute>} />
              <Route path="/manager/communications" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerMessages /></ProtectedRoute>} />
              <Route path="/manager/reports" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerReports /></ProtectedRoute>} />
              <Route path="/manager/profile" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerEditProfile /></ProtectedRoute>} />
              <Route path="/manager/explanation-reports" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ExplanationReports /></ProtectedRoute>} />
              <Route path="/manager/teacher-attendance-status" element={<ProtectedRoute allowedRoles={["MANAGER"]}><TeacherAttendanceStatus /></ProtectedRoute>} />
              <Route path="/manager/daily-shift-attendance" element={<ProtectedRoute allowedRoles={["MANAGER"]}><DailyShiftAttendance /></ProtectedRoute>} />
              <Route path="/manager/all-staff-attendance-logs" element={<ProtectedRoute allowedRoles={["MANAGER"]}><AllStaffAttendanceLogs /></ProtectedRoute>} />
              <Route path="/manager/personal-attendance-history" element={<ProtectedRoute allowedRoles={["MANAGER"]}><PersonalAttendanceHistory /></ProtectedRoute>} />
              <Route path="/request-list" element={<ProtectedRoute allowedRoles={["MANAGER"]}><RequestList /></ProtectedRoute>} />
              <Route path="/manager/leave-management" element={<ProtectedRoute allowedRoles={["MANAGER"]}><LeaveManagement /></ProtectedRoute>} />
              <Route path="/manager/recruitment" element={<ProtectedRoute allowedRoles={["MANAGER"]}><RecruitmentManagement /></ProtectedRoute>} />
              <Route path="/manager/enrollment-requests" element={<ProtectedRoute allowedRoles={["MANAGER"]}><EnrollmentRequestsManager /></ProtectedRoute>} />
              <Route path="/manager/attendance" element={<ProtectedRoute allowedRoles={["MANAGER"]}><AttendanceModule /></ProtectedRoute>} />

              {/* Accountant Routes */}
              <Route path="/accountant" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><AccountantDashboard /></ProtectedRoute>} />
              <Route path="/accountant/announcements" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><AccountantAnnouncementsPage /></ProtectedRoute>} />
              <Route path="/accountant/leave-requests" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><AccountantLeaveRequest /></ProtectedRoute>} />
              <Route path="/accountant/explanation-request" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><AccountantExplanationRequest /></ProtectedRoute>} />

              <Route path="/accountant/contracts" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><ContractManagement /></ProtectedRoute>} />
              <Route path="/accountant/payroll" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><PayrollManagement /></ProtectedRoute>} />
              <Route path="/accountant/attendance" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><AttendanceModule /></ProtectedRoute>} />
              
              {/* Accountant Attendance Explanation Routes (single source of truth) */}
              <Route path="/accountant/attendance-history" element={<ProtectedRoute allowedRoles={["ACCOUNTANT", "TEACHER"]}><PersonalAttendanceHistory /></ProtectedRoute>} />
              <Route path="/accountant/attendance-explanations" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><AccountantEvidencePage /></ProtectedRoute>} />
              {/* Backward-compatible redirects */}
              <Route path="/accountant/explanation-status" element={<Navigate to="/accountant/attendance-explanations" replace />} />
              <Route path="/accountant/evidence-management" element={<Navigate to="/accountant/attendance-explanations" replace />} />
<Route 
  path="/accountant/attendance-reports" 
  element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><DailyShiftAttendance /></ProtectedRoute>} 
/>
<Route 
  path="/accountant/payroll-generation" 
  element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><AccountantPayrollGeneration /></ProtectedRoute>} 
/>


              {/* Test Upload Page - Requires authentication */}
              <Route path="/test-upload" element={<GuestRoute><TestUpload /></GuestRoute>} />

              {/* Generic and Fallback - Requires authentication */}
              <Route path="/change-password" element={<GuestRoute><ChangePasswordPage /></GuestRoute>} />
              <Route path="/blog" element={<GuestRoute><BlogPages /></GuestRoute>} />
              <Route path="/blog-detail/:id" element={<GuestRoute><BlogDetailPage /></GuestRoute>} />
              <Route path="/blank" element={<GuestRoute><BlankPage /></GuestRoute>} />

              {/* Add generic routes for profile and notifications - Requires authentication */}
              <Route path="/profile" element={<GuestRoute><RoleBasedRedirect targetPath="edit-profile" /></GuestRoute>} />
              <Route path="/notifications" element={<GuestRoute><RoleBasedRedirect targetPath="announcements" /></GuestRoute>} />

              <Route path="*" element={<PublicRoute><NotFoundPage /></PublicRoute>} />
            </Routes>
          </Layout>
        </Router>
      </AntApp>
    </AuthProvider>
  );
}

export default App;
