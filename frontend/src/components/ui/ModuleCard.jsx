import React from 'react';
import { Link } from 'react-router-dom';

const ModuleCard = ({
  title,
  description,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50 dark:bg-indigo-950/40',
  progress,
  stats,
  to = '#',
  badge,
  badgeColor,
  className = '',
}) => {
  const hasProgress = progress !== undefined && progress !== null;
  const clampedProgress = hasProgress ? Math.min(100, Math.max(0, Number(progress))) : 0;

  return (
    <Link
      to={to}
      className={`card-interactive p-5 flex flex-col justify-between group ${className}`.trim()}
    >
      <div>
        {/* Top section: icon + optional badge */}
        <div className="flex items-center justify-between gap-2">
          {Icon ? (
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
              {React.isValidElement(Icon) ? Icon : <Icon className="w-5 h-5" />}
            </div>
          ) : (
            <div className={`w-9 h-9 rounded-lg shrink-0 ${iconBg}`} />
          )}

          {badge && (
            <span
              className={
                badgeColor ||
                'inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/50'
              }
            >
              {badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-3">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
            {description}
          </p>
        )}
      </div>

      {/* Progress & Bottom action */}
      <div className="mt-4">
        {hasProgress && (
          <div>
            <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${clampedProgress}%` }}
              />
            </div>
            {stats && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                {stats}
              </div>
            )}
          </div>
        )}

        {!hasProgress && stats && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {stats}
          </div>
        )}

        <div className="text-xs font-medium text-indigo-600 dark:text-indigo-400 mt-3 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
          Continue &rarr;
        </div>
      </div>
    </Link>
  );
};

export default ModuleCard;
