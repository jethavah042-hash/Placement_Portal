import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import {
  getStudentEnglishBookmarksRequest,
  deleteStudentEnglishBookmarkRequest
} from '../../../api/english';
import {
  FiBookmark,
  FiTrash2,
  FiArrowRight
} from 'react-icons/fi';

const EnglishBookmarks = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, Question, TopicNote, Vocabulary

  const fetchBookmarks = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getStudentEnglishBookmarksRequest();
      if (res.data.success) {
        setBookmarks(res.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching English bookmarks:', err);
      setError('Unable to load bookmarks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteStudentEnglishBookmarkRequest(id);
      setBookmarks(prev => prev.filter(b => b._id !== id));
    } catch (err) {
      console.error('Error deleting bookmark:', err);
    }
  };

  const filteredBookmarks = bookmarks.filter(b => {
    if (filterType === 'all') return true;
    return b.itemType === filterType;
  });

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title="Saved English Bookmarks"
        subtitle="Review your saved verbal questions, vocabulary flashcards, and grammar guides."
        breadcrumbs={[
          { label: 'English & Verbal', to: '/student/english' },
          { label: 'Bookmarks' }
        ]}
        actions={
          <div className="tab-list">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`tab-item ${
                filterType === 'all'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-semibold'
                  : ''
              }`}
            >
              All ({bookmarks.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('Question')}
              className={`tab-item ${
                filterType === 'Question'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-semibold'
                  : ''
              }`}
            >
              Questions
            </button>
            <button
              type="button"
              onClick={() => setFilterType('Vocabulary')}
              className={`tab-item ${
                filterType === 'Vocabulary'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-semibold'
                  : ''
              }`}
            >
              Vocabulary
            </button>
            <button
              type="button"
              onClick={() => setFilterType('TopicNote')}
              className={`tab-item ${
                filterType === 'TopicNote'
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-semibold'
                  : ''
              }`}
            >
              Guides
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingState variant="list" rows={3} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchBookmarks} />
      ) : filteredBookmarks.length === 0 ? (
        <EmptyState
          icon={FiBookmark}
          title="No bookmarked items found"
          description="Click the bookmark icon on any question, vocabulary card, or study note to save it here for quick revision."
          action={
            <Link
              to="/student/english/practice"
              className="btn-primary"
            >
              <span>Go to Practice Arena</span>
              <FiArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      ) : (
        <div className="space-y-4 max-w-4xl">
          {filteredBookmarks.map(b => {
            const isQuestion = b.itemType === 'Question';
            const isVocab = b.itemType === 'Vocabulary';
            const isNote = b.itemType === 'TopicNote';
            const item = b.item;

            const typeBadge =
              isQuestion
                ? 'badge-primary'
                : isVocab
                ? 'badge-success'
                : 'badge-neutral';

            return (
              <div
                key={b._id}
                className="card p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 transition-all hover:border-indigo-200 dark:hover:border-indigo-800"
              >
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={typeBadge}>
                      {isQuestion
                        ? 'Practice Question'
                        : isVocab
                        ? 'Vocabulary Word'
                        : 'Study Guide'}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {item?.topic || item?.category || item?.partOfSpeech}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white capitalize">
                    {isQuestion ? item?.questionText : isVocab ? item?.word : item?.title}
                  </h3>

                  {isQuestion ? (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-xs space-y-1 border border-gray-100 dark:border-gray-800">
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Answer: {item?.correctAnswer}
                      </span>
                      {item?.explanation && (
                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                          {item?.explanation}
                        </p>
                      )}
                    </div>
                  ) : isVocab ? (
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      <p><strong>Meaning:</strong> {item?.meaning}</p>
                      {item?.exampleSentence && (
                        <p className="italic text-gray-500 dark:text-gray-400 mt-1">
                          "{item?.exampleSentence}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                      {item?.introduction}
                    </p>
                  )}
                </div>

                <div className="flex sm:flex-col items-center gap-2 self-end sm:self-start shrink-0">
                  {isQuestion ? (
                    <Link
                      to={`/student/english/practice?search=${encodeURIComponent(item?.questionText?.slice(0, 20) || '')}`}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Practice
                    </Link>
                  ) : isVocab ? (
                    <Link
                      to={`/student/english/vocabulary?search=${encodeURIComponent(item?.word || '')}`}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Review
                    </Link>
                  ) : (
                    <Link
                      to={`/student/english/${item?.slug}/notes`}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Read Note
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={() => handleDelete(b._id)}
                    className="btn-icon text-gray-400 hover:text-rose-600"
                    title="Remove Bookmark"
                    aria-label="Remove Bookmark"
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

export default EnglishBookmarks;
