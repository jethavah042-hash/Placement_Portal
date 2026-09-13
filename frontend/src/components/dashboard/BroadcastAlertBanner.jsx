import React, { useState, useEffect } from 'react';
import { getMyNotificationsRequest } from '../../api/notifications';
import {
  FiBell,
  FiBriefcase,
  FiExternalLink,
  FiX,
  FiAlertCircle,
  FiArrowRight
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const BroadcastAlertBanner = () => {
  const [alerts, setAlerts] = useState([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await getMyNotificationsRequest();
        if (res.data.success && res.data.data) {
          // Take the most recent broadcast alert
          setAlerts(res.data.data.slice(0, 2));
        }
      } catch (err) {
        console.error('Error fetching broadcast alerts:', err);
      }
    };
    loadAlerts();
  }, []);

  if (dismissed || alerts.length === 0) return null;

  const latest = alerts[0];

  return (
    <div className="mb-8 p-5 sm:p-6 rounded-3xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/50 shadow-sm relative overflow-hidden transition-all animate-fade-in">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shrink-0 shadow-sm mt-0.5">
            {latest.type === 'company' ? <FiBriefcase /> : <FiBell className="animate-swing" />}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-600 text-white tracking-wider">
                📢 {latest.type === 'company' ? 'Company Recruitment Alert' : 'Live Placement Notice'}
              </span>
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                {new Date(latest.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            <h3 className="text-sm sm:text-base font-black text-gray-900 dark:text-white leading-tight">
              {latest.title}
            </h3>

            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl whitespace-pre-line">
              {latest.message}
            </p>

            {latest.link && (
              <div className="pt-2">
                {latest.link.startsWith('http') ? (
                  <a
                    href={latest.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <span>Visit Company Link</span>
                    <FiExternalLink className="w-3.5 h-3.5" />
                  </a>
                ) : (
                  <Link
                    to={latest.link}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition-all"
                  >
                    <span>View Placement Activity</span>
                    <FiArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={() => setDismissed(true)}
          className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-xl hover:bg-white/60 dark:hover:bg-gray-800 transition-colors"
          title="Dismiss Alert"
        >
          <FiX className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BroadcastAlertBanner;
