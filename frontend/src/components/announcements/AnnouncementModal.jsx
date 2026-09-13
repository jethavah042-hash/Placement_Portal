import React from 'react';
import {
  FiX,
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiAward,
  FiCheckCircle,
  FiExternalLink,
  FiClock,
  FiAlertTriangle,
  FiFileText,
  FiHelpCircle
} from 'react-icons/fi';

const formatDate = (dateString) => {
  if (!dateString) return 'To be announced';
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
};

const AnnouncementModal = ({ announcement, isOpen, onClose }) => {
  if (!isOpen || !announcement) return null;

  const [imgError, setImgError] = React.useState(false);
  const driveDateStr = formatDate(announcement.driveDate);
  const deadlineStr = formatDate(announcement.applicationDeadline);
  const interviewDateStr = formatDate(announcement.interviewDate);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl border border-gray-100 dark:border-gray-800 shadow-2xl overflow-hidden my-8 transform transition-all">
        {/* Modal Header */}
        <div className="p-6 sm:p-7 border-b border-gray-100 dark:border-gray-800 flex items-start justify-between gap-4 bg-blue-50/50 dark:bg-blue-950/20">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white font-extrabold text-xl flex items-center justify-center shadow-sm shrink-0">
              {announcement.companyLogo && !imgError ? (
                <img
                  src={announcement.companyLogo}
                  alt={announcement.companyName}
                  className="w-full h-full object-contain rounded-2xl p-1 bg-white"
                  onError={() => setImgError(true)}
                />
              ) : (
                announcement.companyName.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                  announcement.priority === 'Urgent'
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400 border border-rose-200 dark:border-rose-900'
                    : announcement.priority === 'High'
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 border border-amber-200 dark:border-amber-900'
                    : 'bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400 border border-blue-200 dark:border-blue-900'
                }`}>
                  {announcement.priority || 'Medium'} Priority
                </span>
                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                  {announcement.companyName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 dark:text-white mt-1">
                {announcement.jobRole}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Key Facts Summary Box */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
            <div>
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">Package (CTC)</span>
              <strong className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                {announcement.package || 'Not Disclosed'}
              </strong>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">Location</span>
              <strong className="text-sm font-bold text-gray-900 dark:text-white mt-0.5 block">
                {announcement.location || 'Pan India'}
              </strong>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">Drive Date</span>
              <strong className="text-xs font-bold text-gray-900 dark:text-white mt-0.5 block">
                {driveDateStr}
              </strong>
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase text-gray-400 tracking-wider block">Deadline</span>
              <strong className="text-xs font-bold text-rose-600 dark:text-rose-400 mt-0.5 block">
                {deadlineStr}
              </strong>
            </div>
          </div>

          {/* Eligibility */}
          <div className="space-y-1.5">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <FiAward className="text-indigo-500" /> Eligibility Criteria
            </h3>
            <div className="p-3.5 rounded-xl bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs font-semibold text-gray-800 dark:text-gray-200">
              {announcement.eligibility || 'Open to all eligible graduating students.'}
            </div>
          </div>

          {/* Required Skills */}
          {announcement.requiredSkills && announcement.requiredSkills.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <FiCheckCircle className="text-emerald-500" /> Required Skills & Competencies
              </h3>
              <div className="flex flex-wrap gap-2">
                {announcement.requiredSkills.map((skill, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-xl text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
              <FiFileText className="text-blue-500" /> Job Description & Overview
            </h3>
            <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line bg-white dark:bg-gray-900 p-1">
              {announcement.description}
            </div>
          </div>

          {/* Instructions if any */}
          {announcement.instructions && (
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                <FiAlertTriangle /> Important Instructions for Candidates
              </h3>
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 text-xs text-amber-900 dark:text-amber-200 leading-relaxed whitespace-pre-line">
                {announcement.instructions}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/30">
          <button
            onClick={onClose}
            className="py-2.5 px-5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            Close
          </button>

          {announcement.applicationLink ? (
            <a
              href={announcement.applicationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
            >
              <span>Apply on Company Portal</span>
              <FiExternalLink className="w-4 h-4" />
            </a>
          ) : (
            <button
              onClick={onClose}
              className="py-2.5 px-6 rounded-xl bg-indigo-600 text-white text-xs font-extrabold"
            >
              Registered on Portal
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnnouncementModal;
