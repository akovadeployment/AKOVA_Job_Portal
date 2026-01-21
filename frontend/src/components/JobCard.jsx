// components/JobCard.jsx - Updated
import React from 'react';
import { Link } from 'react-router-dom';

const JobCard = ({ job, isDashboard = false }) => {
  if (!job) return null;

  const {
    _id,
    title,
    description,
    location,
    salary,
    employmentType,
    status,
    shareableLink,
    skills = [],
    experienceLevel,
    company,
    createdAt,
    updatedAt
  } = job;

  // Use the actual job ID for the link
  const jobLink = `/job/${_id}`;

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Truncate description
  const truncateDescription = (text, maxLength = 120) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Experience level color
  const getExperienceColor = (level) => {
    switch (level?.toLowerCase()) {
      case 'entry': return 'bg-blue-100 text-blue-800';
      case 'mid': return 'bg-purple-100 text-purple-800';
      case 'senior': return 'bg-orange-100 text-orange-800';
      case 'lead': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Employment type color
  const getEmploymentTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'full-time': return 'bg-blue-50 text-blue-700';
      case 'part-time': return 'bg-green-50 text-green-700';
      case 'contract': return 'bg-yellow-50 text-yellow-700';
      case 'remote': return 'bg-purple-50 text-purple-700';
      case 'hybrid': return 'bg-indigo-50 text-indigo-700';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="p-6">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
                {status?.toUpperCase() || 'OPEN'}
              </span>
              {isDashboard && (
                <span className="text-xs text-gray-500">
                  ID: {_id?.substring(18) || 'N/A'}
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1 hover:text-blue-600 transition-colors">
              <Link to={jobLink}>{title}</Link>
            </h3>
            {company && (
              <p className="text-sm text-gray-600 mb-2">
                {company} • {experienceLevel && (
                  <span className={`px-2 py-1 rounded-md text-xs ${getExperienceColor(experienceLevel)}`}>
                    {experienceLevel}
                  </span>
                )}
              </p>
            )}
          </div>
          {salary && salary !== 'Not specified' && (
            <div className="text-right">
              <span className="text-lg font-bold text-blue-700">{salary}</span>
              <p className="text-xs text-gray-500">per year</p>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-4 line-clamp-2">
          {truncateDescription(description)}
        </p>

        {/* Skills */}
        {skills && skills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {skills.slice(0, 4).map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
                >
                  {skill}
                </span>
              ))}
              {skills.length > 4 && (
                <span className="px-3 py-1 bg-gray-200 text-gray-600 rounded-full text-xs">
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-gray-600">{location}</span>
            </div>
            <span className={`px-3 py-1 rounded-md text-xs font-medium ${getEmploymentTypeColor(employmentType)}`}>
              {employmentType}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-gray-500">
              Posted {formatDate(createdAt || updatedAt)}
            </span>
            <Link
              to={jobLink}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;