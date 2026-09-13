import React from 'react';

const ReadinessScore = ({ score = 0, status = 'Good' }) => {
  const safeScore = Math.min(100, Math.max(0, Math.round(score)));
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (safeScore / 100) * circumference;

  const getColor = () => {
    if (safeScore >= 75) return { stroke: 'text-emerald-500', badge: 'badge-success' };
    if (safeScore >= 50) return { stroke: 'text-amber-500', badge: 'badge-warning' };
    return { stroke: 'text-rose-500', badge: 'badge-danger' };
  };

  const { stroke, badge } = getColor();

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Placement Readiness</h3>
        <span className={badge}>{status}</span>
      </div>

      <div className="flex items-center justify-center py-2">
        <div className="relative">
          <svg className="transform -rotate-90 w-36 h-36">
            <circle
              cx="72" cy="72" r={radius}
              stroke="currentColor" strokeWidth="10" fill="transparent"
              className="text-gray-100 dark:text-gray-800"
            />
            <circle
              cx="72" cy="72" r={radius}
              stroke="currentColor" strokeWidth="10" fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className={`${stroke} transition-all duration-1000 ease-out`}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">{safeScore}%</span>
            <span className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-0.5">Score</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-gray-500 dark:text-gray-400 mt-4 text-center leading-relaxed">
        Based on your Aptitude, Coding, and Mock Test performance.
      </p>
    </div>
  );
};

export default ReadinessScore;
