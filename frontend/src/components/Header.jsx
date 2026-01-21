// src/components/Header.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaBriefcase, FaSignInAlt, FaSignOutAlt, FaUser, FaHome } from 'react-icons/fa';
import Logo from '../assets/logo.png';

const Header = () => {
  const { isLoggedIn, user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link src={Logo} className="flex items-center space-x-2">
            <img src={Logo} alt="JobPortal Logo" className="h-8 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <FaHome />
              <span>Home</span>
            </Link>
            
            {isLoggedIn && (
              <Link 
                to="/dashboard" 
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
              >
                HR Dashboard
              </Link>
            )}
          </nav>

          {/* Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-700">
                    Welcome, <span className="text-blue-600">{user?.email?.split('@')[0]}</span>
                  </p>
                  <p className="text-xs text-gray-500">{user?.role === 'hr' ? 'HR Manager' : 'Admin'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <FaSignInAlt />
                <span>HR Login</span>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={toggleMobileMenu}
            className="md:hidden text-gray-600 p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d={mobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} 
              />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <div className="space-y-3">
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600"
              >
                <FaHome />
                <span>Home</span>
              </Link>
              
              {isLoggedIn && (
                <>
                  <Link 
                    to="/dashboard" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center space-x-2 py-2 text-gray-700 hover:text-blue-600"
                  >
                    <FaUser />
                    <span>HR Dashboard</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 py-2 text-red-600 hover:text-red-700 w-full"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              )}
              
              {!isLoggedIn && (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 py-2 bg-blue-600 text-white rounded-lg justify-center"
                >
                  <FaSignInAlt />
                  <span>HR Login</span>
                </Link>
              )}
              
              {isLoggedIn && user && (
                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600">Logged in as:</p>
                  <p className="font-medium">{user.email}</p>
                  <span className="inline-block mt-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                    {user.role === 'hr' ? 'HR Manager' : 'Admin'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;