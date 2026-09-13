import React from 'react';

const ProgressCard = ({ subject, completed, total, icon: Icon, colorClass }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="card-interactive p-4 flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${colorClass} text-white flex items-center justify-center shrink-0`}>
          <Icon className="w-4.5 h-4.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{subject}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {completed} of {total} completed
          </p>
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{percentage}%</span>
      </div>

      <div className="progress-bar">
        <div
          className={`progress-bar-fill ${colorClass}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressCard;
