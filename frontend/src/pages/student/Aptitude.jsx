import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import StatCard from '../../components/ui/StatCard';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import Badge from '../../components/ui/Badge';
import { getAptitudeTopicsRequest, getAptitudeProgressRequest } from '../../api/aptitude';
import {
  FiBook,
  FiCheckCircle,
  FiTarget,
  FiAward,
  FiClock,
  FiArrowRight,
  FiBookOpen,
  FiList,
  FiCheckSquare
} from 'react-icons/fi';

const Aptitude = () => {
  const [topics, setTopics] = useState([]);
  const [progress, setProgress] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [topicsRes, progRes] = await Promise.allSettled([
        getAptitudeTopicsRequest(),
        getAptitudeProgressRequest()
      ]);

      if (topicsRes.status === 'fulfilled' && topicsRes.value?.data?.success) {
        setTopics(topicsRes.value.data.data);
      } else {
        throw new Error('Failed to load Aptitude topics');
      }

      if (progRes.status === 'fulfilled' && progRes.value?.data?.success) {
        setProgress(progRes.value.data.data);
      }
    } catch (err) {
      console.error('Error fetching Aptitude data:', err);
      setError(err.response?.data?.message || 'Unable to connect to Aptitude server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTopics = topics.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <PageHeader
          title="Quantitative Aptitude"
          subtitle="Master foundational mathematics, formulaic shortcuts, and logic across all 15 placement topics."
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Aptitude' }
          ]}
          actions={
            <Link
              to="/student/aptitude/number-system/mock-test"
              className="btn-primary"
            >
              <FiTarget className="w-4 h-4" />
              <span>Take 30-Q Mock Test</span>
            </Link>
          }
        />

        {/* Progress Stats Ribbon */}
        {progress && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Topics Mastered"
              value={`${progress.topicsCompleted || 0} / ${topics.length || 15}`}
              icon={FiBook}
              iconColor="text-indigo-600 dark:text-indigo-400"
              iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            />
            <StatCard
              label="MCQs Solved"
              value={progress.totalMCQsAttempted || 0}
              icon={FiCheckCircle}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            />
            <StatCard
              label="Overall Accuracy"
              value={`${progress.accuracy || 0}%`}
              icon={FiAward}
              iconColor="text-amber-600 dark:text-amber-400"
              iconBg="bg-amber-50 dark:bg-amber-950/40"
            />
            <StatCard
              label="Tests Attempted"
              value={progress.mockTestsAttempted || 0}
              icon={FiClock}
              iconColor="text-blue-600 dark:text-blue-400"
              iconBg="bg-blue-50 dark:bg-blue-950/40"
            />
          </div>
        )}

        {/* Search & Topic Count Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="w-full sm:max-w-md">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topics (e.g. Percentage, Profit & Loss)..."
            />
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 shrink-0">
            Showing {filteredTopics.length} of {topics.length || 15} Topics
          </span>
        </div>

        {/* Content Body */}
        {loading ? (
          <LoadingState variant="page" />
        ) : error ? (
          <div className="card p-8">
            <ErrorState message={error} onRetry={fetchData} />
          </div>
        ) : filteredTopics.length === 0 ? (
          <div className="card p-8">
            <EmptyState
              title="No topics found"
              description="No aptitude topics match your search criteria. Try a different keyword."
              action={
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="btn-secondary text-xs"
                >
                  Clear Search
                </button>
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTopics.map((topic) => {
              const progressPct = topic.progressPercentage || 0;

              return (
                <div
                  key={topic.name}
                  className="card card-hover p-5 flex flex-col justify-between group"
                >
                  <div>
                    {/* Header info */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                        {topic.abbr || topic.name.slice(0, 2).toUpperCase()}
                      </div>
                      <Badge variant="neutral">
                        {topic.totalMCQs || 20} MCQs
                      </Badge>
                    </div>

                    <Link to={`/student/aptitude/${topic.slug}`}>
                      <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {topic.name}
                      </h3>
                    </Link>

                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {topic.description}
                    </p>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        <span>Progress</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{progressPct}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Direct Action Buttons */}
                  <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                    <Link
                      to={`/student/aptitude/${topic.slug}/notes`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-1"
                    >
                      <FiBookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Notes</span>
                    </Link>
                    <Link
                      to={`/student/aptitude/${topic.slug}/mcqs`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors inline-flex items-center justify-center gap-1"
                    >
                      <FiList className="w-3.5 h-3.5 text-amber-500" />
                      <span>Practice</span>
                    </Link>
                    <Link
                      to={`/student/aptitude/${topic.slug}/quiz`}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors inline-flex items-center justify-center gap-1 shadow-sm"
                    >
                      <FiCheckSquare className="w-3.5 h-3.5" />
                      <span>Quiz</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Aptitude;
