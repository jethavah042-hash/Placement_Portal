import React from 'react';

const LoadingState = ({ variant = 'page', rows = 3 }) => {
  const rowCount = Math.max(1, rows);

  if (variant === 'card') {
    return (
      <div className="card p-5 space-y-3 animate-pulse">
        <div className="h-4 w-3/4 rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-full rounded-lg bg-gray-200 dark:bg-gray-800" />
        <div className="h-4 w-1/2 rounded-lg bg-gray-200 dark:bg-gray-800" />
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className="card overflow-hidden animate-pulse divide-y divide-gray-200 dark:divide-gray-800">
        {/* Table Header Row */}
        <div className="flex items-center justify-between gap-4 bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="h-4 w-28 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-36 rounded-lg bg-gray-200 dark:bg-gray-800 hidden sm:block" />
          <div className="h-4 w-24 rounded-lg bg-gray-200 dark:bg-gray-800 hidden md:block" />
          <div className="h-4 w-16 rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        {/* Table Data Rows */}
        {Array.from({ length: rowCount }).map((_, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-4 p-4"
          >
            <div className="h-4 w-32 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-44 rounded-lg bg-gray-200 dark:bg-gray-800 hidden sm:block" />
            <div className="h-4 w-20 rounded-lg bg-gray-200 dark:bg-gray-800 hidden md:block" />
            <div className="h-6 w-16 rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className="space-y-3 animate-pulse">
        {Array.from({ length: rowCount }).map((_, index) => (
          <div
            key={index}
            className="card p-4 flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="space-y-2 flex-1 min-w-0">
                <div className="h-4 w-1/3 rounded-lg bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-1/2 rounded-lg bg-gray-200 dark:bg-gray-800" />
              </div>
            </div>
            <div className="h-8 w-20 shrink-0 rounded-lg bg-gray-200 dark:bg-gray-800 hidden sm:block" />
          </div>
        ))}
      </div>
    );
  }

  // Default: 'page' variant
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <div className="h-7 w-48 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="h-4 w-72 rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
        <div className="h-9 w-28 rounded-lg bg-gray-200 dark:bg-gray-800 shrink-0" />
      </div>

      {/* Grid of 4 card placeholders */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-4 w-24 rounded-lg bg-gray-200 dark:bg-gray-800" />
              <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-800" />
            </div>
            <div className="h-8 w-20 rounded-lg bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-32 rounded-lg bg-gray-200 dark:bg-gray-800" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingState;
