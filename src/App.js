import { App as AntApp } from "antd";
import { useEffect } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import OnlineClassesPage from './pages/OnlineClassesPage.jsx';
import TakeAttendancePage from './pages/teacher/TakeAttendancePage.jsx';
import "./styles/vietnamese-fonts.css";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import SelectRoleLogin from "./pages/SelectRoleLogin.jsx";

import { AuthProvider } from "./context/AuthContext";
import { useAuth } from './context/AuthContext.js';

import AccountantLeaveRequest from './pages/accountant/AccountantLeaveRequest.jsx';
import FinancialReports from './pages/accountant/FinancialReports.jsx';
import InvoiceManagement from './pages/accountant/InvoiceManagement.jsx';
import PaymentTracking from './pages/accountant/PaymentTracking.jsx';
import StudentAccounts from './pages/accountant/StudentAccounts.jsx';
import AccountantDashboard from './pages/AccountantDashboard.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

// NEW: Admin components
import SystemWorkflowEditor from './components/admin/SystemWorkflowEditor.jsx';
import AdminSystemDashboard from './pages/Admin/AdminSystemDashboard.jsx';

import AuditLogsPage from './pages/Admin/AuditLogsPage.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';
import StudentsDashboard from './pages/StudentsDashboard.jsx';
import SystemSettingsPage from './pages/SystemSettingsPage.jsx';
import TeacherDashboard from './pages/teacher/TeacherDashboard.jsx';

import LiveClassroomPage from "./pages/LiveClassroomPage.jsx";
import CourseDetail from "./pages/teacher/CourseDetail.jsx";
import EditCoursePage from "./pages/teacher/EditCoursePage.jsx";
import TeacherEditProfile from "./pages/teacher/EditProfile.jsx";
import GradeHomework from "./pages/teacher/GradeHomework.jsx";
import RealtimeAttendancePage from './pages/teacher/RealtimeAttendancePage.jsx';
import TeacherSchedule from "./pages/teacher/Schedule.jsx";
import TeacherAnnouncementsPage from "./pages/teacher/TeacherAnnouncementsPage.jsx";
import TeacherCoursesSimple from "./pages/teacher/TeacherCoursesSimple.jsx";
import TeacherLeaveRequest from './pages/teacher/TeacherLeaveRequest.jsx';
import TeacherLectures from "./pages/teacher/TeacherLectures.jsx";
import TeachingHistoryPage from './pages/teacher/TeachingHistoryPage.jsx';
import VideoConference from './pages/teacher/VideoConference.jsx';
import Whiteboard from './pages/teacher/Whiteboard.jsx';
import UnifiedStudentMessaging from "./pages/UnifiedStudentMessaging.jsx";
import UnifiedTeacherMessaging from "./pages/UnifiedTeacherMessaging.jsx";

import AllStaffAttendanceLogs from "./pages/manager/AllStaffAttendanceLogs.jsx";
import CreateAnnouncement from "./pages/manager/CreateAnnouncement.jsx";
import CreateSchedulePage from "./pages/manager/CreateSchedulePage.jsx";
import DailyShiftAttendance from "./pages/manager/DailyShiftAttendance.jsx";
import ManagerEditProfile from "./pages/manager/EditProfile.jsx";
import ExplanationReports from "./pages/manager/ExplanationReports.jsx";
import HRManagementPage from "./pages/manager/HRManagementPage.jsx";
import LeaveManagement from "./pages/manager/LeaveManagement.jsx";
import ManageAnnouncements from "./pages/manager/ManageAnnouncements.jsx";
import ManageCourses from "./pages/manager/ManageCourses.jsx";
import ManagerMessages from "./pages/manager/ManagerMessages.jsx";
import ManagerReports from "./pages/manager/ManagerReports.jsx";
import ManagerShifts from "./pages/manager/ManagerShifts.jsx";
import ManageSchedule from "./pages/manager/ManageSchedule.jsx";
import ManageUserAccounts from "./pages/manager/ManageUserAccounts.jsx";
import PersonalAttendanceHistory from "./pages/manager/PersonalAttendanceHistory.jsx";
import TeacherAttendanceStatus from "./pages/manager/TeacherAttendanceStatus.jsx";
import LeaveManagement from "./pages/manager/LeaveManagement.jsx";
import RecruitmentManagement from './pages/manager/RecruitmentManagement';
import RequestList from "./pages/RequestList.jsx";

import AccountList from "./pages/AccountList.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";
import AssignmentDetail from "./pages/student/AssignmentDetail.jsx";
import StudentEditProfile from "./pages/student/EditProfile.jsx";
import EnrolledCourses from "./pages/student/EnrolledCourses.jsx";
import StudentAnnouncements from "./pages/student/StudentAnnouncements.jsx";
import StudentAttendanceHub from "./pages/student/StudentAttendanceHub.jsx";
import StudentCourseDetail from "./pages/student/StudentCourseDetail.jsx";
import StudentGradesAttendance from "./pages/student/StudentGradesAttendance.jsx";

import AssignmentsPageNew from "./pages/AssignmentsPage.jsx";
import AttendancePageNew from "./pages/AttendancePageNew.jsx";
import ChangePasswordPage from './pages/ChangePasswordPage.jsx';
import HomePage from "./pages/HomePage/index.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import { ensureRoleConsistency } from "./utils/authUtils.js";
import ContractManagement from './pages/accountant/ContractManagement';

// Additional page imports for missing routes
import BlogPages from "./pages/BlogPages.jsx";
import CommunicationPage from "./pages/CommunicationPage.jsx";
import LecturesPageGeneral from "./pages/LecturesPage.jsx";
import StudentSchedule from "./pages/student/Schedule.jsx";
import StudentAssignments from "./pages/student/StudentAssignments.jsx";
import StudentMaterials from "./pages/student/StudentMaterials.jsx";
import StudentAccomplishments from "./pages/StudentAccomplishments.jsx";
import AssignHomework from "./pages/teacher/AssignHomework.jsx";

const RoleBasedRedirect = ({ targetPath }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  const userRoleName = user.role?.replace('ROLE_', '').toLowerCase();
  const finalPath = `/${userRoleName}/${targetPath}`;
  return <Navigate to={finalPath} replace />;
};

const RootRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <HomePage />;
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
    <AntApp>
      <AuthProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true
          }}
        >
            <Layout>
            <Routes>
              <Route path="/login" element={<LoginScreen />} />
              <Route path="/select-role" element={<SelectRoleLogin />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/" element={<RootRedirect />} />

              {/* ---------------- TEACHER ROUTES ---------------- */}
              <Route path="/teacher/live-classroom/:roomId" element={<ProtectedRoute allowedRoles={["TEACHER"]}><LiveClassroomPage /></ProtectedRoute>} />
              <Route path="/teacher" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherDashboard /></ProtectedRoute>} />
              <Route path="/teacher/courses" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherCoursesSimple /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId" element={<ProtectedRoute allowedRoles={["TEACHER"]}><CourseDetail /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/assignments" element={<ProtectedRoute allowedRoles={["TEACHER"]}><AssignmentsPageNew /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/lectures" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherLectures /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/attendance-session" element={<ProtectedRoute allowedRoles={["TEACHER"]}><RealtimeAttendancePage /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/edit" element={<ProtectedRoute allowedRoles={["TEACHER"]}><EditCoursePage /></ProtectedRoute>} />
              <Route path="/teacher/schedule" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherSchedule /></ProtectedRoute>} />
              <Route path="/teacher/edit-profile" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherEditProfile /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/videocall" element={<ProtectedRoute allowedRoles={["TEACHER"]}><VideoConference /></ProtectedRoute>} />
              <Route path="/teacher/courses/:courseId/whiteboard" element={<ProtectedRoute allowedRoles={["TEACHER"]}><Whiteboard /></ProtectedRoute>} />
              <Route path="/teacher/assignments/:assignmentId/grade" element={<ProtectedRoute allowedRoles={["TEACHER"]}><GradeHomework /></ProtectedRoute>} />
              <Route path="/teacher/attendance/take/:classroomId/:lectureId" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TakeAttendancePage /></ProtectedRoute>} />
              <Route path="/teacher/attendance" element={<ProtectedRoute allowedRoles={["TEACHER"]}><AttendancePageNew /></ProtectedRoute>} />
              <Route path="/teacher/messages" element={<ProtectedRoute allowedRoles={["TEACHER"]}><UnifiedTeacherMessaging /></ProtectedRoute>} />
              <Route path="/teacher/announcements" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherAnnouncementsPage /></ProtectedRoute>} />
              <Route path="/teacher/teaching-history" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeachingHistoryPage /></ProtectedRoute>} />
              <Route path="/teacher/leave-requests" element={<ProtectedRoute allowedRoles={["TEACHER"]}><TeacherLeaveRequest /></ProtectedRoute>} />
              <Route path="/teacher/online-classes" element={<ProtectedRoute allowedRoles={["TEACHER"]}><OnlineClassesPage /></ProtectedRoute>} />
              <Route path="/teacher/assignments" element={<ProtectedRoute allowedRoles={["TEACHER"]}><AssignHomework /></ProtectedRoute>} />
              <Route path="/teacher/lectures" element={<ProtectedRoute allowedRoles={["TEACHER"]}><LecturesPageGeneral /></ProtectedRoute>} />
              <Route path="/teacher/account" element={<ProtectedRoute allowedRoles={["TEACHER"]}><RoleBasedRedirect targetPath="edit-profile" /></ProtectedRoute>} />
              <Route path="/blog" element={<BlogPages />} />

              {/* ---------------- STUDENT ROUTES ---------------- */}
              <Route path="/student" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentsDashboard /></ProtectedRoute>} />
              <Route path="/student/courses" element={<ProtectedRoute allowedRoles={["STUDENT"]}><EnrolledCourses /></ProtectedRoute>} />
              <Route path="/student/courses/:courseId" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentCourseDetail /></ProtectedRoute>} />
              <Route path="/student/attendance-records" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAttendanceHub /></ProtectedRoute>} />
              <Route path="/student/edit-profile" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentEditProfile /></ProtectedRoute>} />
              <Route path="/student/assignments/:assignmentId" element={<ProtectedRoute allowedRoles={["STUDENT"]}><AssignmentDetail /></ProtectedRoute>} />
              <Route path="/student/grades-attendance" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentGradesAttendance /></ProtectedRoute>} />
              <Route path="/student/announcements" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAnnouncements /></ProtectedRoute>} />
              <Route path="/student/messages" element={<ProtectedRoute allowedRoles={["STUDENT"]}><UnifiedStudentMessaging /></ProtectedRoute>} />
              <Route path="/student/schedule" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentSchedule /></ProtectedRoute>} />
              <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAssignments /></ProtectedRoute>} />
              <Route path="/student/materials" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentMaterials /></ProtectedRoute>} />
              <Route path="/student/account" element={<ProtectedRoute allowedRoles={["STUDENT"]}><RoleBasedRedirect targetPath="edit-profile" /></ProtectedRoute>} />
              <Route path="/student/accomplishments" element={<ProtectedRoute allowedRoles={["STUDENT"]}><StudentAccomplishments /></ProtectedRoute>} />

              {/* ---------------- ADMIN ROUTES ---------------- */}
              <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/users" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AccountList /></ProtectedRoute>} />
              <Route path="/admin/audit-logs" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AuditLogsPage /></ProtectedRoute>} />
              <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={["ADMIN"]}><SystemSettingsPage /></ProtectedRoute>} />

              {/* NEW: Workflow Editor Route */}
              <Route path="/admin/workflows" element={<ProtectedRoute allowedRoles={["ADMIN"]}><SystemWorkflowEditor /></ProtectedRoute>} />

              {/* NEW: System Dashboard Route - Dashboard với monitoring chi tiết */}
              <Route path="/admin/system-dashboard" element={<ProtectedRoute allowedRoles={["ADMIN"]}><AdminSystemDashboard /></ProtectedRoute>} />

              {/* Existing Admin Routes */}
              <Route path="/admin/courses" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ManageCourses /></ProtectedRoute>} />
              <Route path="/admin/hr" element={<ProtectedRoute allowedRoles={["ADMIN"]}><HRManagementPage /></ProtectedRoute>} />
              <Route path="/admin/account" element={<ProtectedRoute allowedRoles={["ADMIN"]}><RoleBasedRedirect targetPath="edit-profile" /></ProtectedRoute>} />
              
              {/* Add ADMIN edit profile route */}
              <Route path="/admin/edit-profile" element={<ProtectedRoute allowedRoles={["ADMIN"]}><ManagerEditProfile /></ProtectedRoute>} />

              {/* ---------------- MANAGER ROUTES ---------------- */}
              <Route path="/manager" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerDashboard /></ProtectedRoute>} />
              <Route path="/manager/reports" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerReports /></ProtectedRoute>} />
              <Route path="/manager/users" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManageUserAccounts /></ProtectedRoute>} />
              
              {/* HR Management Routes */}
              <Route path="/manager/hr" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}><HRManagementPage /></ProtectedRoute>} />
              <Route path="/manager/attendance/all-staff" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}><AllStaffAttendanceLogs /></ProtectedRoute>} />
              <Route path="/manager/attendance/daily-shift" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}><DailyShiftAttendance /></ProtectedRoute>} />
              <Route path="/manager/attendance/personal-history" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}><PersonalAttendanceHistory /></ProtectedRoute>} />
              <Route path="/manager/attendance/teacher-status" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}><TeacherAttendanceStatus /></ProtectedRoute>} />
              <Route path="/manager/reports/explanation" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}><ExplanationReports /></ProtectedRoute>} />
              <Route path="/manager/leave-management" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}><LeaveManagement /></ProtectedRoute>} />
              
              {/* Course and Schedule Management */}
              <Route path="/manager/courses" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManageCourses /></ProtectedRoute>} />
              <Route path="/manager/schedules" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManageSchedule /></ProtectedRoute>} />
              <Route path="/manager/schedules/create" element={<ProtectedRoute allowedRoles={["MANAGER"]}><CreateSchedulePage /></ProtectedRoute>} />
              
              {/* Announcement Management */}
              <Route path="/manager/announcements" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManageAnnouncements /></ProtectedRoute>} />
              <Route path="/manager/announcements/create" element={<ProtectedRoute allowedRoles={["MANAGER"]}><CreateAnnouncement /></ProtectedRoute>} />
              
              {/* Manager Profile and Messages */}
              <Route path="/manager/edit-profile" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerEditProfile /></ProtectedRoute>} />
              <Route path="/manager/messages" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerMessages /></ProtectedRoute>} />
              
              {/* Manager Shifts Management */}
              <Route path="/manager/shifts" element={<ProtectedRoute allowedRoles={["MANAGER", "ADMIN"]}><ManagerShifts /></ProtectedRoute>} />
              
              {/* Additional Manager Routes */}
              <Route path="/manager/communications" element={<ProtectedRoute allowedRoles={["MANAGER"]}><CommunicationPage /></ProtectedRoute>} />
              <Route path="/manager/profile" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ManagerEditProfile /></ProtectedRoute>} />
              <Route path="/manager/explanation-reports" element={<ProtectedRoute allowedRoles={["MANAGER"]}><ExplanationReports /></ProtectedRoute>} />
              <Route path="/manager/teacher-attendance-status" element={<ProtectedRoute allowedRoles={["MANAGER"]}><TeacherAttendanceStatus /></ProtectedRoute>} />
              <Route path="/manager/daily-shift-attendance" element={<ProtectedRoute allowedRoles={["MANAGER"]}><DailyShiftAttendance /></ProtectedRoute>} />
              <Route path="/manager/all-staff-attendance-logs" element={<ProtectedRoute allowedRoles={["MANAGER"]}><AllStaffAttendanceLogs /></ProtectedRoute>} />
              <Route path="/manager/personal-attendance-history" element={<ProtectedRoute allowedRoles={["MANAGER"]}><PersonalAttendanceHistory /></ProtectedRoute>} />
              <Route path="/request-list" element={<ProtectedRoute allowedRoles={["MANAGER"]}><RequestList /></ProtectedRoute>} />
              <Route path="/manager/recruitment" element={<ProtectedRoute allowedRoles={["MANAGER"]}><RecruitmentManagement /></ProtectedRoute>} />
              <Route path="/manager/account" element={<ProtectedRoute allowedRoles={["MANAGER"]}><RoleBasedRedirect targetPath="edit-profile" /></ProtectedRoute>} />

              {/* ---------------- ACCOUNTANT ROUTES ---------------- */}
              <Route path="/accountant" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><AccountantDashboard /></ProtectedRoute>} />
              <Route path="/accountant/contracts" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><ContractManagement /></ProtectedRoute>} />
              <Route path="/accountant/leave-requests" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><AccountantLeaveRequest /></ProtectedRoute>} />
              <Route path="/accountant/invoices" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><InvoiceManagement /></ProtectedRoute>} />
              <Route path="/accountant/payments" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><PaymentTracking /></ProtectedRoute>} />
              <Route path="/accountant/reports" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><FinancialReports /></ProtectedRoute>} />
              <Route path="/accountant/students" element={<ProtectedRoute allowedRoles={["ACCOUNTANT"]}><StudentAccounts /></ProtectedRoute>} />

              {/* GENERIC */}
              <Route path="/change-password" element={<ChangePasswordPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Layout>
        </Router>
      </AuthProvider>
    </AntApp>
  );
}

export default App;
