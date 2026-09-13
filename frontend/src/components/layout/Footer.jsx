import React from 'react';

const Footer = () => {
  return (
    <footer className="w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 transition-colors py-6 mt-auto">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          &copy; {new Date().getFullYear()} PlacementPrep Portal. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
