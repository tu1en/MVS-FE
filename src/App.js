import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import React, { useEffect } from "react";
import "./App.css";

// Layout and common components
import Layout from "./components/Layout.jsx";
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

// Pages
import AssignmentsPage from "./pages/AssignmentsPage.jsx";
import BlankPage from "./pages/BlankPage.jsx";
import ClassesPage from "./pages/ClassesPage.jsx";
import HomePage from "./pages/HomePage/index.jsx";
import LoginScreen from "./pages/LoginScreen.jsx";
import SelectRoleLogin from "./pages/SelectRoleLogin.jsx";
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import RequestList from './pages/RequestList';
import ChangePasswordPage from './pages/ChangePasswordPage';
import StudentsDashboard from './pages/StudentsDashboard';
import AcademicPerformance from './pages/AcademicPerformance';
import AttendanceRecords from './pages/AttendanceRecords';
import HomeworkScores from './pages/HomeworkScores';
import ExamResults from './pages/ExamResults';
import BlogPages from './pages/BlogPages';
import StudentAccomplishments from "./pages/StudentAccomplishments.jsx";
import AccountantDashboard from './pages/accounting/AccountantDashboard.jsx';
import AttendanceExplanation from './pages/accounting/AttendanceExplanation.jsx';
import { ROLE } from "./constants/constants.js";

// Fix missing components below (you must create or import them properly)





















function App() {
  useEffect(() => {
    const normalizedRole = ensureRoleConsistency();
    console.log('Authentication check - Role normalized to:', normalizedRole);
  }, []);

  const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || token.trim() === '' || token === 'null' || token === 'undefined') {
      return <Navigate to="/login" replace />;
    }

    if (!role || role.trim() === '' || role === 'null' || role === 'undefined') {
      return <Navigate to="/login" replace />;
    }

    const roleMap = {
      '4': 'ADMIN', 'ADMIN': '4',
      '1': 'STUDENT', 'STUDENT': '1',
      '2': 'TEACHER', 'TEACHER': '2', 
      '3': 'MANAGER', 'MANAGER': '3',
      '5': 'ACCOUNTANT', 'ACCOUNTANT': '5'
    };

    const isRoleAllowed = (currentRole, allowedRoles) => {
      if (allowedRoles.includes(currentRole)) return true;
      const mapped = roleMap[currentRole];
      return mapped && allowedRoles.includes(mapped);
    };

    if (isRoleAllowed(role, allowedRoles)) return children;

    const redirects = {
      '1': "/student",
      '2': "/teacher",
      '3': "/manager",
      '4': "/admin",
      '5': "/accounting/dashboard"
    };

    return <Navigate to={redirects[role] || "/login"} replace />;
  };

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/select-role" element={<SelectRoleLogin />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/student/assignments" element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><AssignmentsPage /></ProtectedRoute>} />
          <Route path="/student/lectures" element={<ProtectedRoute allowedRoles={["1", "STUDENT"]}><BlankPage /></ProtectedRoute>} />
          <Route path="/lectures-new" element={<Navigate to="/student/lectures" replace />} />
          <Route path="/accounting/dashboard" element={<ProtectedRoute allowedRoles={["5", "ACCOUNTANT"]}><AccountantDashboard /></ProtectedRoute>} />
          <Route path="/accounting/attendance-explanation" element={<ProtectedRoute allowedRoles={["5", "ACCOUNTANT", "2", "TEACHER"]}><AttendanceExplanation /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute allowedRoles={["4", "ADMIN"]}><AdminDashboard /></ProtectedRoute>} />
          <Route path="/teacher" element={<ProtectedRoute allowedRoles={["2", "TEACHER"]}><TeacherDashboard /></ProtectedRoute>} />
          <Route path="/manager" element={<ProtectedRoute allowedRoles={["3", "MANAGER"]}><ManagerDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
}

function ensureRoleConsistency() {
  // Dummy function for role normalization
  return localStorage.getItem("role") || null;
}

export default App;
