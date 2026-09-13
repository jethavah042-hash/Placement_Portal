import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import StatCard from '../../components/ui/StatCard';
import ModuleCard from '../../components/ui/ModuleCard';
import SearchBar from '../../components/ui/SearchBar';
import Badge from '../../components/ui/Badge';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { getStudentReasoningDashboardRequest } from '../../api/reasoning';
import {
  FiLayers,
  FiCheckCircle,
  FiTarget,
  FiZap,
  FiAward,
  FiClock,
  FiBookOpen,
  FiArrowRight,
  FiBookmark,
  FiAlertTriangle,
  FiTrendingUp,
  FiActivity
} from 'react-icons/fi';

const Reasoning = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [searchTopic, setSearchTopic] = useState('');

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getStudentReasoningDashboardRequest();
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reasoning dashboard:', err);
      setError('Unable to load reasoning analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const metrics = data?.metrics || {
    progress: 0,
    questionsAttempted: 0,
    questionsSolved: 0,
    accuracy: 0,
    studyStreak: 0,
    completedTopics: 0,
    remainingTopics: 0,
    totalTopics: 0,
    bookmarkedCount: 0
  };

  const filteredTopics = (data?.topics || []).filter(t => {
    const matchDiff = selectedDifficulty === 'All' || t.difficulty === selectedDifficulty;
    const matchSearch = t.name.toLowerCase().includes(searchTopic.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(searchTopic.toLowerCase()));
    return matchDiff && matchSearch;
  });

  const pageHeaderActions = (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link
        to="/student/reasoning/practice"
        className="btn-primary"
      >
        <FiZap className="w-4 h-4" />
        <span>Quick Practice</span>
      </Link>
      <Link
        to="/student/reasoning/quiz"
        className="btn-secondary"
      >
        <FiAward className="w-4 h-4" />
        <span>Timed Quiz</span>
      </Link>
      <Link
        to="/student/reasoning/bookmarks"
        className="btn-secondary"
        title="Saved Bookmarks"
      >
        <FiBookmark className="w-4 h-4" />
        <span>Bookmarks</span>
      </Link>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title="Logical Reasoning"
        subtitle="Master analytical, deductive, non-verbal, and diagrammatic reasoning patterns for placement exams."
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Logical Reasoning' }
        ]}
        actions={pageHeaderActions}
      />

      {loading ? (
        <LoadingState variant="page" rows={4} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchDashboard} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Key Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label={`${metrics.completedTopics} of ${metrics.totalTopics} Topics Mastered`}
              value={`${metrics.progress}%`}
              icon={FiLayers}
              iconColor="text-indigo-600 dark:text-indigo-400"
              iconBg="bg-indigo-50 dark:bg-indigo-950/40"
            />
            <StatCard
              label={`${metrics.questionsAttempted} Attempted`}
              value={metrics.questionsSolved}
              icon={FiCheckCircle}
              iconColor="text-emerald-600 dark:text-emerald-400"
              iconBg="bg-emerald-50 dark:bg-emerald-950/40"
            />
            <StatCard
              label="Overall Precision Rating"
              value={`${metrics.accuracy}%`}
              icon={FiTarget}
              iconColor="text-purple-600 dark:text-purple-400"
              iconBg="bg-purple-50 dark:bg-purple-950/40"
            />
            <StatCard
              label="Daily Consistency"
              value={`${metrics.studyStreak} Days 🔥`}
              icon={FiZap}
              iconColor="text-amber-600 dark:text-amber-400"
              iconBg="bg-amber-50 dark:bg-amber-950/40"
            />
          </div>

          {/* Performance Guidance & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Recommended Focus */}
            {data?.recommendedPractice ? (
              <div className="card p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-indigo-800/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-2">
                    <FiTrendingUp className="w-3.5 h-3.5" />
                    <span>Recommended Focus</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    {data.recommendedPractice.topic}
                  </h3>
                  <p className="text-xs text-indigo-200/80 mt-1.5 leading-relaxed line-clamp-3">
                    {data.recommendedPractice.reason}
                  </p>
                </div>
                <Link
                  to={`/student/reasoning/${data.recommendedPractice.slug}`}
                  className="mt-4 btn-primary bg-white text-indigo-950 hover:bg-indigo-50 active:bg-indigo-100 border-none shadow-none text-xs font-semibold self-start"
                >
                  <span>Start Practicing</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="card p-5 flex flex-col justify-between">
                <div>
                  <SectionHeader
                    title="Recommended Focus"
                    subtitle="Adaptive recommendation based on past attempts"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Take more practice tests or topic quizzes to unlock tailored focus recommendations.
                  </p>
                </div>
                <Link
                  to="/student/reasoning/practice"
                  className="mt-4 btn-secondary text-xs self-start"
                >
                  Explore Practice
                </Link>
              </div>
            )}

            {/* Weak Topics */}
            <div className="card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <FiAlertTriangle className="text-rose-500 w-4 h-4" />
                    <span>Weak Areas (&lt;50% Accuracy)</span>
                  </h3>
                  <Badge variant="neutral" size="sm">
                    {data?.weakTopics?.length || 0}
                  </Badge>
                </div>

                {!data?.weakTopics || data.weakTopics.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    🎉 Excellent! No weak areas detected so far.
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {data.weakTopics.slice(0, 3).map(wt => (
                      <div
                        key={wt.topic}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {wt.topic}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {wt.attempted} attempts
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs font-bold text-rose-600 dark:text-rose-400 block">
                            {wt.accuracy}%
                          </span>
                          <Link
                            to={`/student/reasoning/${wt.slug}`}
                            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
                          >
                            Fix Now
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Strong Topics */}
            <div className="card p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                    <FiAward className="text-emerald-500 w-4 h-4" />
                    <span>Strong Areas (&ge;70% Accuracy)</span>
                  </h3>
                  <Badge variant="neutral" size="sm">
                    {data?.strongTopics?.length || 0}
                  </Badge>
                </div>

                {!data?.strongTopics || data.strongTopics.length === 0 ? (
                  <div className="py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                    Complete topic quizzes to reveal your strongest reasoning domains!
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {data.strongTopics.slice(0, 3).map(st => (
                      <div
                        key={st.topic}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30"
                      >
                        <div className="min-w-0 flex-1 pr-2">
                          <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                            {st.topic}
                          </p>
                          <p className="text-[11px] text-gray-500 dark:text-gray-400">
                            {st.correct} / {st.attempted} correct
                          </p>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                          {st.accuracy}%
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reasoning Topics Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <SectionHeader
                title="Reasoning Study Modules"
                subtitle="Select a topic to explore comprehensive notes, shortcuts, practice sets, and timed quizzes."
                badge={`${filteredTopics.length} Topics`}
              />

              {/* Filters */}
              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <SearchBar
                  value={searchTopic}
                  onChange={(e) => setSearchTopic(e.target.value)}
                  placeholder="Filter topics..."
                  className="w-48 sm:w-64"
                />
                <select
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  className="input py-2 text-xs font-medium w-auto cursor-pointer"
                >
                  <option value="All">All Levels</option>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>

            {/* Topics Grid */}
            {filteredTopics.length === 0 ? (
              <div className="card p-6">
                <EmptyState
                  title="No reasoning topics found"
                  description="Try adjusting your search query or difficulty level filter."
                  action={
                    <button
                      onClick={() => { setSearchTopic(''); setSelectedDifficulty('All'); }}
                      className="btn-secondary text-xs"
                    >
                      Reset Filters
                    </button>
                  }
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTopics.map((topic) => {
                  const p = topic.progress || {};
                  const isCompleted = p.completed || (p.mcqsAttempted >= 3 && p.accuracy >= 60);

                  const difficultyVariant =
                    topic.difficulty === 'Easy'
                      ? 'success'
                      : topic.difficulty === 'Hard'
                      ? 'danger'
                      : 'primary';

                  return (
                    <ModuleCard
                      key={topic._id || topic.slug}
                      title={topic.name}
                      description={topic.description || 'Master logical rules, diagrams, and analytical patterns.'}
                      icon={FiLayers}
                      iconColor="text-indigo-600 dark:text-indigo-400"
                      iconBg="bg-indigo-50 dark:bg-indigo-950/40"
                      to={`/student/reasoning/${topic.slug}`}
                      badge={topic.difficulty}
                      badgeColor={
                        difficultyVariant === 'success'
                          ? 'badge-success'
                          : difficultyVariant === 'danger'
                          ? 'badge-danger'
                          : 'badge-primary'
                      }
                      progress={isCompleted ? 100 : p.accuracy || 0}
                      stats={
                        isCompleted
                          ? '✓ Topic Completed'
                          : p.mcqsAttempted > 0
                          ? `${p.mcqsAttempted} attempted • ${p.accuracy || 0}% accuracy`
                          : `${topic.questionCount || 0} Questions • ${topic.estimatedStudyTime || '45 mins'}`
                      }
                    />
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

export default Reasoning;
