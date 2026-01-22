// routes/jobs.js - FIXED with proper authentication
const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const router = express.Router();

// Import the verifyToken middleware - THIS WAS MISSING
const verifyToken = require('./auth'); // Adjust path as needed

// GET /jobs - Get all jobs with filtering (PUBLIC - no auth needed)
router.get('/', async (req, res) => {
  try {
    const { 
      status, 
      showAll, 
      search, 
      location, 
      employmentType,
      experienceLevel,
      sort = '-createdAt',
      limit = 50,
      page = 1
    } = req.query;

    let filter = { isActive: true };

    if (showAll !== 'true') {
      filter.$or = [
        { status: 'open' },
        { status: { $exists: false } }
      ];
    } else if (status) {
      if (status !== 'all') {
        filter.status = status;
      }
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (location) {
      filter.location = new RegExp(location, 'i');
    }

    if (employmentType && employmentType !== 'all') {
      filter.employmentType = employmentType;
    }

    if (experienceLevel && experienceLevel !== 'all') {
      filter.experienceLevel = experienceLevel;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Job.countDocuments(filter)
    ]);

    const totalJobs = await Job.countDocuments({ isActive: true });
    const openJobs = await Job.countDocuments({ 
      isActive: true, 
      $or: [{ status: 'open' }, { status: { $exists: false } }] 
    });
    const closedJobs = await Job.countDocuments({ isActive: true, status: 'closed' });

    res.json({
      success: true,
      data: jobs,
      count: jobs.length,
      total,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit))
      },
      stats: {
        total: totalJobs,
        open: openJobs,
        closed: closedJobs
      }
    });

  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching jobs' 
    });
  }
});

// GET /jobs/:id - Get single job (PUBLIC - no auth needed)
router.get('/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    
    if (!job || !job.isActive) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }
    
    await Job.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching job' 
    });
  }
});

// GET /jobs/:identifier - Get single job (supports both ID and slug)
router.get('/:identifier', async (req, res) => {
  try {
    const { identifier } = req.params;
    let job;
    
    // Check if identifier is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(identifier)) {
      // Try to find by ID first
      job = await Job.findById(identifier).lean();
    }
    
    // If not found by ID or not a valid ObjectId, try to find by slug
    if (!job) {
      job = await Job.findOne({ 
        slug: identifier,
        isActive: true 
      }).lean();
    }
    
    // If still not found, try to find by title slug
    if (!job) {
      // Convert the identifier to a regex pattern to match in title
      const titlePattern = identifier.replace(/-/g, '[-\\s]');
      job = await Job.findOne({
        title: { $regex: new RegExp(titlePattern, 'i') },
        isActive: true
      }).lean();
    }
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }
    
    await Job.findByIdAndUpdate(job._id, { $inc: { views: 1 } });
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching job',
      details: error.message 
    });
  }
});

// POST /jobs - Create new job (NO AUTH REQUIRED)
router.post('/', async (req, res) => {
  try {
    console.log('📤 Creating job - Request body:', req.body);
    
    const { 
      title, 
      description, 
      location, 
      salary, 
      employmentType, 
      status,
      skills,
      experienceLevel,
      company,
      department
    } = req.body;
    
    // Validation
    if (!title || !description || !location) {
      return res.status(400).json({ 
        success: false,
        error: 'Title, description, and location are required' 
      });
    }
    
    // Create job without authentication
    const job = new Job({
      title,
      description,
      location,
      salary: salary || 'Not specified',
      employmentType: employmentType || 'Full-time',
      status: status || 'open',
      skills: skills || [],
      experienceLevel: experienceLevel || 'Mid',
      company: company || 'Our Company',
      department: department || 'Engineering'
    });
    
    console.log('💾 Saving job:', job);
    await job.save();
    
    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: job
    });
  } catch (error) {
    console.error('❌ Error creating job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while creating job',
      details: error.message 
    });
  }
});

// PUT /jobs/:id - Update job (PROTECTED)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    console.log('🔄 Updating job:', req.params.id, req.body);
    
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }
    
    const wasClosed = job.status === 'closed';
    const willBeClosed = req.body.status === 'closed';
    
    const updateData = { ...req.body };
    delete updateData._id;
    
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        job[key] = updateData[key];
      }
    });
    
    if (!wasClosed && willBeClosed) {
      job.closedAt = new Date();
      job.closedBy = req.user.userId;
    }
    
    if (wasClosed && req.body.status === 'open') {
      job.closedAt = null;
      job.closedBy = null;
    }
    
    await job.save();
    
    res.json({
      success: true,
      message: 'Job updated successfully',
      data: job
    });
  } catch (error) {
    console.error('❌ Error updating job:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Server error while updating job' 
    });
  }
});

// DELETE /jobs/:id - Soft delete (PROTECTED)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }
    
    job.isActive = false;
    await job.save();
    
    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while deleting job' 
    });
  }
});

// PATCH /jobs/:id/close - Close job (PROTECTED)
// PATCH /jobs/:id/close - Close job (NO AUTH)
router.patch('/:id/close', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }
    
    if (job.status === 'closed') {
      return res.status(400).json({
        success: false,
        error: 'Job is already closed'
      });
    }
    
    job.status = 'closed';
    job.closedAt = new Date();
    // Remove closedBy since there's no authentication
    
    await job.save();
    
    res.json({
      success: true,
      message: 'Job closed successfully',
      data: job
    });
  } catch (error) {
    console.error('Error closing job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while closing job' 
    });
  }
});

// PATCH /jobs/:id/reopen - Reopen job (NO AUTH)
router.patch('/:id/reopen', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    
    if (!job) {
      return res.status(404).json({ 
        success: false,
        error: 'Job not found' 
      });
    }
    
    if (job.status === 'open') {
      return res.status(400).json({
        success: false,
        error: 'Job is already open'
      });
    }
    
    job.status = 'open';
    job.closedAt = null;
    job.closedBy = null;
    
    await job.save();
    
    res.json({
      success: true,
      message: 'Job reopened successfully',
      data: job
    });
  } catch (error) {
    console.error('Error reopening job:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while reopening job' 
    });
  }
});

// GET /jobs/stats/overview - Get job statistics (PROTECTED)
router.get('/stats/overview', verifyToken, async (req, res) => {
  try {
    const totalJobs = await Job.countDocuments({ isActive: true });
    const openJobs = await Job.countDocuments({ 
      isActive: true, 
      $or: [{ status: 'open' }, { status: { $exists: false } }] 
    });
    const closedJobs = await Job.countDocuments({ isActive: true, status: 'closed' });
    
    const byEmploymentType = await Job.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$employmentType', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const byExperienceLevel = await Job.aggregate([
      { $match: { isActive: true, experienceLevel: { $exists: true } } },
      { $group: { _id: '$experienceLevel', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    const recentJobs = await Job.find({ isActive: true })
      .sort({ updatedAt: -1 })
      .limit(5)
      .select('title status updatedAt')
      .lean();
    
    res.json({
      success: true,
      data: {
        total: totalJobs,
        open: openJobs,
        closed: closedJobs,
        closedPercentage: totalJobs > 0 ? Math.round((closedJobs / totalJobs) * 100) : 0,
        byEmploymentType,
        byExperienceLevel,
        recentActivity: recentJobs
      }
    });
  } catch (error) {
    console.error('Error fetching job stats:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching job statistics' 
    });
  }
});

// GET /jobs/search/suggestions - Get search suggestions
router.get('/search/suggestions', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.length < 2) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const suggestions = await Job.find({
      isActive: true,
      $or: [
        { title: new RegExp(query, 'i') },
        { description: new RegExp(query, 'i') },
        { location: new RegExp(query, 'i') }
      ]
    })
    .select('title location employmentType')
    .limit(10)
    .lean();
    
    res.json({
      success: true,
      data: suggestions
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching suggestions' 
    });
  }
});

module.exports = router;