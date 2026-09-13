import React from 'react';
import {
  FiBriefcase,
  FiMapPin,
  FiCalendar,
  FiDollarSign,
  FiAward,
  FiExternalLink,
  FiInfo,
  FiClock,
  FiAlertCircle
} from 'react-icons/fi';

const priorityStyles = {
  Urgent: {
    badge: 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50',
    dot: 'bg-rose-600 animate-ping'
  },
  High: {
    badge: 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900/50',
    dot: 'bg-amber-500'
  },
  Medium: {
    badge: 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/50',
    dot: 'bg-blue-500'
  },
  Low: {
    badge: 'bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700',
    dot: 'bg-gray-400'
  }
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const d = new Date(dateString);
  return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
};

const AnnouncementCard = ({ announcement, onViewDetails }) => {
  if (!announcement) return null;

  const [imgError, setImgError] = React.useState(false);
  const priority = announcement.priority || 'Medium';
  const styling = priorityStyles[priority] || priorityStyles.Medium;

  const formattedDriveDate = formatDate(announcement.driveDate);
  const formattedDeadline = formatDate(announcement.applicationDeadline);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 shadow-[0px_4px_25px_rgba(0,0,0,0.03)] hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-800/60 transition-all duration-300 flex flex-col justify-between h-full group relative overflow-hidden">
      {/* Top Header: Company + Priority Badge */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white font-extrabold text-base flex items-center justify-center shadow-sm shrink-0">
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
              <h3 className="font-extrabold text-sm text-gray-900 dark:text-white leading-tight">
                {announcement.companyName}
              </h3>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                {announcement.jobRole}
              </span>
            </div>
          </div>

          <div className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border flex items-center gap-1.5 shrink-0 ${styling.badge}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${styling.dot}`}></span>
            {priority} Priority
          </div>
        </div>

        {/* Title */}
        <h4 className="text-base font-bold text-gray-900 dark:text-white mb-3 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors line-clamp-2 leading-snug">
          {announcement.title}
        </h4>

        {/* Key Info Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-4 text-xs font-medium text-gray-600 dark:text-gray-300">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
            <FiDollarSign className="text-emerald-500 w-4 h-4 shrink-0" />
            <span className="truncate font-bold text-gray-900 dark:text-white">
              {announcement.package || 'Competitive'}
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
            <FiMapPin className="text-blue-500 w-4 h-4 shrink-0" />
            <span className="truncate font-semibold">
              {announcement.location || 'Pan India'}
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
            <FiAward className="text-purple-500 w-4 h-4 shrink-0" />
            <span className="truncate" title={announcement.eligibility}>
              {announcement.eligibility || 'All Batches'}
            </span>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/60">
            <FiCalendar className="text-orange-500 w-4 h-4 shrink-0" />
            <span className="truncate">
              {formattedDriveDate ? `Drive: ${formattedDriveDate}` : formattedDeadline ? `Due: ${formattedDeadline}` : 'Drive Soon'}
            </span>
          </div>
        </div>

        {/* Skills Chips */}
        {announcement.requiredSkills && announcement.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {announcement.requiredSkills.slice(0, 3).map((skill, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/30"
              >
                {skill}
              </span>
            ))}
            {announcement.requiredSkills.length > 3 && (
              <span className="px-1.5 py-0.5 rounded-lg text-[10px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-800">
                +{announcement.requiredSkills.length - 3} more
              </span>
            )}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center gap-2.5">
        <button
          onClick={() => onViewDetails(announcement)}
          className="flex-1 py-2.5 px-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <FiInfo className="w-3.5 h-3.5 text-indigo-500" />
          <span>View Details</span>
        </button>

        {announcement.applicationLink ? (
          <a
            href={announcement.applicationLink}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Apply Now</span>
            <FiExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : (
          <button
            onClick={() => onViewDetails(announcement)}
            className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5 shrink-0"
          >
            <span>Apply Details</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AnnouncementCard;
