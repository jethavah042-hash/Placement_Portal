import React from 'react';
import { FiSearch, FiX } from 'react-icons/fi';

const SearchBar = ({
  value = '',
  onChange,
  placeholder = 'Search...',
  className = '',
}) => {
  const handleClear = () => {
    if (onChange) {
      onChange({ target: { value: '' } });
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      <FiSearch
        className="pointer-events-none absolute left-3.5 h-4 w-4 text-gray-400 dark:text-gray-500"
        aria-hidden="true"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`input pl-10 ${value ? 'pr-10' : ''}`}
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute right-3 flex h-5 w-5 items-center justify-center rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors focus:outline-none"
        >
          <FiX className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
