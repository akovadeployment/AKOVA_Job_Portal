// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Now imports from .jsx file
import JobListings from './pages/JobListings';
import JobDetails from './pages/JobDetails';
import JobDetail from './pages/JobDetail';
import HRDashboard from './pages/HRDashboard';
import Login from './pages/Login';
import Header from './components/Header';
import Footer from './components/Footer';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<JobListings />} />
              <Route path="/jobs/:id" element={<JobDetails />} />
              <Route path="/job/:id" element={<JobDetail />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <HRDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;