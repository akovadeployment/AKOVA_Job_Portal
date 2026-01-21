// models/Job.js - FIXED
const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  salary: {
    type: String,
    default: 'Not specified',
    trim: true
  },
  employmentType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Remote', 'Hybrid'],
    default: 'Full-time'
  },
  status: {
    type: String,
    enum: ['open', 'closed', 'draft'],
    default: 'open'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  shareableLink: {
    type: String,
    unique: true
  },
  closedAt: {
    type: Date
  },
  closedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Applicant'
  }],
  skills: [{
    type: String,
    trim: true
  }],
  experienceLevel: {
    type: String,
    enum: ['Entry', 'Mid', 'Senior', 'Lead'],
    default: 'Mid'
  },
  company: {
    type: String,
    trim: true
  },
  department: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Pre-save middleware to generate shareable link - FIXED
jobSchema.pre('save', function(next) {
  // Only generate shareableLink if it doesn't exist
  if (!this.shareableLink) {
    const slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);
    
    const uniqueId = Math.random().toString(36).substr(2, 9);
    this.shareableLink = `/jobs/${slug}-${uniqueId}`;
  }
  
  // Update closedAt when status changes to closed
  if (this.isModified('status') && this.status === 'closed' && !this.closedAt) {
    this.closedAt = new Date();
  }
  
  // Update closedAt to null when reopening
  if (this.isModified('status') && this.status === 'open' && this.closedAt) {
    this.closedAt = null;
    this.closedBy = null;
  }
  
  // Check if next is a function before calling it
  if (next && typeof next === 'function') {
    next();
  }
});

// Indexes for better query performance
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ status: 1, isActive: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ employmentType: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);