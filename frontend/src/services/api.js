import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000, // 10 second timeout
});

// Request interceptor - Add token and logging
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    console.log('📤 API Request:', {
        url: config.url,
        method: config.method,
        data: config.data,
        headers: config.headers
    });

    return config;
}, (error) => {
    console.error('❌ Request setup error:', error);
    return Promise.reject(error);
});

// Response interceptor - Handle responses and errors
api.interceptors.response.use(
    (response) => {
        console.log('✅ API Response:', {
            url: response.config.url,
            status: response.status,
            data: response.data
        });
        return response;
    },
    (error) => {
        console.log('❌ API Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });

        // Handle specific error cases
        if (error.response) {
            // Server responded with error status
            switch (error.response.status) {
                case 401:
                    // Unauthorized - clear tokens and redirect to login
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    break;

                case 403:
                    // Forbidden
                    console.warn('Access forbidden - insufficient permissions');
                    break;

                case 404:
                    // Not found
                    console.warn('Resource not found');
                    break;

                case 500:
                    // Server error
                    console.error('Server error occurred');
                    break;

                default:
                    console.warn(`HTTP ${error.response.status} error`);
            }
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received from server');
        } else {
            // Something happened in setting up the request
            console.error('Request setup error:', error.message);
        }

        return Promise.reject(error);
    }
);

// Helper function to extract data from API response
const extractData = (response) => {
    // Handle different response structures
    if (response.data && response.data.success !== false) {
        return response.data.data || response.data;
    }
    throw new Error(response.data?.error || 'API request failed');
};

export const jobAPI = {
    // Get all jobs with optional status filter and dashboard flag
    getAllJobs: async (params = {}) => {
        try {
            const { status, showAll = false } = params;

            const requestParams = {};
            if (status) requestParams.status = status;
            if (showAll) requestParams.showAll = 'true';

            const response = await api.get('/jobs', { params: requestParams });
            const data = response.data;

            if (data.success === false) {
                console.error('API error:', data.error);
                return [];
            }

            // Ensure we always return an array
            return Array.isArray(data.data) ? data.data : (data.data || data.jobs || []);
        } catch (error) {
            console.error('Error fetching jobs:', error);
            return [];
        }
    },

    // Get jobs for public listing (only open jobs)
    getPublicJobs: async () => {
        try {
            // FIX: Explicitly request only open jobs
            const response = await api.get('/jobs', { params: { status: 'open' } });

            // Handle different response structures
            const data = response.data;

            if (data.success === false) {
                console.error('API error:', data.error);
                return [];
            }

            // Return the data array
            return data.data || data.jobs || [];
        } catch (error) {
            console.error('Error fetching public jobs:', error);
            return [];
        }
    },

    // Get single job by ID
    getJob: async (id) => {
        try {
            const response = await api.get(`/jobs/${id}`);
            const data = extractData(response);
            return data;
        } catch (error) {
            console.error(`Error fetching job ${id}:`, error);
            throw error; // Re-throw for the component to handle
        }
    },

    // Create new job
    createJob: async (jobData) => {
        try {
            console.log('📤 Creating job:', jobData);
            const response = await api.post('/jobs', jobData);
            const data = extractData(response);

            console.log('✅ Job created successfully:', data);
            return data;
        } catch (error) {
            console.error('❌ Error creating job:', error.response?.data || error.message);

            // Provide user-friendly error messages
            const errorMessage = error.response?.data?.error ||
                error.response?.data?.message ||
                'Failed to create job. Please try again.';

            throw new Error(errorMessage);
        }
    },

    // Update existing job
    updateJob: async (id, jobData) => {
        try {
            console.log('📝 Updating job:', id, jobData);
            const response = await api.put(`/jobs/${id}`, jobData);
            const data = extractData(response);

            console.log('✅ Job updated successfully:', data);
            return data;
        } catch (error) {
            console.error(`❌ Error updating job ${id}:`, error.response?.data || error.message);

            const errorMessage = error.response?.data?.error ||
                'Failed to update job. Please try again.';

            throw new Error(errorMessage);
        }
    },

    // Delete job (soft delete)
    deleteJob: async (id) => {
        try {
            console.log('🗑️  Deleting job:', id);
            const response = await api.delete(`/jobs/${id}`);
            const data = extractData(response);

            console.log('✅ Job deleted successfully');
            return data;
        } catch (error) {
            console.error(`❌ Error deleting job ${id}:`, error.response?.data || error.message);

            const errorMessage = error.response?.data?.error ||
                'Failed to delete job. Please try again.';

            throw new Error(errorMessage);
        }
    },

    // Close a job (change status to closed)
    closeJob: async (id) => {
        try {
            console.log('🔒 Closing job:', id);
            const response = await api.patch(`/jobs/${id}/close`);
            const data = extractData(response);

            console.log('✅ Job closed successfully');
            return data;
        } catch (error) {
            console.error(`❌ Error closing job ${id}:`, error.response?.data || error.message);

            const errorMessage = error.response?.data?.error ||
                'Failed to close job. Please try again.';

            throw new Error(errorMessage);
        }
    },

    // Reopen a closed job (change status to open)
    reopenJob: async (id) => {
        try {
            console.log('🔓 Reopening job:', id);
            const response = await api.patch(`/jobs/${id}/reopen`);
            const data = extractData(response);

            console.log('✅ Job reopened successfully');
            return data;
        } catch (error) {
            console.error(`❌ Error reopening job ${id}:`, error.response?.data || error.message);

            const errorMessage = error.response?.data?.error ||
                'Failed to reopen job. Please try again.';

            throw new Error(errorMessage);
        }
    },

    // Update job status (generic method)
    updateJobStatus: async (id, status) => {
        try {
            console.log('🔄 Updating job status:', id, status);
            const response = await api.put(`/jobs/${id}`, { status });
            const data = extractData(response);

            console.log('✅ Job status updated successfully');
            return data;
        } catch (error) {
            console.error(`❌ Error updating job status ${id}:`, error.response?.data || error.message);

            const errorMessage = error.response?.data?.error ||
                'Failed to update job status. Please try again.';

            throw new Error(errorMessage);
        }
    },

    // Get job statistics
    getJobStats: async () => {
        try {
            const response = await api.get('/jobs/stats/overview');
            return extractData(response);
        } catch (error) {
            console.error('Error fetching job stats:', error);
            return {
                total: 0,
                open: 0,
                closed: 0,
                closedPercentage: 0
            };
        }
    },

    // Get jobs by status (convenience methods)
    getOpenJobs: async () => {
        return jobAPI.getAllJobs({ status: 'open', showAll: true });
    },

    getClosedJobs: async () => {
        return jobAPI.getAllJobs({ status: 'closed', showAll: true });
    },

    // Search jobs by keyword
    searchJobs: async (keyword, location = '') => {
        try {
            const params = {};
            if (keyword) params.search = keyword;
            if (location) params.location = location;

            const response = await api.get('/jobs', { params });
            const data = extractData(response);

            return Array.isArray(data) ? data : (data?.data || data?.jobs || []);
        } catch (error) {
            console.error('Error searching jobs:', error);
            return [];
        }
    },

    // Get recently closed jobs (for dashboard)
    getRecentlyClosedJobs: async (limit = 5) => {
        try {
            const response = await api.get('/jobs', {
                params: {
                    status: 'closed',
                    showAll: 'true',
                    sort: '-closedAt'
                }
            });
            const data = extractData(response);

            const jobs = Array.isArray(data) ? data : (data?.data || data?.jobs || []);
            return jobs.slice(0, limit);
        } catch (error) {
            console.error('Error fetching recently closed jobs:', error);
            return [];
        }
    }
};

export const authAPI = {
    login: async (email, password) => {
        try {
            console.log('🔐 Attempting login:', email);
            const response = await api.post('/auth/login', { email, password });

            // Check for success flag in response
            if (response.data.success === false) {
                throw new Error(response.data.error || 'Login failed');
            }

            console.log('✅ Login successful:', response.data);
            return response.data;
        } catch (error) {
            console.error('❌ Login error:', error.response?.data || error.message);

            // Provide user-friendly error messages
            let errorMessage = 'Login failed. Please check your credentials.';

            if (error.response?.data?.error) {
                errorMessage = error.response.data.error;
            } else if (error.message.includes('Network Error')) {
                errorMessage = 'Cannot connect to server. Please check your connection.';
            } else if (error.message.includes('timeout')) {
                errorMessage = 'Connection timeout. Please try again.';
            }

            throw new Error(errorMessage);
        }
    },

    checkAuth: async () => {
        try {
            const response = await api.get('/auth/check');
            return response.data;
        } catch (error) {
            console.error('❌ Auth check error:', error);
            // Return not authenticated on error
            return { isAuthenticated: false };
        }
    },

    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        console.log('👋 User logged out');
    },

    // Optional: Register new HR user
    register: async (email, password, name) => {
        try {
            console.log('📝 Registering user:', email);
            const response = await api.post('/auth/register', { email, password, name });

            if (response.data.success === false) {
                throw new Error(response.data.error || 'Registration failed');
            }

            console.log('✅ Registration successful');
            return response.data;
        } catch (error) {
            console.error('❌ Registration error:', error.response?.data || error.message);

            const errorMessage = error.response?.data?.error ||
                'Registration failed. Please try again.';

            throw new Error(errorMessage);
        }
    },

    // Optional: Change password
    changePassword: async (currentPassword, newPassword) => {
        try {
            const response = await api.put('/auth/change-password', {
                currentPassword,
                newPassword
            });
            return extractData(response);
        } catch (error) {
            console.error('❌ Change password error:', error);
            throw error;
        }
    }
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
};

// Utility function to get current user
export const getCurrentUser = () => {
    try {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
    }
};

// Utility function to set auth data
export const setAuthData = (token, user) => {
    if (token) {
        localStorage.setItem('token', token);
    }
    if (user) {
        localStorage.setItem('user', JSON.stringify(user));
    }
};

// Utility function to clear auth data
export const clearAuthData = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

// Utility function to check user role
export const hasRole = (role) => {
    const user = getCurrentUser();
    return user && user.role === role;
};

// Utility function to check if user is HR
export const isHR = () => {
    return hasRole('hr') || hasRole('admin');
};

// Utility function to check if user is Admin
export const isAdmin = () => {
    return hasRole('admin');
};

// Utility function to format API errors for display
export const formatApiError = (error) => {
    if (error.response) {
        // Server responded with error
        const serverError = error.response.data;
        if (serverError.error) {
            return serverError.error;
        }
        if (serverError.message) {
            return serverError.message;
        }
    }

    if (error.request) {
        // Request made but no response
        return 'No response from server. Please check your connection.';
    }

    // Something else went wrong
    return error.message || 'An unexpected error occurred.';
};

// Helper to handle API calls with retry logic
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await apiCall();
        } catch (error) {
            if (attempt === maxRetries) {
                throw error;
            }

            console.log(`🔄 Retry attempt ${attempt} of ${maxRetries} after ${delay}ms`);
            await new Promise(resolve => setTimeout(resolve, delay * attempt));
        }
    }
};