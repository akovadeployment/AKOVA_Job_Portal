import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobAPI } from '../services/api';
import {
  FaTwitter,
  FaLinkedin,
  FaWhatsapp,
  FaEnvelope,
  FaFacebook,
  FaShareAlt,
  FaCopy,
  FaChevronLeft,
  FaBriefcase,
  FaMapMarkerAlt,
  FaDollarSign,
  FaCalendar,
  FaPhone,
  FaSms
} from 'react-icons/fa';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  // Use the actual job URL for sharing
  const [currentJobUrl, setCurrentJobUrl] = useState('');

  useEffect(() => {
    fetchJobDetails();
    
    // Handle resize for mobile detection
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [id]);

  useEffect(() => {
    // Set the current job URL whenever the job loads
    if (job && id) {
      const url = `${window.location.origin}/job/${id}`;
      setCurrentJobUrl(url);
      console.log('Current job URL for sharing:', url);
    }
  }, [job, id]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch job details
      const jobData = await jobAPI.getJob(id);
      setJob(jobData);

      // Fetch related jobs (same location or similar title)
      if (jobData) {
        const related = await jobAPI.searchJobs(jobData.title.split(' ')[0], jobData.location);
        setRelatedJobs(related.filter(j => j._id !== id).slice(0, 3));
      }
    } catch (err) {
      console.error('Error fetching job:', err);
      setError('Job not found or has been removed.');
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatDateLong = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const copyShareableLink = () => {
    if (currentJobUrl) {
      navigator.clipboard.writeText(currentJobUrl)
        .then(() => {
          alert('Job link copied to clipboard!\n\n' + currentJobUrl);
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
          alert('Failed to copy link. Please try again.');
        });
    }
  };

  const getShareUrl = (platform) => {
    if (!job || !currentJobUrl) return '';
    
    const encodedUrl = encodeURIComponent(currentJobUrl);
    const text = encodeURIComponent(`Check out this job: ${job.title} at ${job.company || 'Our Company'}`);
    
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${text}`;
      case 'linkedin':
        return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      case 'whatsapp':
        return `https://wa.me/?text=${text}%20${encodedUrl}`;
      case 'email':
        return `mailto:?subject=${encodeURIComponent(`Job Opportunity: ${job.title}`)}&body=${text}%0A%0A${currentJobUrl}`;
      case 'sms':
        return `sms:?body=${text}%20${encodedUrl}`;
      default:
        return currentJobUrl;
    }
  };

  const handleShare = (platform) => {
    const url = getShareUrl(platform);
    if (url) {
      if (platform === 'email' || platform === 'sms') {
        window.location.href = url;
      } else {
        window.open(url, '_blank', 'noopener,noreferrer');
      }
    }
    setShowShareOptions(false);
  };

  const ShareButton = ({ platform, icon: Icon, label, color }) => (
    <button
      onClick={() => handleShare(platform)}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg ${color} text-white hover:opacity-90 transition-all w-full sm:w-auto`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-sm">{label}</span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading job details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-8 px-4">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <button
                onClick={() => navigate(-1)}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Go Back
              </button>
              <Link
                to="/"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
              >
                Browse Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Share FAB */}
      {isMobile && currentJobUrl && (
        <button
          onClick={() => setShowShareOptions(!showShareOptions)}
          className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          aria-label="Share options"
        >
          <FaShareAlt className="w-6 h-6" />
        </button>
      )}

      {/* Mobile Share Modal */}
      {showShareOptions && isMobile && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end">
          <div className="bg-white rounded-t-2xl w-full p-6 animate-slide-up">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">Share Job</h3>
              <button
                onClick={() => setShowShareOptions(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-6">
              <button
                onClick={() => handleShare('whatsapp')}
                className="flex flex-col items-center p-4 bg-green-50 rounded-xl"
              >
                <FaWhatsapp className="w-8 h-8 text-green-600 mb-2" />
                <span className="text-sm font-medium">WhatsApp</span>
              </button>
              <button
                onClick={() => handleShare('sms')}
                className="flex flex-col items-center p-4 bg-blue-50 rounded-xl"
              >
                <FaSms className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium">SMS</span>
              </button>
              <button
                onClick={() => handleShare('email')}
                className="flex flex-col items-center p-4 bg-red-50 rounded-xl"
              >
                <FaEnvelope className="w-8 h-8 text-red-600 mb-2" />
                <span className="text-sm font-medium">Email</span>
              </button>
              <button
                onClick={copyShareableLink}
                className="flex flex-col items-center p-4 bg-purple-50 rounded-xl"
              >
                <FaCopy className="w-8 h-8 text-purple-600 mb-2" />
                <span className="text-sm font-medium">Copy Link</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Job Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="max-w-6xl mx-auto">
            {/* Back Button for Mobile */}
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 mb-6 text-white/80 hover:text-white sm:hidden"
            >
              <FaChevronLeft />
              <span>Back</span>
            </button>

            <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
              <div className="flex-1">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">{job.title}</h1>
                
                {/* Mobile Summary */}
                <div className="sm:hidden space-y-3 mb-4">
                  <div className="flex items-center gap-2">
                    <FaBriefcase className="w-4 h-4" />
                    <span className="text-sm">{job.company || 'Our Company'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FaMapMarkerAlt className="w-4 h-4" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  {job.salary && job.salary !== 'Not specified' && (
                    <div className="flex items-center gap-2">
                      <FaDollarSign className="w-4 h-4" />
                      <span className="text-sm font-bold">{job.salary}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <FaCalendar className="w-4 h-4" />
                    <span className="text-sm">Posted: {formatDate(job.createdAt)}</span>
                  </div>
                </div>

                {/* Desktop Tags */}
                <div className="hidden sm:flex flex-wrap items-center gap-3 mb-4">
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                    <FaBriefcase className="w-4 h-4" />
                    <span className="text-sm">{job.company || 'Our Company'}</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/20 px-3 py-1.5 rounded-lg">
                    <FaMapMarkerAlt className="w-4 h-4" />
                    <span className="text-sm">{job.location}</span>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${job.status === 'open' ? 'bg-green-500/30' : 'bg-red-500/30'}`}>
                    {job.status?.toUpperCase() || 'OPEN'}
                  </span>
                </div>

                <div className="hidden sm:flex flex-wrap items-center gap-3">
                  {job.salary && job.salary !== 'Not specified' && (
                    <div className="text-lg sm:text-xl font-bold">💰 {job.salary}</div>
                  )}
                  <div className={`px-3 py-1.5 rounded-lg ${job.employmentType === 'Remote' ? 'bg-purple-500/30' : 'bg-blue-500/30'}`}>
                    {job.employmentType}
                  </div>
                  {job.experienceLevel && (
                    <div className="px-3 py-1.5 bg-white/20 rounded-lg">
                      {job.experienceLevel} Level
                    </div>
                  )}
                </div>
              </div>

              {/* Shareable Link Section - Desktop */}
              {!isMobile && currentJobUrl && (
                <div className="hidden sm:flex flex-col gap-3 min-w-[280px]">
                  <div className="bg-white/10 rounded-lg p-4">
                    <p className="text-sm mb-2 font-medium">Shareable Link</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={currentJobUrl}
                        readOnly
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-sm truncate"
                      />
                      <button
                        onClick={copyShareableLink}
                        className="px-3 py-2 bg-white/20 hover:bg-white/30 rounded text-sm transition-colors whitespace-nowrap"
                        title="Copy job link to clipboard"
                      >
                        <FaCopy />
                      </button>
                    </div>
                    <p className="text-xs text-white/70 mt-2">
                      Copy this link to share the job
                    </p>
                  </div>
                  
                  {/* Desktop Share Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <ShareButton
                      platform="whatsapp"
                      icon={FaWhatsapp}
                      label="WhatsApp"
                      color="bg-green-600"
                    />
                    <ShareButton
                      platform="email"
                      icon={FaEnvelope}
                      label="Email"
                      color="bg-red-600"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Job Details */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Job Description */}
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Job Description</h2>
                <div className="prose prose-sm sm:prose-lg max-w-none">
                  <p className="text-gray-700 whitespace-pre-line text-sm sm:text-base">{job.description}</p>
                </div>

                {/* Skills */}
                {job.skills && job.skills.length > 0 && (
                  <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200">
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4">Required Skills</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-3">
                      {job.skills.map((skill, index) => (
                        <span 
                          key={index}
                          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-50 text-blue-700 rounded-full font-medium text-sm"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Requirements & Benefits */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    Requirements
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {['Experience in relevant field', 'Strong problem-solving skills', 'Excellent communication abilities', 'Relevant certifications'].map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm sm:text-base">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Benefits
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {['Competitive salary package', 'Health insurance coverage', 'Flexible work arrangements', 'Professional development'].map((benefit, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm sm:text-base">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6 sm:space-y-8">
              {/* Job Summary - Mobile optimized */}
              <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Job Summary</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Posted</p>
                      <p className="font-medium text-sm sm:text-base">{formatDate(job.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Location</p>
                      <p className="font-medium text-sm sm:text-base">{job.location}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Job Type</p>
                      <p className="font-medium text-sm sm:text-base">{job.employmentType}</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-gray-500">Experience</p>
                      <p className="font-medium text-sm sm:text-base">{job.experienceLevel || 'Mid'}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs sm:text-sm text-gray-500 mb-1">Status</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${job.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      <div className={`w-2 h-2 rounded-full ${job.status === 'open' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <span className="text-sm font-medium">{job.status?.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Share Info - Desktop only */}
              {!isMobile && (
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Share Options</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Quick Share</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => handleShare('sms')}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                        >
                          <FaSms className="w-4 h-4" />
                          <span className="text-sm">SMS</span>
                        </button>
                        <button
                          onClick={() => handleShare('whatsapp')}
                          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors"
                        >
                          <FaWhatsapp className="w-4 h-4" />
                          <span className="text-sm">WhatsApp</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 mb-2">Job URL</p>
                      <div className="text-xs bg-gray-50 p-2 rounded border border-gray-200 truncate">
                        {currentJobUrl}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        This is the direct link to this job
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Jobs */}
              {relatedJobs.length > 0 && (
                <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6">Related Jobs</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {relatedJobs.map(relatedJob => (
                      <Link 
                        key={relatedJob._id}
                        to={`/job/${relatedJob._id}`}
                        className="block p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                      >
                        <h4 className="font-medium text-gray-900 mb-1 text-sm sm:text-base line-clamp-1">{relatedJob.title}</h4>
                        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                          <span>{relatedJob.location}</span>
                          <span>•</span>
                          <span>{relatedJob.employmentType}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Link Copy Section */}
          {isMobile && currentJobUrl && (
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Shareable Link</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500 mb-2">Direct job link:</p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={currentJobUrl}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm bg-gray-50 truncate"
                    />
                    <button
                      onClick={copyShareableLink}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row justify-between items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors w-full sm:w-auto justify-center"
            >
              <FaChevronLeft />
              Back to Jobs
            </button>
            <Link
              to="/"
              className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors w-full sm:w-auto text-center"
            >
              View All Jobs
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 flex justify-between items-center z-40">
          <button
            onClick={copyShareableLink}
            className="flex flex-col items-center"
          >
            <FaCopy className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-xs text-gray-600">Copy Link</span>
          </button>
          <button
            onClick={() => handleShare('whatsapp')}
            className="flex flex-col items-center"
          >
            <FaWhatsapp className="w-5 h-5 text-green-600 mb-1" />
            <span className="text-xs text-gray-600">WhatsApp</span>
          </button>
          <button
            onClick={() => handleShare('sms')}
            className="flex flex-col items-center"
          >
            <FaSms className="w-5 h-5 text-blue-600 mb-1" />
            <span className="text-xs text-gray-600">SMS</span>
          </button>
          <button
            onClick={() => setShowShareOptions(true)}
            className="flex flex-col items-center"
          >
            <FaShareAlt className="w-5 h-5 text-purple-600 mb-1" />
            <span className="text-xs text-gray-600">More</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default JobDetail;