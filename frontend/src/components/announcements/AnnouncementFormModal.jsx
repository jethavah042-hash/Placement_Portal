import React, { useState, useEffect } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';

const AnnouncementFormModal = ({ announcement, isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    companyLogo: '',
    jobRole: '',
    description: '',
    package: '',
    eligibility: '',
    requiredSkills: '',
    location: '',
    driveDate: '',
    applicationDeadline: '',
    interviewDate: '',
    instructions: '',
    applicationLink: '',
    priority: 'Medium',
    status: 'Published'
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (announcement) {
      setFormData({
        title: announcement.title || '',
        companyName: announcement.companyName || '',
        companyLogo: announcement.companyLogo || '',
        jobRole: announcement.jobRole || '',
        description: announcement.description || '',
        package: announcement.package || '',
        eligibility: announcement.eligibility || '',
        requiredSkills: Array.isArray(announcement.requiredSkills)
          ? announcement.requiredSkills.join(', ')
          : announcement.requiredSkills || '',
        location: announcement.location || '',
        driveDate: announcement.driveDate ? new Date(announcement.driveDate).toISOString().split('T')[0] : '',
        applicationDeadline: announcement.applicationDeadline ? new Date(announcement.applicationDeadline).toISOString().split('T')[0] : '',
        interviewDate: announcement.interviewDate ? new Date(announcement.interviewDate).toISOString().split('T')[0] : '',
        instructions: announcement.instructions || '',
        applicationLink: announcement.applicationLink || '',
        priority: announcement.priority || 'Medium',
        status: announcement.status || 'Published'
      });
    } else {
      setFormData({
        title: '',
        companyName: '',
        companyLogo: '',
        jobRole: '',
        description: '',
        package: '',
        eligibility: '',
        requiredSkills: '',
        location: '',
        driveDate: '',
        applicationDeadline: '',
        interviewDate: '',
        instructions: '',
        applicationLink: '',
        priority: 'Medium',
        status: 'Published'
      });
    }
    setError('');
  }, [announcement, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title.trim() || !formData.companyName.trim() || !formData.jobRole.trim() || !formData.description.trim()) {
      setError('Title, Company Name, Job Role, and Description are required.');
      return;
    }

    setSaving(true);
    try {
      await onSave(formData, announcement?._id);
      onClose();
    } catch (err) {
      console.error('Error saving announcement:', err);
      setError(err.response?.data?.message || 'Failed to save announcement.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 w-full max-w-3xl rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden my-8 transform transition-all">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-gray-900 dark:text-white">
              {announcement?._id ? 'Edit Company Announcement' : 'Create Company Announcement / Requirement'}
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Publish placement drives, eligibility notices, and CTC packages to students.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-5 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
              <FiAlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Row 1: Company Name & Job Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Company Name *
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="e.g. Tata Consultancy Services (TCS)"
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Job Role / Designation *
              </label>
              <input
                type="text"
                name="jobRole"
                value={formData.jobRole}
                onChange={handleChange}
                placeholder="e.g. Software Development Engineer"
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>
          </div>

          {/* Announcement Title */}
          <div>
            <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Announcement Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. TCS National Qualifier Test (NQT) & Digital Campus Hiring 2026"
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold"
            />
          </div>

          {/* Row 2: Package, Eligibility, Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Package / CTC
              </label>
              <input
                type="text"
                name="package"
                value={formData.package}
                onChange={handleChange}
                placeholder="e.g. 7.5 - 9.0 LPA"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 font-bold text-emerald-600 dark:text-emerald-400"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Ahmedabad / Bengaluru"
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Company Logo URL
              </label>
              <input
                type="url"
                name="companyLogo"
                value={formData.companyLogo}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Eligibility Criteria */}
          <div>
            <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Eligibility Criteria
            </label>
            <input
              type="text"
              name="eligibility"
              value={formData.eligibility}
              onChange={handleChange}
              placeholder="e.g. MCA / B.Tech (60% or 6.0 CGPA throughout education. Max 1 backlog allowed)."
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Skills (comma separated) */}
          <div>
            <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              name="requiredSkills"
              value={formData.requiredSkills}
              onChange={handleChange}
              placeholder="e.g. JavaScript, React.js, Node.js, DSA, SQL"
              className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Row 3: Priority & Status & Application Link */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="Urgent">🔥 Urgent Priority</option>
                <option value="High">⭐ High Priority</option>
                <option value="Medium">🔹 Medium Priority</option>
                <option value="Low">⚪ Low Priority</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Publication Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white font-bold focus:outline-none focus:border-indigo-500"
              >
                <option value="Published">✅ Published (Live on Dashboard)</option>
                <option value="Draft">📝 Draft (Hidden from Students)</option>
                <option value="Expired">⌛ Expired</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Application URL Link
              </label>
              <input
                type="url"
                name="applicationLink"
                value={formData.applicationLink}
                onChange={handleChange}
                placeholder="https://nextstep.tcs.com..."
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Row 4: Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Drive Date
              </label>
              <input
                type="date"
                name="driveDate"
                value={formData.driveDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                Interview Date
              </label>
              <input
                type="date"
                name="interviewDate"
                value={formData.interviewDate}
                onChange={handleChange}
                className="w-full px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Full Job Description & Overview *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter detailed role overview, department expectations, job responsibilities..."
              required
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            ></textarea>
          </div>

          {/* Instructions */}
          <div>
            <label className="block text-xs font-extrabold text-gray-600 dark:text-gray-300 uppercase tracking-wider mb-1.5">
              Special Instructions for Candidates
            </label>
            <textarea
              name="instructions"
              rows={2}
              value={formData.instructions}
              onChange={handleChange}
              placeholder="e.g. Upload resume before deadline. Bring 2 copies of college ID and academic transcripts."
              className="w-full p-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800 text-xs text-gray-900 dark:text-white focus:outline-none focus:border-indigo-500 leading-relaxed"
            ></textarea>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all flex items-center gap-1.5"
            >
              {saving ? 'Saving...' : announcement?._id ? 'Update Announcement' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AnnouncementFormModal;
