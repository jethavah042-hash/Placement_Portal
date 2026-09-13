import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import StatCard from '../../../components/ui/StatCard';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import api from '../../../api/axios';
import {
  FiTrendingUp,
  FiTarget,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAward,
  FiRefreshCw,
  FiBookOpen,
  FiHelpCircle
} from 'react-icons/fi';

const EnglishResults = () => {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const resultId = searchParams.get('resultId');

  const [result, setResult] = useState(null);
  const [pastResults, setPastResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      if (resultId) {
        const res = await api.get(`/results/${resultId}`);
        if (res.data.success) {
          setResult(res.data.data);
        }
      } else {
        const res = await api.get('/results/my');
        if (res.data.success) {
          const englishOnly = (res.data.data || []).filter(
            r => r.moduleType === 'English' || r.topic?.includes('English') || r.title?.includes('English') || r.title?.includes('RC')
          );
          setPastResults(englishOnly.length > 0 ? englishOnly : res.data.data || []);
        }
      }
    } catch (err) {
      console.error('Error fetching result:', err);
      setError('Unable to load assessment result.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [resultId]);

  const breadcrumbs = [
    { label: 'English & Verbal', to: '/student/english' },
    ...(topicId ? [{ label: 'Topic Hub', to: `/student/english/${topicId}` }] : []),
    { label: 'Results' }
  ];

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title={result ? `${result.title || 'Verbal Assessment'} Performance` : 'Verbal Assessment History'}
        subtitle="Detailed breakdown of scored points, accuracy percentage, time spent, and question-by-question model review."
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex items-center gap-3">
            {result && (
              <span className={result.status === 'Passed' ? 'badge-success' : 'badge-danger'}>
                {result.status}
              </span>
            )}
            <Link
              to={`/student/english/${topicId || 'grammar'}/quiz`}
              className="btn-primary"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Take Another Quiz</span>
            </Link>
          </div>
        }
      />

      {loading ? (
        <LoadingState variant="page" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchResults} />
      ) : result ? (
        /* Detailed Result View */
        <div className="space-y-8 max-w-5xl">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Score */}
            <StatCard
              label={`${result.obtainedMarks} / ${result.totalMarks} Marks Scored`}
              value={`${result.percentage}%`}
              icon={FiAward}
              iconColor="text-indigo-600 dark:text-indigo-400"
              iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            />

            {/* 2. Accuracy */}
            <StatCard
              label={`${result.correctCount} of ${result.attemptedCount} Solved Correctly`}
              value={`${result.accuracy}%`}
              icon={FiTrendingUp}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            />

            {/* 3. Attempts Split */}
            <StatCard
              label={`${result.totalQuestions} Total Questions`}
              value={`${result.correctCount}C / ${result.wrongCount}W`}
              icon={FiTarget}
              iconColor="text-purple-600 dark:text-purple-400"
              iconBg="bg-purple-50 dark:bg-purple-950/40"
            />

            {/* 4. Time Taken */}
            <StatCard
              label={`~${Math.round(result.timeTaken / Math.max(1, result.totalQuestions))}s / Question`}
              value={`${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s`}
              icon={FiClock}
              iconColor="text-gray-700 dark:text-gray-300"
              iconBg="bg-gray-100 dark:bg-gray-800"
            />
          </div>

          {/* Question-by-Question Review */}
          <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FiBookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Detailed Question Solutions Review ({result.answers?.length || 0})</span>
            </h2>

            <div className="space-y-4">
              {result.answers?.map((ans, idx) => {
                const isCorrect = ans.isCorrect;
                const isUnattempted = !ans.selectedOption || ans.selectedOption === 'Unattempted';

                return (
                  <div
                    key={idx}
                    className={`card p-5 sm:p-6 space-y-4 ${
                      isCorrect
                        ? 'border-emerald-200 dark:border-emerald-900/50'
                        : isUnattempted
                        ? 'border-gray-200 dark:border-gray-800'
                        : 'border-rose-200 dark:border-rose-900/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Question {idx + 1} &bull; {ans.topic}
                      </span>
                      <span
                        className={`badge ${
                          isCorrect
                            ? 'badge-success'
                            : isUnattempted
                            ? 'badge-neutral'
                            : 'badge-danger'
                        }`}
                      >
                        {isCorrect
                          ? 'Correct (+1.0)'
                          : isUnattempted
                          ? 'Unattempted (0.0)'
                          : 'Incorrect (-0.25)'}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                      {ans.questionText}
                    </h3>

                    {/* Options List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {ans.options?.map((opt, optIdx) => {
                        const isStudentChoice = ans.selectedOption === opt;
                        const isCorrectOption = ans.correctAnswer === opt;

                        let optStyle =
                          'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300';
                        if (isCorrectOption) {
                          optStyle =
                            'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 font-semibold';
                        } else if (isStudentChoice && !isCorrect) {
                          optStyle =
                            'border-rose-500 bg-rose-50/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 font-medium';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${optStyle}`}
                          >
                            <span>{opt}</span>
                            {isCorrectOption && (
                              <FiCheckCircle className="text-emerald-600 dark:text-emerald-400 w-4 h-4 shrink-0" />
                            )}
                            {isStudentChoice && !isCorrect && (
                              <FiXCircle className="text-rose-600 dark:text-rose-400 w-4 h-4 shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-4 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                      <strong className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                        <FiHelpCircle className="w-3.5 h-3.5" />
                        <span>Explanation & Model Solution:</span>
                      </strong>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {ans.explanation || `The correct answer is "${ans.correctAnswer}".`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Past Test History List */
        <div className="card p-6 space-y-4">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Past Verbal Assessments
          </h2>

          {pastResults.length === 0 ? (
            <EmptyState
              title="No past assessments found"
              description="You haven't completed any timed verbal assessments yet."
              action={
                <Link
                  to={`/student/english/${topicId || 'grammar'}/quiz`}
                  className="btn-primary"
                >
                  Take Your First Quiz
                </Link>
              }
            />
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {pastResults.map(r => (
                <div
                  key={r._id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-3 rounded-lg transition-colors"
                >
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                      {r.title || 'English Quiz'}
                    </h3>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(r.createdAt || r.submittedAt).toLocaleDateString()} &bull; {r.topic}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <strong className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 block">
                        {r.percentage}% ({r.obtainedMarks}/{r.totalMarks})
                      </strong>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {r.accuracy}% Accuracy
                      </span>
                    </div>

                    <Link
                      to={`/student/english/${topicId || 'grammar'}/results?resultId=${r._id}`}
                      className="btn-secondary text-xs py-1.5 px-3"
                    >
                      Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
};

export default EnglishResults;
