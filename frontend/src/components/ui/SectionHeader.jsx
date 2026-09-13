import React from 'react';

const SectionHeader = ({ title, subtitle, badge, action }) => {
  return (
    <div className="mb-4 flex items-center justify-between gap-4">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {badge && (
            <span className="badge-neutral">
              {badge}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {subtitle}
          </p>
        )}
      </div>

      {action && (
        <div className="flex items-center gap-2 shrink-0">
          {action}
        </div>
      )}
    </div>
  );
};

export default SectionHeader;
