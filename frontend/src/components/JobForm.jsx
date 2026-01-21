import React, { useState, useEffect } from 'react';

const JobForm = ({ job, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    salary: '',
    employmentType: 'Full-time',
    skills: [],
    experienceLevel: 'Mid',
    company: 'AKOVA',
    department: '',
    status: 'open'
  });

  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title || '',
        description: job.description || '',
        location: job.location || '',
        salary: job.salary || '',
        employmentType: job.employmentType || 'Full-time',
        skills: job.skills || [],
        experienceLevel: job.experienceLevel || 'Mid',
        company: job.company || '',
        department: job.department || '',
        status: job.status || 'open'
      });
    }
  }, [job]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Add ₹ symbol automatically for salary field
    if (name === 'salary') {
      let formattedValue = value;
      // Remove any existing ₹ symbol to avoid duplicates
      formattedValue = formattedValue.replace(/^₹\s*/, '');
      // Add ₹ symbol at the beginning if it's not empty
      if (formattedValue.trim() !== '') {
        formattedValue = `₹${formattedValue}`;
      }
      setFormData({
        ...formData,
        [name]: formattedValue,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter(skill => skill !== skillToRemove)
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  // Handle salary field click to position cursor correctly
  const handleSalaryClick = (e) => {
    const salaryInput = e.target;
    // Move cursor to position after ₹ symbol
    if (salaryInput.value.startsWith('₹') && salaryInput.selectionStart < 1) {
      salaryInput.setSelectionRange(1, 1);
    }
  };

  // Handle salary field key down to prevent deleting ₹ symbol
  const handleSalaryKeyDown = (e) => {
    if (e.target.name === 'salary') {
      const cursorPos = e.target.selectionStart;
      
      // Prevent deleting the ₹ symbol
      if (cursorPos === 1 && (e.key === 'Backspace' || e.key === 'Delete')) {
        e.preventDefault();
      }
      
      // Prevent moving cursor before ₹ symbol with arrow keys
      if (cursorPos === 0 && e.key === 'ArrowLeft') {
        e.preventDefault();
        e.target.setSelectionRange(1, 1);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[85vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">
          {job ? 'Edit Job' : 'Create New Job'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          {/* Two-column layout for form fields */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Job Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>

              {/* Company */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Acme Corporation"
                />
              </div>

              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Engineering, Marketing, Sales"
                />
              </div>
              
              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="e.g., Remote, Kolkata"
                />
              </div>

              {/* Row: Employment Type and Experience Level */}
              <div className="grid grid-cols-2 gap-4">
                {/* Employment Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    value={formData.employmentType}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Internship">Internship</option>
                    <option value="Remote">Remote</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                {/* Experience Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Experience Level
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleChange}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Lead">Lead/Manager</option>
                  </select>
                </div>
              </div>

              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Salary Range
                </label>
                <input
                  type="text"
                  name="salary"
                  value={formData.salary}
                  onChange={handleChange}
                  onClick={handleSalaryClick}
                  onKeyDown={handleSalaryKeyDown}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 80,000 - 1,20,000"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Required Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddSkill(e);
                      }
                    }}
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., React, Node.js, Python"
                  />
                  <button
                    type="button"
                    onClick={handleAddSkill}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {/* Skills Display */}
                {formData.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                    {formData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill)}
                          className="ml-1 text-blue-600 hover:text-blue-800 font-bold"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Job Description - Full width in right column */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Job Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="10"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  placeholder="Describe the job responsibilities, requirements, and qualifications..."
                />
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-3 border-t pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {job ? 'Update Job' : 'Create Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;