const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
// Update CORS settings - FIXED: Added PATCH method
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'], // Added PATCH
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        process.exit(1);
    });

// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Job Portal API is running',
        timestamp: new Date().toISOString(),
        database: mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'
    });
});

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: '🎯 Job Portal API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            jobs: '/api/jobs',
            health: '/health'
        }
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    res.status(500).json({
        success: false,
        error: 'Internal server error'
    });
});

// Start Server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 API URL: http://localhost:${PORT}`);
    console.log(`🔗 Health Check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
        });
    });
});