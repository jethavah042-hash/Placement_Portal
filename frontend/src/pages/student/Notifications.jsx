import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import { FiBell, FiActivity, FiCheckCircle, FiAlertCircle, FiBriefcase, FiCheck } from 'react-icons/fi';

const Notifications = () => {
  const notifications = [
    { id: 1, type: 'alert', title: 'TCS NQT Drive Announced', desc: 'Registrations are open until August 15th for the upcoming off-campus recruitment drive.', date: '2 hours ago', read: false },
    { id: 2, type: 'success', title: 'Mock Test #12 Graded', desc: 'Your comprehensive mock test evaluation is ready. Performance analytics available.', date: '1 day ago', read: false },
    { id: 3, type: 'alert', title: 'Campus Algorithm Sprint', desc: 'Weekend coding contest is live. Solve 4 algorithmic challenges in 60 minutes.', date: '2 days ago', read: true },
  ];

  const recentActivity = [
    { id: 1, action: 'Solved Two Sum', type: 'Coding Arena', time: 'Today, 2:30 PM' },
    { id: 2, action: 'Completed Verbal Ability Quiz', type: 'Assessment', time: 'Yesterday, 6:00 PM' },
    { id: 3, action: 'Reviewed Infosys Hiring Pattern', type: 'Company Prep', time: 'Aug 04, 2026' },
    { id: 4, action: 'Scanned Resume (ATS Score 82%)', type: 'Resume Optimizer', time: 'Aug 02, 2026' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Notifications & Study Feed"
        subtitle="Real-time campus recruitment drives, grading updates, and recent learning milestones."
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Active Alerts</h2>
            <button className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline">
              Mark all as read
            </button>
          </div>

          <div className="space-y-3">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`card p-4 flex items-start gap-3.5 transition-colors ${
                  !notif.read ? 'border-indigo-200 dark:border-indigo-800/80 bg-indigo-50/20 dark:bg-indigo-950/20' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  notif.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                    : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                }`}>
                  {notif.type === 'success' ? (
                    <FiCheckCircle className="w-4 h-4" />
                  ) : (
                    <FiAlertCircle className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                      {notif.title}
                    </h3>
                    <span className="text-[10px] text-gray-400 font-mono shrink-0">{notif.date}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                    {notif.desc}
                  </p>
                </div>

                {!notif.read && (
                  <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Column */}
        <div>
          <div className="card p-5">
            <SectionHeader
              title="Recent Activity"
              subtitle="Study milestones"
            />

            <div className="space-y-4 relative pl-7 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-px before:bg-gray-200 dark:before:bg-gray-800">
              {recentActivity.map((act) => (
                <div key={act.id} className="relative">
                  <span className="absolute -left-7 top-1 w-2.5 h-2.5 rounded-full bg-indigo-600 ring-4 ring-white dark:ring-gray-900" />
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{act.action}</h4>
                    <p className="text-[10px] text-gray-400 mt-0.5">{act.time} • {act.type}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Notifications;
