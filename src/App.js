import React from 'react';
import { Navigate, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import AssignmentsPage from './pages/AssignmentsPage';
import BlankPage from './pages/BlankPage';
import ClassesPage from './pages/ClassesPage';
import HomePage from './pages/HomePage';
import StudentsPage from './pages/StudentsPage';
import LoginScreen from './loginscreen.jsx';

/**
 * Main App component
 * Sets up routing for the application
 * @returns {JSX.Element} The main application
 */
function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/classes" element={<ClassesPage />} />
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/blank" element={<BlankPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
          <Route path="/login" element={<LoginScreen />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;