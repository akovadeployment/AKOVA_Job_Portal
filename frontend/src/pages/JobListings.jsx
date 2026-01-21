import React, { useState, useEffect, useCallback } from 'react';
import { jobAPI } from '../services/api';
import JobCard from '../components/JobCard';

const JobListings = () => {
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');

    useEffect(() => {
        fetchJobs();
    }, []);

    // Filter jobs when search term or filters change
    useEffect(() => {
        if (jobs.length === 0) return;
        
        let result = [...jobs];
        
        // Filter by active status (check both isActive and status fields)
        result = result.filter(job => 
            (job.isActive === true || job.isActive === undefined) && 
            (job.status === 'open' || job.status === undefined)
        );
        
        // Filter by search term
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(job => 
                job.title?.toLowerCase().includes(term) ||
                job.description?.toLowerCase().includes(term) ||
                job.location?.toLowerCase().includes(term)
            );
        }
        
        // Filter by employment type
        if (employmentTypeFilter !== 'all') {
            result = result.filter(job => 
                job.employmentType?.toLowerCase() === employmentTypeFilter.toLowerCase()
            );
        }
        
        setFilteredJobs(result);
    }, [jobs, searchTerm, employmentTypeFilter]);

    const fetchJobs = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            
            // Use getPublicJobs() for public-facing listings
            const response = await jobAPI.getPublicJobs();
            
            // Handle various response formats
            let jobsArray = [];
            if (Array.isArray(response)) {
                jobsArray = response;
            } else if (response?.data) {
                jobsArray = response.data;
            } else if (response?.jobs) {
                jobsArray = response.jobs;
            } else if (response) {
                // Handle single job object
                jobsArray = [response];
            }
            
            // Validate and clean job data
            const validatedJobs = jobsArray.map(job => ({
                ...job,
                isActive: job.isActive ?? true,
                status: job.status || 'open',
                shareableLink: job.shareableLink || `/jobs/${job._id || job.title?.toLowerCase().replace(/\s+/g, '-')}`,
                // Ensure salary is properly formatted
                salary: formatSalary(job.salary),
                // Add a fallback for missing dates
                postedDate: job.createdAt || job.postedDate || new Date().toISOString()
            }));
            
            setJobs(validatedJobs);
            
            if (validatedJobs.length === 0) {
                setError('No job postings available at the moment.');
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Failed to load jobs. Please try again later.');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const formatSalary = (salary) => {
        if (!salary) return 'Salary not specified';
        // Clean up salary formatting
        if (typeof salary === 'string') {
            return salary.replace(/\$/g, '$').trim();
        }
        if (typeof salary === 'number') {
            return `$${salary.toLocaleString()}`;
        }
        if (Array.isArray(salary)) {
            return `$${salary[0].toLocaleString()} - $${salary[1].toLocaleString()}`;
        }
        return salary;
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (type) => {
        setEmploymentTypeFilter(type);
    };

    const handleRetry = () => {
        fetchJobs();
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading jobs...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Available Jobs</h1>
                <p className="text-gray-600">Find your next career opportunity</p>
            </div>

            {/* Search and Filter Section */}
            <div className="mb-8 bg-white rounded-lg shadow p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                        <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                            Search Jobs
                        </label>
                        <input
                            type="text"
                            id="search"
                            placeholder="Search by title, description, or location..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Employment Type
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {['all', 'full-time', 'part-time', 'contract', 'remote', 'hybrid'].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => handleFilterChange(type)}
                                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                        employmentTypeFilter === type
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {type === 'all' ? 'All Types' : type.replace('-', ' ').toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
                
                {/* Active filters display */}
                {(searchTerm || employmentTypeFilter !== 'all') && (
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
                            {searchTerm && ` for "${searchTerm}"`}
                        </div>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setEmploymentTypeFilter('all');
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800"
                        >
                            Clear filters
                        </button>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Error Loading Jobs</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>{error}</p>
                            </div>
                        </div>
                        <div className="ml-auto pl-3">
                            <button
                                onClick={handleRetry}
                                className="text-sm font-medium text-red-800 hover:text-red-900"
                            >
                                Try Again →
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Job Listings Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                        <JobCard key={job._id || job.shareableLink} job={job} />
                    ))
                ) : (
                    <div className="col-span-3 text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">
                            {jobs.length === 0 ? 'No Jobs Available' : 'No Matching Jobs Found'}
                        </h3>
                        <p className="text-gray-500 mb-6">
                            {jobs.length === 0 
                                ? 'Check back later for new opportunities' 
                                : 'Try adjusting your search criteria or filters'}
                        </p>
                        {jobs.length > 0 && (
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setEmploymentTypeFilter('all');
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Clear all filters
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Results Summary */}
            {filteredJobs.length > 0 && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <div className="flex flex-col md:flex-row justify-between items-center">
                        <p className="text-gray-600 mb-4 md:mb-0">
                            Showing <span className="font-semibold">{filteredJobs.length}</span> of{' '}
                            <span className="font-semibold">{jobs.length}</span> available job{filteredJobs.length !== 1 ? 's' : ''}
                        </p>
                        <div className="text-sm text-gray-500">
                            Last updated: {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default JobListings;