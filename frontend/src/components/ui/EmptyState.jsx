import React from 'react';
import { FiInbox } from 'react-icons/fi';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'No results found',
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500">
        {React.isValidElement(Icon) ? (
          Icon
        ) : (
          <Icon className="h-6 w-6" aria-hidden="true" />
        )}
      </div>
      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
        {title}
      </h4>
      {description && (
        <p className="mt-1 max-w-sm text-xs text-gray-500 dark:text-gray-400">
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4 flex items-center justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
