import React from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiAlertCircle, FiAward, FiCode, FiBook, FiClock } from 'react-icons/fi';

const ActivityFeed = ({ activities = [] }) => {
  const getActivityStyle = (type) => {
    switch (type) {
      case 'coding':
        return { icon: FiCode, bg: 'bg-purple-50 dark:bg-purple-950/40', color: 'text-purple-600 dark:text-purple-400' };
      case 'test':
        return { icon: FiCheckCircle, bg: 'bg-emerald-50 dark:bg-emerald-950/40', color: 'text-emerald-600 dark:text-emerald-400' };
      case 'milestone':
        return { icon: FiAward, bg: 'bg-amber-50 dark:bg-amber-950/40', color: 'text-amber-600 dark:text-amber-400' };
      case 'alert':
        return { icon: FiAlertCircle, bg: 'bg-rose-50 dark:bg-rose-950/40', color: 'text-rose-600 dark:text-rose-400' };
      case 'lesson':
      case 'aptitude':
      case 'reasoning':
      case 'english':
        return { icon: FiBook, bg: 'bg-indigo-50 dark:bg-indigo-950/40', color: 'text-indigo-600 dark:text-indigo-400' };
      default:
        return { icon: FiClock, bg: 'bg-blue-50 dark:bg-blue-950/40', color: 'text-blue-600 dark:text-blue-400' };
    }
  };

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
        <span className="badge-neutral text-[10px]">Live</span>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <FiClock className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-700 mb-3" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">No activity yet</p>
          <p className="text-xs text-gray-400">Start your preparation journey today.</p>
          <Link
            to="/student/mock-tests"
            className="inline-flex items-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline mt-3"
          >
            Take your first test →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((item, index) => {
            const { icon: Icon, bg, color } = getActivityStyle(item.type);
            return (
              <div key={item.id || index} className="relative pl-9">
                {/* Timeline connector */}
                {index !== activities.length - 1 && (
                  <span className="absolute top-7 left-3.5 -ml-px h-full w-px bg-gray-200 dark:bg-gray-800" />
                )}

                {/* Icon */}
                <span className={`absolute left-0 top-0.5 w-7 h-7 rounded-lg flex items-center justify-center ${bg} ${color}`}>
                  <Icon className="w-3.5 h-3.5" />
                </span>

                {/* Content */}
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">
                    {item.text || item.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {item.module && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-500">
                        {item.module}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{item.time || item.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActivityFeed;
