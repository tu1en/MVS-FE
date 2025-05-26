import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import React from 'react';
import './App.css';
import Layout from './components/Layout';
import AssignmentsPage from './pages/AssignmentsPage';
import BlankPage from './pages/BlankPage';
import ClassesPage from './pages/ClassesPage';
import HomePage from './pages/HomePage';
import StudentsPage from './pages/StudentsPage';
import LoginScreen from './pages/LoginScreen.jsx';
import SelectRoleLogin from "./pages/SelectRoleLogin.jsx";
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import { useEffect } from 'react';
import { auth } from './config/firebase';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
//student pages
import AcademicPerformance from './pages/AcademicPerformance';
import AttendanceRecords from './pages/AttendanceRecords';
import HomeworkScores from './pages/HomeworkScores';
import ExamResults from './pages/ExamResults';
/**
 * Main App component
 * Sets up routing for the application
 * @returns {JSX.Element} The main application
 */
function App() {
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const role = localStorage.getItem("role");
      switch (role) {
        case "ADMIN":
          window.location.href = "/admin";
          break;
        case "TEACHER":
          window.location.href = "/teacher";
          break;
        case "STUDENT":
          window.location.href = "/student";
          break;
        default:
          window.location.href = "/";
      }
    }
  }, []);
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/select-role" element={<SelectRoleLogin />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/blank" element={<BlankPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/student-academic-performance" element={<AcademicPerformance />} />
          <Route path="/student-attendance-records" element={<AttendanceRecords />} />
          <Route path="/student-homework" element={<HomeworkScores />} />
          <Route path="/exam-result" element={<ExamResults />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
