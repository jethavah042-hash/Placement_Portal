import React from 'react';
import { Link } from 'react-router-dom';

const StatCard = ({
  label,
  value,
  icon: Icon,
  iconColor = 'text-indigo-600',
  iconBg = 'bg-indigo-50 dark:bg-indigo-950/40',
  trend,
  trendUp,
  to,
  className = '',
}) => {
  const content = (
    <>
      <div className="flex items-center justify-between">
        {Icon && (
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${iconBg} ${iconColor}`}>
            {React.isValidElement(Icon) ? Icon : <Icon className="w-5 h-5" />}
          </div>
        )}
        {trend && (
          <span
            className={`text-xs font-medium ${
              trendUp
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      <div className="mt-4">
        <div className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
          {value}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {label}
        </div>
      </div>
    </>
  );

  const containerClasses = `bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-5 ${
    to ? 'hover:border-indigo-200 dark:hover:border-indigo-800 transition duration-200 block' : ''
  } ${className}`.trim();

  if (to) {
    return (
      <Link to={to} className={containerClasses}>
        {content}
      </Link>
    );
  }

  return <div className={containerClasses}>{content}</div>;
};

export default StatCard;
