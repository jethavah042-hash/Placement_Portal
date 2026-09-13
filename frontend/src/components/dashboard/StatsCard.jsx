import React from 'react';
import { Link } from 'react-router-dom';

const StatsCard = ({ title, value, icon: Icon, trend, trendUp, colorClass, to }) => {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>
      <div className="mt-3">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{value}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{title}</p>
      </div>
    </>
  );

  const cardClasses = "card p-5 transition-all duration-200 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md hover:shadow-indigo-500/5";

  if (to) {
    return <Link to={to} className={cardClasses}>{content}</Link>;
  }

  return <div className={cardClasses}>{content}</div>;
};

export default StatsCard;
