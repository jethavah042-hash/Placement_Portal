import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import Badge from '../../../components/ui/Badge';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import {
  getStudentReasoningNotesRequest,
  markStudentReasoningNotesCompletedRequest,
  toggleStudentReasoningBookmarkRequest
} from '../../../api/reasoning';
import {
  FiArrowLeft,
  FiBookOpen,
  FiBookmark,
  FiCheckCircle,
  FiZap,
  FiAlertTriangle,
  FiAward,
  FiChevronLeft,
  FiChevronRight,
  FiHelpCircle,
  FiList
} from 'react-icons/fi';

const ReasoningNotes = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [marking, setMarking] = useState(false);

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getStudentReasoningNotesRequest(topicId);
      if (res.data.success) {
        setData(res.data.data);
        setIsBookmarked(res.data.data.isBookmarked || false);
        setIsCompleted(res.data.data.progress?.notesRead || false);
      }
    } catch (err) {
      console.error('Error fetching notes:', err);
      setError('Unable to load study material. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [topicId]);

  const handleToggleBookmark = async () => {
    if (!data?.note?._id) return;
    try {
      const res = await toggleStudentReasoningBookmarkRequest({
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

  const handleMarkComplete = async () => {
    setMarking(true);
    try {
      await markStudentReasoningNotesCompletedRequest(topicId);
      setIsCompleted(true);
    } catch (err) {
      console.error('Error marking complete:', err);
    } finally {
      setMarking(false);
    }
  };

  const note = data?.note;
  const prevTopic = data?.prevTopic;
  const nextTopic = data?.nextTopic;

  const topicName = topicId 
    ? topicId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Reasoning Guide';

  const headerActions = (
    <div className="flex items-center gap-2.5">
      <button
        onClick={handleToggleBookmark}
        className={`btn-secondary text-xs ${
          isBookmarked
            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
            : ''
        }`}
        title={isBookmarked ? 'Bookmarked' : 'Bookmark Guide'}
      >
        <FiBookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
        <span>{isBookmarked ? 'Saved' : 'Bookmark'}</span>
      </button>

      {isCompleted ? (
        <span className="badge-success px-3 py-2 text-xs font-semibold gap-1.5">
          <FiCheckCircle className="w-3.5 h-3.5" />
          <span>Marked as Read</span>
        </span>
      ) : (
        <button
          onClick={handleMarkComplete}
          disabled={marking}
          className="btn-primary text-xs"
        >
          <FiCheckCircle className="w-3.5 h-3.5" />
          <span>{marking ? 'Saving...' : 'Mark as Read'}</span>
        </button>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title={note?.title || `${topicName} Master Guide`}
        subtitle="Comprehensive logic rules, mental models, shortcut formulas, and placement strategies."
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Logical Reasoning', to: '/student/reasoning' },
          { label: topicName, to: `/student/reasoning/${topicId}` },
          { label: 'Study Notes' }
        ]}
        actions={headerActions}
      />

      {loading ? (
        <LoadingState variant="page" rows={3} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchNotes} />
        </div>
      ) : (
        <div className="space-y-6 max-w-5xl">
          {/* Introduction Card */}
          <div className="card p-5 sm:p-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-sm font-bold shrink-0">
                <FiBookOpen className="w-4 h-4" />
              </div>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                Introduction & Overview
              </h2>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {note?.introduction}
            </p>
          </div>

          {/* Concepts Breakdown */}
          {note?.concepts?.length > 0 && (
            <div className="card p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center text-sm font-bold shrink-0">
                  <FiZap className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Core Logic Concepts
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {note.concepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-1.5"
                  >
                    <h3 className="text-xs font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{concept.title}</span>
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                      {concept.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rules & Guidelines */}
          {note?.rules?.length > 0 && (
            <div className="card p-5 sm:p-6 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-sm font-bold shrink-0">
                  <FiCheckCircle className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Golden Deduction Rules
                </h2>
              </div>

              <ul className="space-y-2">
                {note.rules.map((rule, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-xs text-gray-700 dark:text-gray-300 leading-relaxed"
                  >
                    <span className="text-emerald-500 font-bold mt-0.5">&bull;</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Shortcuts & Speed Tricks */}
          {note?.shortcuts?.length > 0 && (
            <div className="card p-5 sm:p-6 space-y-3 bg-amber-50/30 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/40">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center text-sm font-bold shrink-0">
                  <FiZap className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Speed Shortcuts & Elimination Tricks
                </h2>
              </div>

              <div className="space-y-3">
                {note.shortcuts.map((sc, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-white dark:bg-gray-900/80 border border-amber-200 dark:border-amber-900/40 rounded-lg space-y-1"
                  >
                    <strong className="text-xs font-bold text-amber-900 dark:text-amber-300 block">
                      ⚡ {sc.name || 'Quick Method'}
                    </strong>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{sc.tip}</p>
                    {sc.example && (
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 italic mt-1">
                        Example: {sc.example}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Solved Examples */}
          {note?.solvedExamples?.length > 0 && (
            <div className="card p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center text-sm font-bold shrink-0">
                  <FiHelpCircle className="w-4 h-4" />
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Step-by-Step Solved Examples
                </h2>
              </div>

              <div className="space-y-3.5">
                {note.solvedExamples.map((ex, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800 space-y-2.5"
                  >
                    <div className="font-semibold text-xs text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                      <span className="text-indigo-600 dark:text-indigo-400 mr-1.5 font-bold">
                        Example {idx + 1}:
                      </span>
                      {ex.question}
                    </div>
                    <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-lg space-y-1 text-xs">
                      <strong className="text-emerald-700 dark:text-emerald-400 block font-semibold">
                        Correct Answer: {ex.solution}
                      </strong>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {ex.explanation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Placement & Interview Advice */}
          {note?.placementTips?.length > 0 && (
            <div className="card p-5 sm:p-6 bg-indigo-50/30 dark:bg-indigo-950/20 border-indigo-100 dark:border-indigo-900/40 space-y-3">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300">
                <FiAward className="w-4 h-4" />
                <h3 className="font-semibold text-xs uppercase tracking-wider">
                  Recruiter & Placement Insights
                </h3>
              </div>
              <ul className="space-y-1.5 text-xs text-gray-700 dark:text-gray-300">
                {note.placementTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-indigo-500 font-bold">&check;</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Bottom Navigation & Topic Sequences */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {prevTopic ? (
              <Link
                to={`/student/reasoning/${prevTopic.slug}/notes`}
                className="btn-secondary text-xs w-full sm:w-auto"
              >
                <FiChevronLeft className="w-3.5 h-3.5" />
                <span>Prev: {prevTopic.name}</span>
              </Link>
            ) : <div />}

            <Link
              to={`/student/reasoning/${topicId}/mcqs`}
              className="btn-primary text-xs w-full sm:w-auto"
            >
              <FiList className="w-3.5 h-3.5" />
              <span>Practice Topic Questions</span>
            </Link>

            {nextTopic ? (
              <Link
                to={`/student/reasoning/${nextTopic.slug}/notes`}
                className="btn-secondary text-xs w-full sm:w-auto"
              >
                <span>Next: {nextTopic.name}</span>
                <FiChevronRight className="w-3.5 h-3.5" />
              </Link>
            ) : <div />}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default ReasoningNotes;
