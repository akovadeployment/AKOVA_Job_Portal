const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware - Updated for production
const allowedOrigins = [
    'http://localhost:5173', 
    'http://localhost:5174', 
    'http://localhost:3000',
    'https://akova-job-portal.vercel.app',
    'https://akovajobsportal.vercel.app'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
    next();
});

// MongoDB Connection - FIXED for Mongoose 7+
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully');
        
        // Optional: Log connection details
        const db = mongoose.connection;
        console.log(`📊 Database: ${db.name}`);
        console.log(`🏠 Host: ${db.host}`);
        console.log(`🔌 Port: ${db.port}`);
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err.message);
        console.error('❌ Full Error:', err);
        process.exit(1);
    });

// Optional: Add MongoDB connection event listeners
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB Connection Error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('✅ MongoDB reconnected');
});

// Import routes
const authRoutes = require('./routes/auth');
const jobRoutes = require('./routes/jobs');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
    const dbState = mongoose.connection.readyState;
    const dbStatus = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    
    res.json({
        status: 'OK',
        message: 'Job Portal API is running',
        timestamp: new Date().toISOString(),
        database: {
            status: dbStatus[dbState] || 'unknown',
            readyState: dbState
        },
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime()
    });
});

// Welcome route
app.get('/', (req, res) => {
    res.json({
        message: '🎯 Job Portal API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        endpoints: {
            auth: '/api/auth',
            jobs: '/api/jobs',
            health: '/health'
        },
        documentation: 'Check /health for API status'
    });
});

// 404 handler
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        path: req.path,
        method: req.method,
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('❌ Server Error:', err.stack);
    
    // Handle CORS errors
    if (err.message.includes('CORS policy')) {
        return res.status(403).json({
            success: false,
            error: 'CORS Error',
            message: err.message
        });
    }
    
    res.status(err.status || 500).json({
        success: false,
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'production' ? undefined : err.message
    });
});

// Start Server - IMPORTANT for Render
const PORT = process.env.PORT || 5000;
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

// Validate port
if (isNaN(PORT) || PORT < 1 || PORT > 65535) {
    console.error('❌ Invalid PORT:', PORT);
    process.exit(1);
}

const server = app.listen(PORT, HOST, () => {
    console.log(`🚀 Server running on http://${HOST}:${PORT}`);
    console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health Check: http://${HOST}:${PORT}/health`);
    console.log(`🗄️  MongoDB URI: ${process.env.MONGODB_URI ? 'Configured' : 'Not configured'}`);
});

// Graceful shutdown
const shutdown = () => {
    console.log('🛑 Shutdown signal received');
    server.close(() => {
        console.log('✅ HTTP server closed');
        mongoose.connection.close(false, () => {
            console.log('✅ MongoDB connection closed');
            process.exit(0);
        });
    });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app; // For testing purposes