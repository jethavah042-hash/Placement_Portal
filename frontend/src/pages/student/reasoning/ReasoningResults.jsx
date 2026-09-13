import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import StatCard from '../../../components/ui/StatCard';
import Badge from '../../../components/ui/Badge';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import api from '../../../api/axios';
import {
  FiArrowLeft,
  FiTrendingUp,
  FiTarget,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiAward,
  FiRefreshCw,
  FiBookOpen,
  FiHelpCircle,
  FiCheck
} from 'react-icons/fi';

const ReasoningResults = () => {
  const { topicId } = useParams();
  const [searchParams] = useSearchParams();
  const resultId = searchParams.get('resultId');

  const [result, setResult] = useState(null);
  const [pastResults, setPastResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
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
            const reasoningOnly = (res.data.data || []).filter(
              r =>
                r.moduleType === 'Reasoning' ||
                r.topic?.toLowerCase().includes('reasoning') ||
                r.title?.toLowerCase().includes('reasoning')
            );
            setPastResults(reasoningOnly.length > 0 ? reasoningOnly : res.data.data || []);
          }
        }
      } catch (err) {
        console.error('Error fetching result:', err);
        setError('Unable to load assessment results. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [resultId]);

  const topicName = topicId 
    ? topicId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : 'Logical Reasoning';

  const headerActions = (
    <div className="flex items-center gap-2.5">
      <Link
        to={`/student/reasoning/${topicId || 'logical-reasoning'}/quiz`}
        className="btn-primary text-xs"
      >
        <FiRefreshCw className="w-3.5 h-3.5" />
        <span>Take Another Quiz</span>
      </Link>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title={result ? `${result.title || 'Reasoning Quiz'} Performance` : 'Reasoning Assessment History'}
        subtitle={
          result
            ? 'Detailed breakdown of scored points, accuracy percentage, time spent, and question-by-question logic review.'
            : 'Track your test history, overall score progress, and accuracy across reasoning topics.'
        }
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Logical Reasoning', to: '/student/reasoning' },
          ...(topicId ? [{ label: topicName, to: `/student/reasoning/${topicId}` }] : []),
          { label: result ? 'Assessment Review' : 'History' }
        ]}
        actions={headerActions}
      />

      {loading ? (
        <LoadingState variant={resultId ? 'page' : 'table'} rows={4} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={() => window.location.reload()} />
        </div>
      ) : result ? (
        /* Detailed Single Assessment View */
        <div className="space-y-6 max-w-5xl">
          {/* Status Ribbon & Overview */}
          <div className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0 ${
                  result.status === 'Passed'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                }`}
              >
                {result.status === 'Passed' ? (
                  <FiCheckCircle className="w-5 h-5" />
                ) : (
                  <FiAlertCircle className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Assessment Completed
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(result.createdAt || result.submittedAt || Date.now()).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}{' '}
                  &bull; {result.topic || topicName}
                </p>
              </div>
            </div>

            <Badge
              variant={result.status === 'Passed' ? 'success' : 'danger'}
              size="md"
            >
              {result.status || (result.percentage >= 50 ? 'Passed' : 'Needs Practice')}
            </Badge>
          </div>

          {/* Key Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              label={`${result.obtainedMarks} / ${result.totalMarks} Marks`}
              value={`${result.percentage}%`}
              icon={FiAward}
              iconColor="text-indigo-600 dark:text-indigo-400"
              iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            />
            <StatCard
              label={`${result.correctCount} of ${result.attemptedCount} Solved`}
              value={`${result.accuracy}%`}
              icon={FiTarget}
              iconColor="text-purple-600 dark:text-purple-400"
              iconBg="bg-purple-50 dark:bg-purple-950/40"
            />
            <StatCard
              label={`${result.totalQuestions} Total Questions`}
              value={`${result.correctCount} Correct`}
              icon={FiCheckCircle}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            />
            <StatCard
              label={`~${Math.round(result.timeTaken / Math.max(1, result.totalQuestions))}s / Question`}
              value={`${Math.floor(result.timeTaken / 60)}m ${result.timeTaken % 60}s`}
              icon={FiClock}
              iconColor="text-blue-600 dark:text-blue-400"
              iconBg="bg-blue-50 dark:bg-blue-950/40"
            />
          </div>

          {/* Question-by-Question Solutions Review */}
          <div className="space-y-4">
            <SectionHeader
              title="Detailed Question Solutions Review"
              subtitle={`Question analysis and explanations for all ${result.answers?.length || 0} questions.`}
              badge={`${result.answers?.length || 0} Questions`}
            />

            <div className="space-y-4">
              {result.answers?.map((ans, idx) => {
                const isCorrect = ans.isCorrect;
                const isUnattempted = !ans.selectedOption || ans.selectedOption === 'Unattempted';

                let cardBorder = 'border-gray-200 dark:border-gray-800';
                if (isCorrect) cardBorder = 'border-emerald-200 dark:border-emerald-900/50';
                else if (!isUnattempted) cardBorder = 'border-rose-200 dark:border-rose-900/50';

                return (
                  <div
                    key={idx}
                    className={`card p-5 sm:p-6 space-y-4 ${cardBorder}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        Question {idx + 1} &bull; {ans.topic || topicName}
                      </span>
                      <Badge
                        variant={isCorrect ? 'success' : isUnattempted ? 'neutral' : 'danger'}
                        size="sm"
                      >
                        {isCorrect
                          ? 'Correct (+1.0)'
                          : isUnattempted
                          ? 'Unattempted (0.0)'
                          : 'Incorrect (-0.25)'}
                      </Badge>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white whitespace-pre-line leading-relaxed">
                      {ans.questionText}
                    </h3>

                    {/* Options list */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {ans.options?.map((opt, optIdx) => {
                        const isStudentChoice = ans.selectedOption === opt;
                        const isCorrectOption = ans.correctAnswer === opt;

                        let optStyle =
                          'border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 text-gray-700 dark:text-gray-300';
                        if (isCorrectOption) {
                          optStyle =
                            'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 font-semibold';
                        } else if (isStudentChoice && !isCorrect) {
                          optStyle =
                            'border-rose-500 bg-rose-50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 font-semibold';
                        }

                        return (
                          <div
                            key={optIdx}
                            className={`p-3 rounded-lg border text-xs flex items-center justify-between ${optStyle}`}
                          >
                            <div className="flex items-center gap-2 min-w-0 flex-1 pr-1">
                              <span className="w-5 h-5 rounded-md border border-gray-300 dark:border-gray-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                                {String.fromCharCode(65 + optIdx)}
                              </span>
                              <span className="break-words">{opt}</span>
                            </div>
                            {isCorrectOption && (
                              <FiCheckCircle className="text-emerald-500 w-4 h-4 shrink-0 ml-1" />
                            )}
                            {isStudentChoice && !isCorrect && (
                              <FiXCircle className="text-rose-500 w-4 h-4 shrink-0 ml-1" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanation */}
                    <div className="p-3.5 rounded-lg bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40 text-xs space-y-1">
                      <strong className="text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 font-semibold">
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
        /* Past Assessments History Table / List */
        <div className="card p-5 sm:p-6 space-y-4">
          <SectionHeader
            title="Past Reasoning Assessments"
            subtitle="All recorded quiz attempts and test results for reasoning modules."
            badge={`${pastResults.length} Attempts`}
          />

          {pastResults.length === 0 ? (
            <EmptyState
              icon={FiAward}
              title="No past assessments found"
              description="You haven't completed any reasoning assessments yet. Take a timed quiz to test your skills."
              action={
                <Link
                  to={`/student/reasoning/${topicId || 'logical-reasoning'}/quiz`}
                  className="btn-primary text-xs"
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
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 dark:hover:bg-gray-800/30 px-3 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                      {r.title || 'Reasoning Quiz'}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {new Date(r.createdAt || r.submittedAt).toLocaleDateString()} &bull; {r.topic}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 block">
                        {r.percentage}% ({r.obtainedMarks}/{r.totalMarks})
                      </span>
                      <span className="text-[11px] text-gray-500 dark:text-gray-400">
                        {r.accuracy}% Accuracy
                      </span>
                    </div>

                    <Link
                      to={`/student/reasoning/${topicId || 'logical-reasoning'}/results?resultId=${r._id}`}
                      className="btn-secondary text-xs"
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

export default ReasoningResults;
