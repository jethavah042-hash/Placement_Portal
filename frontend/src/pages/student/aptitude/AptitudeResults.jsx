import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import StatCard from '../../../components/ui/StatCard';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import Badge from '../../../components/ui/Badge';
import { getAptitudeResultsRequest, getAptitudeResultByIdRequest } from '../../../api/aptitude';
import {
  FiArrowLeft,
  FiTrendingUp,
  FiTarget,
  FiClock,
  FiAward,
  FiCheckCircle,
  FiXCircle,
  FiChevronRight,
  FiX
} from 'react-icons/fi';

const AptitudeResults = () => {
  const { topicId } = useParams();
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getAptitudeResultsRequest();
      if (data.success) {
        setResults(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching results:', err);
      setError(err.response?.data?.message || 'Unable to load test results.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const topicName = topicId 
    ? topicId.split('-').map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Aptitude';

  // Aggregate Metrics from real MongoDB records
  const totalAttempts = results.length;
  const avgScore = totalAttempts > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.percentage || 0), 0) / totalAttempts) 
    : 0;
  const bestScore = totalAttempts > 0 
    ? Math.max(...results.map((r) => r.obtainedMarks || 0)) 
    : 0;
  const avgAccuracy = totalAttempts > 0 
    ? Math.round(results.reduce((acc, r) => acc + (r.accuracy || 0), 0) / totalAttempts) 
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Navigation & Header */}
        <PageHeader
          title="Aptitude Results & Performance"
          subtitle="Detailed evaluation records and performance analytics across your attempts."
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Aptitude', to: '/student/aptitude' },
            ...(topicId ? [{ label: topicName, to: `/student/aptitude/${topicId}` }] : []),
            { label: 'Results' }
          ]}
          actions={
            <Link
              to={`/student/aptitude/${topicId || 'number-system'}/mock-test`}
              className="btn-primary"
            >
              <FiTarget className="w-4 h-4" />
              <span>Take New Test</span>
            </Link>
          }
        />

        {/* 1. Aggregate Performance Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Average Score"
            value={`${avgScore}%`}
            icon={FiTrendingUp}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          />
          <StatCard
            label="Overall Accuracy"
            value={`${avgAccuracy}%`}
            icon={FiTarget}
            iconColor="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-50 dark:bg-indigo-950/40"
          />
          <StatCard
            label="Best Marks"
            value={bestScore}
            icon={FiAward}
            iconColor="text-purple-600 dark:text-purple-400"
            iconBg="bg-purple-50 dark:bg-purple-950/40"
          />
          <StatCard
            label="Tests Attempted"
            value={totalAttempts}
            icon={FiClock}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-950/40"
          />
        </div>

        {/* 2. Selected Single Result Detailed Modal/View */}
        {selectedResult && (
          <div className="card p-5 sm:p-6 space-y-6 border-indigo-200 dark:border-indigo-800 shadow-md">
            <div className="flex items-start justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant={selectedResult.testType === 'mock_test' ? 'danger' : 'primary'}>
                    {selectedResult.testType === 'mock_test' ? '30-Q Mock Test' : 'Topic Quiz'}
                  </Badge>
                  <Badge variant={selectedResult.status === 'Passed' ? 'success' : 'warning'}>
                    {selectedResult.status}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1.5">
                  {selectedResult.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Submitted on {new Date(selectedResult.createdAt || selectedResult.submittedAt).toLocaleString()}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedResult(null)}
                className="btn-secondary text-xs"
              >
                <FiX className="w-4 h-4" />
                <span>Close Report</span>
              </button>
            </div>

            {/* Scorecard Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-left">
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Obtained</p>
                <h4 className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {selectedResult.obtainedMarks} / {selectedResult.totalMarks}
                </h4>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Percentage</p>
                <h4 className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  {selectedResult.percentage}%
                </h4>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Correct</p>
                <h4 className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                  {selectedResult.correctCount}
                </h4>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Wrong</p>
                <h4 className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                  {selectedResult.wrongCount}
                </h4>
              </div>
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Accuracy</p>
                <h4 className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">
                  {selectedResult.accuracy}%
                </h4>
              </div>
            </div>

            {/* Topic Breakdown if present */}
            {selectedResult.topicAnalysis && selectedResult.topicAnalysis.length > 0 && (
              <div className="p-4 bg-gray-50 dark:bg-gray-800/40 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  Topic Breakdown
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedResult.topicAnalysis.map((ta, idx) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center text-xs p-2.5 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800"
                    >
                      <span className="font-semibold text-gray-900 dark:text-white">{ta.topic}</span>
                      <span className={ta.percentage >= 60 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-rose-600 dark:text-rose-400 font-bold'}>
                        {ta.correct} / {ta.total} ({ta.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed Answers Review */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                Detailed Question Review ({selectedResult.answers?.length || 0})
              </h4>
              <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
                {selectedResult.answers?.map((ans, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border text-xs sm:text-sm space-y-2 ${
                      ans.isCorrect
                        ? 'border-emerald-200 bg-emerald-50/30 dark:bg-emerald-950/20 dark:border-emerald-900/40'
                        : ans.selectedOption === 'Not Attempted'
                        ? 'border-gray-200 bg-gray-50/50 dark:bg-gray-800/40 dark:border-gray-800'
                        : 'border-rose-200 bg-rose-50/30 dark:bg-rose-950/20 dark:border-rose-900/40'
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">
                        Q{idx + 1}. <span className="font-normal text-gray-400 dark:text-gray-500">[{ans.topic}]</span>
                      </span>
                      <Badge variant={ans.isCorrect ? 'success' : ans.selectedOption === 'Not Attempted' ? 'neutral' : 'danger'}>
                        {ans.isCorrect ? '+1.00 Mark' : ans.selectedOption === 'Not Attempted' ? '0.00 Marks' : '-0.25 Marks'}
                      </Badge>
                    </div>

                    <p className="font-semibold text-gray-900 dark:text-white">{ans.questionText}</p>

                    <div className="flex flex-wrap gap-4 text-xs">
                      <span>
                        Your Answer: <strong className={ans.isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>{ans.selectedOption}</strong>
                      </span>
                      <span>
                        Correct Answer: <strong className="text-emerald-700 dark:text-emerald-400">{ans.correctAnswer}</strong>
                      </span>
                    </div>

                    {ans.explanation && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 pt-1 border-t border-gray-200/60 dark:border-gray-700/60">
                        <strong>Explanation:</strong> {ans.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. Past Test History Table / List */}
        <div className="card p-5 sm:p-6 space-y-4">
          <SectionHeader
            title="Past Test & Quiz Attempts History"
            subtitle="Archive of all your quantitative aptitude attempts"
            badge={`${results.length} Records`}
          />

          {loading ? (
            <LoadingState variant="list" rows={4} />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchResults} />
          ) : results.length === 0 ? (
            <EmptyState
              title="No test attempts yet"
              description="You have not attempted any aptitude quizzes or mock tests so far."
              action={
                <Link
                  to={`/student/aptitude/${topicId || 'number-system'}/mock-test`}
                  className="btn-primary text-xs"
                >
                  <FiTarget className="w-4 h-4" />
                  <span>Take Your First Mock Test</span>
                </Link>
              }
            />
          ) : (
            <div className="space-y-3">
              {results.map((r) => (
                <div
                  key={r._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-gray-200 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/40 transition-colors gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={r.testType === 'mock_test' ? 'danger' : 'primary'}>
                        {r.testType === 'mock_test' ? 'Mock Test' : 'Quiz'}
                      </Badge>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {r.title}
                      </h4>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {new Date(r.createdAt || r.submittedAt).toLocaleDateString()} • {Math.floor((r.timeTaken || 0) / 60)}m {(r.timeTaken || 0) % 60}s
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        {r.obtainedMarks} / {r.totalMarks} ({r.percentage}%)
                      </p>
                      <Badge variant={r.status === 'Passed' ? 'success' : 'warning'}>
                        {r.status}
                      </Badge>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedResult(r)}
                      className="btn-secondary text-xs"
                    >
                      <span>View Report</span>
                      <FiChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AptitudeResults;
