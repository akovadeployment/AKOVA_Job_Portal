import React from 'react';
import { Link } from 'react-router-dom';
import { FaBriefcase, FaEnvelope, FaGithub, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <FaBriefcase className="text-2xl text-blue-400" />
              <h2 className="text-xl font-bold">AKOVA JobPortal</h2>
            </div>
            <p className="text-gray-400 max-w-md">
              A modern job posting platform for companies to find the best talent. 
              Easy to use HR dashboard for managing job postings.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                  Job Listings
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-400 hover:text-white transition-colors">
                  HR Login
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-white">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-gray-400">
                <FaEnvelope />
                <span>hr@akova.in</span>
              </div>
              <p className="text-gray-400 text-sm">
                For HR inquiries and support
              </p>
              
              <div className="flex space-x-4 mt-4">
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="GitHub"
                >
                  <FaGithub className="w-5 h-5" />
                </a>
                <a 
                  href="#" 
                  className="text-gray-400 hover:text-white transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © {currentYear} JobPortal. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;