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
import StudentsDashboard from "./pages/StudentsDashboard.jsx";
import StudentAccomplishments from "./pages/StudentAccomplishments.jsx";
import AcademicPerformance from "./pages/AcademicPerformance.jsx";
import AttendanceRecords from "./pages/AttendanceRecords.jsx";
import HomeworkScores from "./pages/HomeworkScores.jsx";
import ExamResults from "./pages/ExamResults.jsx";
import { AuthProvider } from './context/AuthContext';

/**
 * Main App component
 * Sets up routing for the application
 * @returns {JSX.Element} The main application
 */
function App() {
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
  return (

    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select-role" element={<SelectRoleLogin />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
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
          <Route path="/manager" element={<ManagerDashboard />} />
          <Route path="/request-list" element={<RequestList />} />
          {/* student */}
          <Route path="/student" element={<StudentsDashboard />} />
          <Route path="/student-academic-performance" element={<AcademicPerformance />} />
          <Route path="/student-attendance-records" element={<AttendanceRecords />} />
          <Route path="/student-homework" element={<HomeworkScores />} />
          <Route path="/student-exam-result" element={<ExamResults />} />
        </Routes>
      </Layout>
    </Router>

  );
}

export default App;
