import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import {
  getStudentEnglishTopicNotesRequest,
  markStudentEnglishNotesCompletedRequest,
  toggleStudentEnglishBookmarkRequest,
  getStudentEnglishTopicsRequest
} from '../../../api/english';
import {
  FiBookOpen,
  FiCheckCircle,
  FiBookmark,
  FiCheck,
  FiAlertCircle,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiZap,
  FiAward
} from 'react-icons/fi';

const EnglishNotes = () => {
  const { topicId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [marking, setMarking] = useState(false);
  const [allTopics, setAllTopics] = useState([]);

  const fetchNote = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getStudentEnglishTopicNotesRequest(topicId);
      if (res.data.success) {
        setData(res.data.data);
        setIsCompleted(res.data.data.isNotesRead);
        setIsBookmarked(res.data.data.isBookmarked);
      }
    } catch (err) {
      console.error('Error fetching English notes:', err);
      setError('Unable to load English study guide.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNote();
  }, [topicId]);

  useEffect(() => {
    getStudentEnglishTopicsRequest()
      .then(res => {
        if (res.data.success) setAllTopics(res.data.data);
      })
      .catch(() => {});
  }, []);

  const handleMarkComplete = async () => {
    if (marking || isCompleted) return;
    setMarking(true);
    try {
      const res = await markStudentEnglishNotesCompletedRequest(topicId);
      if (res.data.success) {
        setIsCompleted(true);
      }
    } catch (err) {
      console.error('Error marking completed:', err);
    } finally {
      setMarking(false);
    }
  };

  const handleToggleBookmark = async () => {
    if (!data?.note?._id) return;
    try {
      const res = await toggleStudentEnglishBookmarkRequest({
        itemId: data.note._id,
        itemType: 'TopicNote'
      });
      if (res.data.success) {
        setIsBookmarked(res.data.isBookmarked);
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
    }
  };

  const currentIdx = allTopics.findIndex(t => t.slug === topicId);
  const prevTopic = currentIdx > 0 ? allTopics[currentIdx - 1] : null;
  const nextTopic = currentIdx > -1 && currentIdx < allTopics.length - 1 ? allTopics[currentIdx + 1] : null;

  const note = data?.note;
  const topic = data?.topic;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title={note?.title || `${topic?.name || 'Topic'} Study Guide`}
        subtitle="Grammatical rules, sentence structures, exceptions, shortcuts, and placement solved examples."
        breadcrumbs={[
          { label: 'English & Verbal', to: '/student/english' },
          { label: topic?.name || 'Topic', to: `/student/english/${topicId}` },
          { label: 'Study Guide' }
        ]}
        actions={
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleToggleBookmark}
              className={`btn-secondary ${isBookmarked ? 'text-amber-600 dark:text-amber-400' : ''}`}
              title={isBookmarked ? 'Saved' : 'Bookmark Guide'}
            >
              <FiBookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
              <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
            </button>

            <button
              type="button"
              onClick={handleMarkComplete}
              disabled={isCompleted || marking}
              className={isCompleted ? 'badge-success py-2 px-3 text-xs' : 'btn-primary'}
            >
              <FiCheckCircle className="w-4 h-4" />
              <span>{isCompleted ? 'Completed' : marking ? 'Saving...' : 'Mark Complete'}</span>
            </button>
          </div>
        }
      />

      {loading ? (
        <LoadingState variant="page" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchNote} />
      ) : (
        <div className="space-y-6 max-w-4xl">
          {/* Overview & Placement Context */}
          <div className="card p-6 space-y-3">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FiBookOpen className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
              <span>Overview & Placement Context</span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {note?.introduction || 'Comprehensive study note for verbal agility and placement testing.'}
            </p>
          </div>

          {/* Key Concepts */}
          {note?.concepts?.length > 0 && (
            <div className="card p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiZap className="text-amber-500 w-4 h-4" />
                <span>Key Concepts & Structural Mechanics</span>
              </h2>
              <div className="space-y-3">
                {note.concepts.map((c, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-800 space-y-1.5"
                  >
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white">
                      {c.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {c.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Grammatical Rules & Structures */}
          {note?.rules?.length > 0 && (
            <div className="card p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiCheckCircle className="text-emerald-500 w-4 h-4" />
                <span>Grammatical Rules & Structures</span>
              </h2>
              <div className="space-y-2">
                {note.rules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-emerald-50/40 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-xs text-gray-800 dark:text-gray-200 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Speed Shortcuts & Quick Tricks */}
          {note?.shortcuts?.length > 0 && (
            <div className="card p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiZap className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
                <span>Speed Shortcuts & Quick Tricks</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {note.shortcuts.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-indigo-50/40 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 space-y-1.5"
                  >
                    <strong className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 block">
                      {sc.name}
                    </strong>
                    <p className="text-xs text-gray-600 dark:text-gray-300">{sc.tip}</p>
                    {sc.example && (
                      <span className="text-[11px] font-mono text-gray-600 dark:text-gray-400 block bg-white dark:bg-gray-900 p-2 rounded-md border border-indigo-100 dark:border-indigo-900/30">
                        {sc.example}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solved Examples */}
          {note?.solvedExamples?.length > 0 && (
            <div className="card p-6 space-y-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FiHelpCircle className="text-indigo-600 dark:text-indigo-400 w-4 h-4" />
                <span>Placement Solved Examples</span>
              </h2>
              <div className="space-y-3">
                {note.solvedExamples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2.5"
                  >
                    <div className="text-xs font-semibold text-gray-900 dark:text-white whitespace-pre-line">
                      <span className="text-indigo-600 dark:text-indigo-400 mr-2">Example {idx + 1}:</span>
                      {ex.question}
                    </div>
                    <div className="p-3 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs text-indigo-950 dark:text-indigo-200">
                      <strong>Solution & Explanation:</strong> {ex.solution}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Common Mistakes & Placement Tips */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {note?.commonMistakes?.length > 0 && (
              <div className="card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                  <FiAlertCircle className="w-4 h-4" />
                  <span>Common Traps & Mistakes</span>
                </h3>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  {note.commonMistakes.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-rose-500 font-bold">&bull;</span>
                      <span>{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {note?.placementTips?.length > 0 && (
              <div className="card p-5 space-y-3">
                <h3 className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                  <FiAward className="w-4 h-4" />
                  <span>Interview & Placement Tips</span>
                </h3>
                <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                  {note.placementTips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold">&bull;</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Navigation Bar */}
          <div className="pt-2 flex items-center justify-between gap-4">
            {prevTopic ? (
              <Link
                to={`/student/english/${prevTopic.slug}/notes`}
                className="btn-secondary"
              >
                <FiChevronLeft className="w-4 h-4" />
                <span>Previous: {prevTopic.name}</span>
              </Link>
            ) : <div />}

            <Link
              to={`/student/english/${topicId}/mcqs`}
              className="btn-primary"
            >
              <span>Practice {topic?.name} MCQs</span>
              <FiChevronRight className="w-4 h-4" />
            </Link>

            {nextTopic ? (
              <Link
                to={`/student/english/${nextTopic.slug}/notes`}
                className="btn-secondary"
              >
                <span>Next: {nextTopic.name}</span>
                <FiChevronRight className="w-4 h-4" />
              </Link>
            ) : <div />}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EnglishNotes;
