import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import Badge from '../../../components/ui/Badge';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import {
  getStudentReasoningBookmarksRequest,
  deleteStudentReasoningBookmarkRequest
} from '../../../api/reasoning';
import {
  FiArrowLeft,
  FiBookmark,
  FiTrash2,
  FiBookOpen,
  FiList,
  FiCheckCircle,
  FiHelpCircle,
  FiArrowRight
} from 'react-icons/fi';

const ReasoningBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, Question, TopicNote

  const fetchBookmarks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getStudentReasoningBookmarksRequest();
      if (res.data.success) {
        setBookmarks(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
      setError('Unable to load saved bookmarks. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteStudentReasoningBookmarkRequest(id);
      setBookmarks(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error('Error deleting bookmark:', err);
    }
  };

  const filteredBookmarks = bookmarks.filter(b => {
    if (filterType === 'all') return true;
    return b.itemType === filterType;
  });

  const questionCount = bookmarks.filter(b => b.itemType === 'Question').length;
  const noteCount = bookmarks.filter(b => b.itemType === 'TopicNote').length;

  const headerActions = (
    <div className="tab-list">
      <button
        onClick={() => setFilterType('all')}
        className={`tab-item ${filterType === 'all' ? 'tab-item-active' : ''}`}
      >
        All ({bookmarks.length})
      </button>
      <button
        onClick={() => setFilterType('Question')}
        className={`tab-item ${filterType === 'Question' ? 'tab-item-active' : ''}`}
      >
        Questions ({questionCount})
      </button>
      <button
        onClick={() => setFilterType('TopicNote')}
        className={`tab-item ${filterType === 'TopicNote' ? 'tab-item-active' : ''}`}
      >
        Study Guides ({noteCount})
      </button>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title="Saved Reasoning Bookmarks"
        subtitle="Review and revise your bookmarked reasoning questions, tricks, and study guides."
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Logical Reasoning', to: '/student/reasoning' },
          { label: 'Bookmarks' }
        ]}
        actions={headerActions}
      />

      {loading ? (
        <LoadingState variant="list" rows={3} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchBookmarks} />
        </div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="card p-8">
          <EmptyState
            icon={FiBookmark}
            title="No bookmarked items found"
            description="You haven't bookmarked any reasoning items yet. Click the bookmark icon on questions or notes to save them for revision."
            action={
              <Link
                to="/student/reasoning/practice"
                className="btn-primary text-xs"
              >
                Go to Practice Arena
              </Link>
            }
          />
        </div>
      ) : (
        <div className="space-y-4 max-w-4xl">
          {filteredBookmarks.map(b => {
            const isQuestion = b.itemType === 'Question';
            const item = b.item || {};

            return (
              <div
                key={b._id}
                className="card p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all"
              >
                <div className="space-y-2.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={isQuestion ? 'primary' : 'neutral'} size="sm">
                      {isQuestion ? 'Practice Question' : 'Study Guide'}
                    </Badge>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      {item.topic || item.category || 'General Reasoning'}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-relaxed">
                    {isQuestion ? item.questionText : item.title || `${item.topic} Master Guide`}
                  </h3>

                  {isQuestion ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/40 rounded-lg text-xs space-y-1 border border-gray-100 dark:border-gray-800">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Answer: {item.correctAnswer}
                      </span>
                      {item.explanation && (
                        <p className="text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                          {item.explanation}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                      {item.introduction}
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center gap-2 self-end sm:self-start shrink-0">
                  {isQuestion ? (
                    <Link
                      to={`/student/reasoning/practice?search=${encodeURIComponent((item.questionText || '').slice(0, 20))}`}
                      className="btn-secondary text-xs"
                    >
                      <span>Practice</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ) : (
                    <Link
                      to={`/student/reasoning/${item.slug || 'logical-reasoning'}/notes`}
                      className="btn-secondary text-xs"
                    >
                      <span>Read Note</span>
                      <FiArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}

                  <button
                    onClick={() => handleDelete(b._id)}
                    className="btn-icon text-gray-400 hover:text-rose-500"
                    title="Remove Bookmark"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReasoningBookmarks;
