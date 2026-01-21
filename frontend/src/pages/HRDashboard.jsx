import React, { useState, useEffect } from 'react';
import { jobAPI } from '../services/api';
import JobForm from '../components/JobForm';

const HRDashboard = () => {
    const [jobs, setJobs] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        closed: 0
    });

    useEffect(() => {
        fetchJobs();
        fetchStats();
    }, [activeTab]);

    const fetchJobs = async () => {
        try {
            setLoading(true);
            setError('');

            let status = '';
            if (activeTab === 'open') status = 'open';
            if (activeTab === 'closed') status = 'closed';

            const data = await jobAPI.getAllJobs({ status, showAll: true });
            setJobs(data);

            if (!data || data.length === 0) {
                setError(`No ${activeTab === 'all' ? '' : activeTab + ' '}jobs found.`);
            }
        } catch (err) {
            console.error('Error fetching jobs:', err);
            setError('Failed to load jobs. Please try again.');
            setJobs([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const statsData = await jobAPI.getJobStats();
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setStats({
                total: 0,
                open: 0,
                closed: 0
            });
        }
    };

    const handleCreate = async (jobData) => {
        try {
            console.log('📤 Creating job with data:', jobData);
            
            const createdJob = await jobAPI.createJob(jobData);
            console.log('✅ Job created:', createdJob);
            
            fetchJobs();
            fetchStats();
            setShowForm(false);
            alert('Job created successfully!');
        } catch (error) {
            console.error('❌ Error creating job:', error);
            alert(error.message || 'Failed to create job. Please try again.');
        }
    };

    const handleUpdate = async (id, jobData) => {
        try {
            await jobAPI.updateJob(id, jobData);
            fetchJobs();
            fetchStats();
            setEditingJob(null);
            alert('Job updated successfully!');
        } catch (error) {
            console.error('Error updating job:', error);
            alert(error.message || 'Failed to update job.');
        }
    };

    const handleCloseJob = async (id, jobTitle) => {
        if (window.confirm(`Are you sure you want to close "${jobTitle}"?`)) {
            try {
                await jobAPI.closeJob(id);
                fetchJobs();
                fetchStats();
                alert('Job closed successfully!');
            } catch (error) {
                console.error('Error closing job:', error);
                alert(error.message || 'Failed to close job.');
            }
        }
    };

    const handleReopenJob = async (id, jobTitle) => {
        if (window.confirm(`Are you sure you want to reopen "${jobTitle}"?`)) {
            try {
                await jobAPI.reopenJob(id);
                fetchJobs();
                fetchStats();
                alert('Job reopened successfully!');
            } catch (error) {
                console.error('Error reopening job:', error);
                alert(error.message || 'Failed to reopen job.');
            }
        }
    };

    const handleDelete = async (id, jobTitle) => {
        if (window.confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
            try {
                await jobAPI.deleteJob(id);
                fetchJobs();
                fetchStats();
                alert('Job deleted successfully!');
            } catch (error) {
                console.error('Error deleting job:', error);
                alert(error.message || 'Failed to delete job.');
            }
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            open: 'bg-green-100 text-green-800',
            closed: 'bg-gray-100 text-gray-800',
            draft: 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || 'bg-gray-100'}`}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-12">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header with Stats */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">HR Dashboard</h1>
                        <p className="text-gray-600 mt-1">Manage your job postings</p>
                    </div>
                    <button
                        onClick={() => setShowForm(true)}
                        className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center space-x-2"
                    >
                        <span>+</span>
                        <span>New Job</span>
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Total Jobs</p>
                                <p className="text-2xl font-bold">{stats.total}</p>
                            </div>
                            <div className="text-blue-500">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Open Jobs</p>
                                <p className="text-2xl font-bold text-green-600">{stats.open}</p>
                            </div>
                            <div className="text-green-500">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-500">Closed Jobs</p>
                                <p className="text-2xl font-bold text-gray-600">{stats.closed}</p>
                            </div>
                            <div className="text-gray-500">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex space-x-4 border-b mb-6">
                    <button
                        onClick={() => setActiveTab('all')}
                        className={`pb-2 px-4 ${activeTab === 'all' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        All Jobs ({stats.total})
                    </button>
                    <button
                        onClick={() => setActiveTab('open')}
                        className={`pb-2 px-4 ${activeTab === 'open' ? 'border-b-2 border-green-600 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Open ({stats.open})
                    </button>
                    <button
                        onClick={() => setActiveTab('closed')}
                        className={`pb-2 px-4 ${activeTab === 'closed' ? 'border-b-2 border-gray-600 text-gray-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Closed ({stats.closed})
                    </button>
                </div>
            </div>

            {error && !loading && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-yellow-800">{error}</p>
                </div>
            )}

            {showForm && (
                <JobForm
                    onSubmit={handleCreate}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {editingJob && (
                <JobForm
                    job={editingJob}
                    onSubmit={(data) => handleUpdate(editingJob._id, data)}
                    onCancel={() => setEditingJob(null)}
                />
            )}

            {/* Jobs Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {jobs && jobs.length > 0 ? (
                    <>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Title & Company
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Department
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Type & Level
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Salary
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Skills
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Posted
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {jobs.map((job) => (
                                        <tr key={job._id} className="hover:bg-gray-50">
                                            {/* Title & Company */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {job.title}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {job.company || 'N/A'}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Department */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {job.department || 'N/A'}
                                                </div>
                                            </td>

                                            {/* Location */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{job.location}</div>
                                            </td>

                                            {/* Type & Level */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <div className="text-sm text-gray-900">
                                                        {job.employmentType || 'Full-time'}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        {job.experienceLevel || 'Mid'} Level
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Salary */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {job.salary || 'Not specified'}
                                                </div>
                                            </td>

                                            {/* Skills */}
                                            <td className="px-6 py-4">
                                                <div className="flex flex-wrap gap-1 max-w-xs">
                                                    {job.skills && job.skills.length > 0 ? (
                                                        job.skills.slice(0, 3).map((skill, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded"
                                                            >
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <span className="text-xs text-gray-400">No skills</span>
                                                    )}
                                                    {job.skills && job.skills.length > 3 && (
                                                        <span className="text-xs text-gray-500">
                                                            +{job.skills.length - 3} more
                                                        </span>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Status */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    {getStatusBadge(job.status)}
                                                    {job.closedAt && (
                                                        <div className="text-xs text-gray-500 mt-1">
                                                            Closed: {new Date(job.closedAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Posted Date */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">
                                                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex flex-col gap-1">
                                                    {job.status === 'open' || job.status === 'draft' ? (
                                                        <>
                                                            <button
                                                                onClick={() => setEditingJob(job)}
                                                                className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors text-left"
                                                            >
                                                                Edit
                                                            </button>
                                                            <button
                                                                onClick={() => handleCloseJob(job._id, job.title)}
                                                                className="text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-50 transition-colors text-left"
                                                            >
                                                                Close
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(job._id, job.title)}
                                                                className="text-red-600 hover:text-red-900 px-2 py-1 rounded hover:bg-red-50 transition-colors text-left"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => handleReopenJob(job._id, job.title)}
                                                                className="text-green-600 hover:text-green-900 px-2 py-1 rounded hover:bg-green-50 transition-colors text-left"
                                                            >
                                                                Reopen
                                                            </button>
                                                            <button
                                                                onClick={() => setEditingJob(job)}
                                                                className="text-blue-600 hover:text-blue-900 px-2 py-1 rounded hover:bg-blue-50 transition-colors text-left"
                                                            >
                                                                View
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                            <p className="text-sm text-gray-500">
                                Showing {jobs.length} job{jobs.length !== 1 ? 's' : ''}
                                {activeTab !== 'all' && ` (${activeTab} only)`}
                            </p>
                        </div>
                    </>
                ) : (
                    !error && (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📭</div>
                            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Jobs Found</h3>
                            <p className="text-gray-500 mb-6">
                                {activeTab === 'closed'
                                    ? 'No closed jobs found.'
                                    : 'Create your first job posting to get started'}
                            </p>
                            {activeTab !== 'closed' && (
                                <button
                                    onClick={() => setShowForm(true)}
                                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create First Job
                                </button>
                            )}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default HRDashboard;