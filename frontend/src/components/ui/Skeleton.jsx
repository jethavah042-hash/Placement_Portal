import React from 'react';

const Skeleton = ({ className = '', type = 'box' }) => {
  const baseClasses = 'animate-pulse bg-gray-200 dark:bg-gray-800';
  
  if (type === 'text') {
    return <div className={`${baseClasses} h-4 w-3/4 rounded-md ${className}`} />;
  }
  
  if (type === 'circle') {
    return <div className={`${baseClasses} rounded-full flex-shrink-0 ${className}`} />;
  }
  
  return <div className={`${baseClasses} rounded-xl ${className}`} />;
};

export default Skeleton;
