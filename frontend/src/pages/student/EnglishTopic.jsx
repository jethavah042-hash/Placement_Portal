import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { getStudentEnglishTopicBySlugRequest, markStudentEnglishNotesCompletedRequest } from '../../api/english';
import {
  FiBookOpen,
  FiZap,
  FiClock,
  FiTrendingUp,
  FiCheckCircle,
  FiArrowRight
} from 'react-icons/fi';

const EnglishTopic = () => {
  const { topicId } = useParams();
  const [topicData, setTopicData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [markingDone, setMarkingDone] = useState(false);

  const fetchTopic = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getStudentEnglishTopicBySlugRequest(topicId);
      if (res.data.success) {
        setTopicData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching English topic:', err);
      setError('Unable to load topic details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTopic();
  }, [topicId]);

  const handleMarkComplete = async () => {
    try {
      setMarkingDone(true);
      await markStudentEnglishNotesCompletedRequest(topicId);
      await fetchTopic();
    } catch (err) {
      console.error('Error marking completed:', err);
    } finally {
      setMarkingDone(false);
    }
  };

  const topic = topicData?.topic;
  const progress = topicData?.progress || { questionsAttempted: 0, questionsSolved: 0, notesRead: false, accuracy: 0 };
  const questionCount = topicData?.questionCount || 0;

  const difficultyBadge =
    topic?.difficulty === 'Easy'
      ? 'badge-success'
      : topic?.difficulty === 'Medium'
      ? 'badge-primary'
      : 'badge-danger';

  const progressPercent =
    progress.notesRead && progress.questionsAttempted >= 5
      ? 100
      : progress.notesRead
      ? 50
      : 0;

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title={topic?.name || 'Topic Hub'}
        subtitle={topic?.description || 'Select a preparation mode below to begin studying this module.'}
        breadcrumbs={[
          { label: 'English & Verbal', to: '/student/english' },
          { label: topic?.name || 'Topic Hub' }
        ]}
        actions={
          topic && (
            <span className={difficultyBadge}>
              {topic.difficulty}
            </span>
          )
        }
      />

      {loading ? (
        <LoadingState variant="page" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTopic} />
      ) : (
        <div className="space-y-6 max-w-5xl">
          {/* Progress Strip Card */}
          <div className="card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Topic Mastery Status
                </span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {progressPercent === 100
                    ? '100% Completed'
                    : progressPercent === 50
                    ? '50% In Progress'
                    : '0% Started'}
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-6 divide-x divide-gray-200 dark:divide-gray-800">
              <div className="text-center px-3">
                <strong className="text-xl font-bold text-gray-900 dark:text-white block">
                  {questionCount}
                </strong>
                <span className="text-xs text-gray-500 dark:text-gray-400">Questions</span>
              </div>
              <div className="text-center px-3">
                <strong className="text-xl font-bold text-emerald-600 dark:text-emerald-400 block">
                  {progress.accuracy || 0}%
                </strong>
                <span className="text-xs text-gray-500 dark:text-gray-400">Accuracy</span>
              </div>
              <div className="text-center px-3">
                <strong className="text-xl font-bold text-indigo-600 dark:text-indigo-400 block">
                  {progress.questionsAttempted || 0}
                </strong>
                <span className="text-xs text-gray-500 dark:text-gray-400">Attempted</span>
              </div>
            </div>
          </div>

          {/* 4 Tracks Navigation Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* 1. Study Guide / Notes */}
            <Link
              to={`/student/english/${topicId}/notes`}
              className="card-interactive p-6 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-semibold">
                  <FiBookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  1. Grammar & Concepts Guide
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Deep-dive into foundational rules, correct vs incorrect sentence structures, shortcuts, and common mistakes.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span>{progress.notesRead ? 'Completed' : 'Read Notes & Rules'}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </Link>

            {/* 2. Practice Arena */}
            <Link
              to={`/student/english/${topicId}/mcqs`}
              className="card-interactive p-6 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-semibold">
                  <FiZap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  2. Targeted Practice Arena
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Untimed single-question practice with instant answer checking, grammatical proofs, and bookmarks.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span>{questionCount} Questions Available</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </Link>

            {/* 3. Timed Assessment Quiz */}
            <Link
              to={`/student/english/${topicId}/quiz`}
              className="card-interactive p-6 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-semibold">
                  <FiClock className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  3. Speed & Timed Assessment
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Real placement test conditions with countdown timer, negative marking, and question palette.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span>Start Timed Test</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </Link>

            {/* 4. Results & Review */}
            <Link
              to={`/student/english/${topicId}/results`}
              className="card-interactive p-6 space-y-4 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-lg font-semibold">
                  <FiTrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  4. Assessment Analytics & Review
                </h3>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  Inspect past test submissions, accuracy breakdown, and step-by-step model solutions.
                </p>
              </div>

              <div className="flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                <span>View Performance</span>
                <span className="group-hover:translate-x-0.5 transition-transform">&rarr;</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default EnglishTopic;
