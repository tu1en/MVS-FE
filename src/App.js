import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import Layout from "./components/Layout";
import AssignmentsPage from "./pages/AssignmentsPage";
import BlankPage from "./pages/BlankPage";
import ClassesPage from "./pages/ClassesPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/Dashboard";
import StudentsPage from "./pages/StudentsPage";
import LoginScreen from "./pages/LoginScreen";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import { useEffect } from "react";

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
          <Route path="/home" element={<HomePage />} />
          <Route path="/" element={<DashboardPage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/blank" element={<BlankPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<LoginScreen />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
