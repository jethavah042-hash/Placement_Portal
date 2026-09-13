import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import SearchBar from '../../components/ui/SearchBar';
import StatCard from '../../components/ui/StatCard';
import Badge from '../../components/ui/Badge';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { getCodingTopicsRequest, getCodingProgressRequest } from '../../api/coding';
import {
  FiCode,
  FiBookOpen,
  FiMessageCircle,
  FiCheckCircle,
  FiAward,
  FiZap,
  FiPieChart,
  FiLayers,
  FiArrowRight
} from 'react-icons/fi';

const colorThemes = [
  { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-600 dark:text-indigo-400', bar: 'bg-indigo-600' },
  { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-600 dark:text-blue-400', bar: 'bg-blue-600' },
  { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-600 dark:text-purple-400', bar: 'bg-purple-600' },
  { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-600 dark:text-emerald-400', bar: 'bg-emerald-600' },
  { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-600 dark:text-amber-400', bar: 'bg-amber-600' },
  { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-600 dark:text-rose-400', bar: 'bg-rose-600' },
  { bg: 'bg-teal-50 dark:bg-teal-950/40', text: 'text-teal-600 dark:text-teal-400', bar: 'bg-teal-600' },
  { bg: 'bg-cyan-50 dark:bg-cyan-950/40', text: 'text-cyan-600 dark:text-cyan-400', bar: 'bg-cyan-600' },
  { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-600 dark:text-orange-400', bar: 'bg-orange-600' },
  { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-600 dark:text-sky-400', bar: 'bg-sky-600' },
  { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-600 dark:text-pink-400', bar: 'bg-pink-600' }
];

const CodingPractice = () => {
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
        getCodingTopicsRequest(),
        getCodingProgressRequest()
      ]);

      if (topicsRes.status === 'fulfilled' && topicsRes.value?.data?.success) {
        setTopics(topicsRes.value.data.data);
      } else {
        throw new Error('Failed to load Coding topics');
      }

      if (progRes.status === 'fulfilled' && progRes.value?.data?.success) {
        setProgress(progRes.value.data.data);
      }
    } catch (err) {
      console.error('Error fetching Coding data:', err);
      setError(err.response?.data?.message || 'Unable to connect to Coding server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredTopics = topics.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link
        to="/student/coding/interview"
        className="btn-secondary text-xs py-2 px-3.5"
      >
        <FiMessageCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
        <span>120+ Interview Qs</span>
      </Link>
      <Link
        to="/student/coding/arrays/challenges"
        className="btn-primary text-xs py-2 px-3.5"
      >
        <FiCode className="w-4 h-4" />
        <span>Open Problem Arena</span>
      </Link>
      <Link
        to="/student/coding/arrays/results"
        className="btn-secondary text-xs py-2 px-3.5"
      >
        <FiPieChart className="w-4 h-4 text-amber-600 dark:text-amber-400" />
        <span>Result Analysis</span>
      </Link>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title="Data Structures & Algorithms"
        subtitle="Master placement coding with complete theoretical notes, technical interview questions, and interactive IDE problem solving."
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Coding & DSA' }
        ]}
        actions={headerActions}
      />

      {/* Progress Summary Stats Grid */}
      {progress && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            label="Total Problems"
            value={progress.totalProblems}
            icon={FiLayers}
            iconColor="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-50 dark:bg-indigo-950/40"
          />
          <StatCard
            label="Problems Solved"
            value={`${progress.solvedCount} / ${progress.totalProblems}`}
            icon={FiCheckCircle}
            iconColor="text-emerald-600 dark:text-emerald-400"
            iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          />
          <StatCard
            label="Acceptance Rate"
            value={`${progress.accuracy}%`}
            icon={FiAward}
            iconColor="text-indigo-600 dark:text-indigo-400"
            iconBg="bg-indigo-50 dark:bg-indigo-950/40"
          />
          <StatCard
            label="Coding Streak"
            value={`${progress.streak} Days`}
            icon={FiZap}
            iconColor="text-amber-600 dark:text-amber-400"
            iconBg="bg-amber-50 dark:bg-amber-950/40"
          />
        </div>
      )}

      {/* Section Header & Search */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <SectionHeader
            title="Core DSA Topics"
            subtitle={`Showing ${filteredTopics.length} of ${topics.length || 11} curriculum modules`}
          />
        </div>
        <div className="w-full sm:w-80">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search DSA topics (e.g. Trees, DP)..."
          />
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <LoadingState variant="page" />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchData} />
        </div>
      ) : filteredTopics.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            icon={FiCode}
            title="No DSA topics found"
            description="Try searching with a different keyword."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTopics.map((topic, index) => {
            const theme = colorThemes[index % colorThemes.length];
            const progressPct = topic.progressPercentage || 0;

            return (
              <div
                key={topic.name}
                className="card card-hover p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top: Topic Abbr + Difficulty Badges */}
                  <div className="flex items-start justify-between gap-2 mb-3.5">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${theme.bg} ${theme.text}`}>
                      {topic.abbr}
                    </div>
                    <div className="flex items-center gap-1">
                      <Badge variant="success" size="sm">
                        {topic.easyProblems} Easy
                      </Badge>
                      <Badge variant="warning" size="sm">
                        {topic.mediumProblems} Med
                      </Badge>
                      <Badge variant="danger" size="sm">
                        {topic.hardProblems} Hard
                      </Badge>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <Link to={`/student/coding/${topic.slug}`}>
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {topic.name}
                    </h3>
                  </Link>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                    {topic.description}
                  </p>

                  {/* Progress & Solved Stats */}
                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-gray-500 dark:text-gray-400">
                        Solved: <strong className="text-gray-900 dark:text-white font-medium">{topic.solvedProblems}</strong> / {topic.totalProblems}
                      </span>
                      <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {progressPct}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${theme.bar} rounded-full transition-all duration-500`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Direct Action Pathway Buttons */}
                <div className="grid grid-cols-3 gap-2 mt-5 pt-3.5 border-t border-gray-100 dark:border-gray-800">
                  <Link
                    to={`/student/coding/${topic.slug}/notes`}
                    className="btn-secondary !py-1.5 !px-2 text-xs text-center justify-center"
                    title="Theoretical Notes"
                  >
                    <FiBookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span>Notes</span>
                  </Link>
                  <Link
                    to={`/student/coding/${topic.slug}/interview`}
                    className="btn-secondary !py-1.5 !px-2 text-xs text-center justify-center"
                    title="Interview Questions"
                  >
                    <FiMessageCircle className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    <span>Q&A</span>
                  </Link>
                  <Link
                    to={`/student/coding/${topic.slug}/challenges`}
                    className="btn-primary !py-1.5 !px-2 text-xs text-center justify-center"
                    title="Practice in IDE Arena"
                  >
                    <FiCode className="w-3.5 h-3.5" />
                    <span>Practice</span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CodingPractice;
