import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import EmptyState from '../../components/ui/EmptyState';
import { FiBookmark, FiCode, FiList, FiTrash2, FiArrowRight } from 'react-icons/fi';

const Bookmarks = () => {
  const [activeTab, setActiveTab] = useState('questions');

  const savedQuestions = [
    { id: 1, type: 'Aptitude', q: 'In an election between two candidates, 75% of the voters cast their votes...', date: 'Aug 04, 2026' },
    { id: 2, type: 'Reasoning', q: 'Find the missing number in the sequence 2, 6, 12, 20, 30, ...?', date: 'Aug 03, 2026' },
    { id: 3, type: 'English', q: 'Identify the error: She did not wrote the letter.', date: 'Aug 01, 2026' },
  ];

  const savedProblems = [
    { id: 1, title: 'Two Sum', diff: 'Easy', date: 'Aug 05, 2026' },
    { id: 2, title: 'Median of Two Sorted Arrays', diff: 'Hard', date: 'Jul 29, 2026' },
    { id: 3, title: 'Merge Intervals', diff: 'Medium', date: 'Jul 22, 2026' },
  ];

  return (
    <DashboardLayout>
      <PageHeader
        title="Saved Bookmarks"
        subtitle="Review your flagged conceptual questions and algorithmic challenges."
      />

      <div className="card overflow-hidden">
        {/* Tab List */}
        <div className="p-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30">
          <div className="tab-list max-w-xs">
            <button
              onClick={() => setActiveTab('questions')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'questions' ? 'tab-item-active' : 'tab-item'
              }`}
            >
              <FiList className="w-3.5 h-3.5" />
              <span>Questions</span>
            </button>
            <button
              onClick={() => setActiveTab('problems')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'problems' ? 'tab-item-active' : 'tab-item'
              }`}
            >
              <FiCode className="w-3.5 h-3.5" />
              <span>Coding Problems</span>
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="p-5">
          {activeTab === 'questions' && (
            <div className="space-y-3">
              {savedQuestions.length === 0 ? (
                <EmptyState
                  icon={FiBookmark}
                  title="No questions bookmarked"
                  description="Bookmark difficult questions while practicing to revisit them here."
                />
              ) : (
                savedQuestions.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div>
                      <span className="badge-primary text-[10px] mb-1.5">
                        {item.type}
                      </span>
                      <h4 className="text-xs font-semibold text-gray-900 dark:text-white leading-relaxed">
                        {item.q}
                      </h4>
                      <p className="text-[10px] text-gray-400 mt-1">Saved: {item.date}</p>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                      <button className="btn-secondary text-xs py-1.5 px-3">
                        View Solution
                      </button>
                      <button
                        className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                        title="Remove Bookmark"
                      >
                        <FiTrash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'problems' && (
            <div className="space-y-3">
              {savedProblems.length === 0 ? (
                <EmptyState
                  icon={FiCode}
                  title="No problems bookmarked"
                  description="Star algorithmic challenges in the coding arena to review them here."
                />
              ) : (
                savedProblems.map((item) => {
                  const badgeClass =
                    item.diff === 'Easy'
                      ? 'badge-success'
                      : item.diff === 'Medium'
                      ? 'badge-primary'
                      : 'badge-danger';

                  return (
                    <div
                      key={item.id}
                      className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={badgeClass}>{item.diff}</span>
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                        </div>
                        <p className="text-[10px] text-gray-400">Saved: {item.date}</p>
                      </div>

                      <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
                        <button className="btn-primary text-xs py-1.5 px-3">
                          Launch IDE
                        </button>
                        <button
                          className="btn-icon text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30"
                          title="Remove Bookmark"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Bookmarks;
