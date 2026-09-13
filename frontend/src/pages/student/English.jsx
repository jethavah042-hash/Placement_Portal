import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import StatCard from '../../components/ui/StatCard';
import SearchBar from '../../components/ui/SearchBar';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { getStudentEnglishDashboardRequest } from '../../api/english';
import {
  FiBookOpen,
  FiAward,
  FiTrendingUp,
  FiZap,
  FiCheckCircle,
  FiBookmark,
  FiAlertTriangle,
  FiArrowRight,
  FiFeather
} from 'react-icons/fi';

const English = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getStudentEnglishDashboardRequest();
      if (res.data.success) {
        setDashboardData(res.data.data);
      }
    } catch (err) {
      console.error('Error loading English dashboard:', err);
      setError('Unable to load English Prep progress. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const metrics = dashboardData?.metrics || {
    progressPercentage: 0,
    totalAttempted: 0,
    totalSolved: 0,
    overallAccuracy: 0,
    studyStreak: 0,
    completedTopics: 0,
    remainingTopics: 20,
    totalTopics: 20,
    totalVocabCount: 0,
    learnedVocabCount: 0,
    totalPassagesCount: 0,
    completedPassagesCount: 0,
    bookmarksCount: 0
  };

  const topics = dashboardData?.topics || [];
  const weakTopics = dashboardData?.weakTopics || [];
  const recommendedPractice = dashboardData?.recommendedPractice;

  const filteredTopics = topics.filter(topic => {
    const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (topic.description && topic.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDiff = difficultyFilter === 'All' || topic.difficulty === difficultyFilter;
    return matchesSearch && matchesDiff;
  });

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title="Verbal Ability & English Prep"
        subtitle="Master corporate verbal agility, grammar frameworks, GRE/CAT vocabulary sets, and reading comprehension passages."
        actions={
          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              to="/student/english/vocabulary"
              className="btn-primary"
            >
              <FiFeather className="w-4 h-4" />
              <span>Vocab Trainer ({metrics.learnedVocabCount}/{metrics.totalVocabCount})</span>
            </Link>
            <Link
              to="/student/english/reading-comprehension"
              className="btn-secondary"
            >
              <FiBookOpen className="w-4 h-4" />
              <span>Reading Passages</span>
            </Link>
            <Link
              to="/student/english/practice"
              className="btn-secondary"
            >
              <FiZap className="w-4 h-4" />
              <span>Quick Practice</span>
            </Link>
            <Link
              to="/student/english/bookmarks"
              className="btn-icon"
              title="Saved English Bookmarks"
              aria-label="Saved English Bookmarks"
            >
              <FiBookmark className="w-4 h-4 text-amber-500" />
            </Link>
          </div>
        }
      />

      {/* Loading Skeleton */}
      {loading && <LoadingState variant="page" />}

      {/* Error Message */}
      {error && !loading && (
        <ErrorState message={error} onRetry={fetchDashboard} />
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Progress */}
            <StatCard
              label={`${metrics.completedTopics} of ${metrics.totalTopics} Topics Completed`}
              value={`${metrics.progressPercentage}%`}
              icon={FiAward}
              iconColor="text-indigo-600 dark:text-indigo-400"
              iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            />

            {/* 2. Questions Attempted & Accuracy */}
            <StatCard
              label={`${metrics.totalSolved} / ${metrics.totalAttempted} Correct Solved`}
              value={`${metrics.overallAccuracy}%`}
              icon={FiTrendingUp}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            />

            {/* 3. Vocabulary Learned */}
            <StatCard
              label={`${metrics.totalVocabCount} Words in Bank`}
              value={metrics.learnedVocabCount}
              icon={FiFeather}
              iconColor="text-indigo-600 dark:text-indigo-400"
              iconBg="bg-indigo-50 dark:bg-indigo-950/40"
              to="/student/english/vocabulary"
            />

            {/* 4. Active Study Streak */}
            <StatCard
              label="Practice daily to maintain readiness"
              value={`${metrics.studyStreak} Days`}
              icon={FiZap}
              iconColor="text-amber-600 dark:text-amber-400"
              iconBg="bg-amber-50 dark:bg-amber-950/40"
            />
          </div>

          {/* Recommended Practice Banner & Weak Topic Alert */}
          {weakTopics.length > 0 ? (
            <div className="card p-5 border-rose-200 dark:border-rose-900/50 bg-rose-50/50 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="badge-danger flex items-center gap-1">
                    <FiAlertTriangle className="w-3.5 h-3.5" /> Weak Topic Focus
                  </span>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    {weakTopics[0].topic} ({weakTopics[0].accuracy}% Accuracy)
                  </h3>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 max-w-xl">
                  Your accuracy in {weakTopics[0].topic} is below 50%. Review the grammatical rules and solved examples to boost your score.
                </p>
              </div>
              <Link
                to={`/student/english/${weakTopics[0].slug}/notes`}
                className="btn-danger shrink-0 self-start sm:self-auto"
              >
                Review {weakTopics[0].topic} Rules
              </Link>
            </div>
          ) : recommendedPractice ? (
            <div className="card p-5 border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/40 dark:bg-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="badge-primary">
                  Recommended Study Target
                </span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
                  {recommendedPractice.message}
                </h3>
              </div>
              <Link
                to={`/student/english/${recommendedPractice.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                className="btn-primary shrink-0 self-start sm:self-auto"
              >
                Start {recommendedPractice.topic}
              </Link>
            </div>
          ) : null}

          {/* Curriculum Topics Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <SectionHeader
                title={`English Prep Curriculum (${topics.length} Core Topics)`}
                subtitle="Explore concept notes, targeted MCQs, error detection, or speed quizzes."
              />

              {/* Filters & Search */}
              <div className="flex flex-wrap items-center gap-3">
                <SearchBar
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search topics..."
                  className="w-full sm:w-60"
                />

                <div className="tab-list">
                  {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => setDifficultyFilter(diff)}
                      className={`tab-item ${
                        difficultyFilter === diff
                          ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm font-semibold'
                          : ''
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Topics Grid */}
            {filteredTopics.length === 0 ? (
              <EmptyState
                title="No topics match your filters"
                description="Try clearing your search query or selecting a different difficulty filter."
                action={
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setDifficultyFilter('All'); }}
                    className="btn-secondary"
                  >
                    Reset Filters
                  </button>
                }
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredTopics.map((topic, idx) => {
                  const isCompleted = topic.progress?.isCompleted;
                  const accuracy = topic.progress?.accuracy || 0;
                  const attempted = topic.progress?.attempted || 0;
                  const progressPct = topic.progress?.isCompleted ? 100 : (attempted > 0 ? 50 : 0);

                  const difficultyBadge =
                    topic.difficulty === 'Easy'
                      ? 'badge-success'
                      : topic.difficulty === 'Medium'
                      ? 'badge-primary'
                      : 'badge-danger';

                  return (
                    <Link
                      key={topic._id || idx}
                      to={`/student/english/${topic.slug}`}
                      className="card-interactive p-5 flex flex-col justify-between group"
                    >
                      <div>
                        {/* Top: Topic Number & Difficulty */}
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <span className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={difficultyBadge}>
                              {topic.difficulty}
                            </span>
                            {isCompleted && (
                              <span className="p-0.5 rounded-full text-emerald-600 dark:text-emerald-400" title="Completed">
                                <FiCheckCircle className="w-3.5 h-3.5" />
                              </span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {topic.name}
                        </h3>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                          {topic.description || 'Master core rules, sentence patterns, and corporate placement MCQs.'}
                        </p>
                      </div>

                      {/* Footer Stats & Progress */}
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                          <span>
                            {topic.questionCount} Questions &bull; {topic.estimatedStudyTime || '45 mins'}
                          </span>
                          {attempted > 0 ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {accuracy}% Acc
                            </span>
                          ) : (
                            <span>Not Started</span>
                          )}
                        </div>

                        <div className="h-1.5 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                            style={{ width: `${progressPct}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default English;
