import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';

const ErrorState = ({
  message = 'Something went wrong',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400">
        <FiAlertCircle className="h-6 w-6" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium text-gray-900 dark:text-white">
        {message}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Please check your connection and try again.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="btn-primary mt-4 cursor-pointer"
        >
          <FiRefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
};

export default ErrorState;
