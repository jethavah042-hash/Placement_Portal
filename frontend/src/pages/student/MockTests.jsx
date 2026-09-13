import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { Link } from 'react-router-dom';
import { getAllTestsRequest } from '../../api/test';
import {
  FiClock,
  FiTarget,
  FiAward,
  FiBarChart2,
  FiCheckCircle,
  FiPlay,
  FiInfo,
  FiRefreshCw
} from 'react-icons/fi';

const CATEGORIES = [
  { id: 'all', label: 'All Assessments' },
  { id: 'company', label: 'Company Specific' },
  { id: 'aptitude', label: 'Quantitative Aptitude' },
  { id: 'reasoning', label: 'Logical Reasoning' },
  { id: 'english', label: 'Verbal English' }
];

const MockTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [search, setSearch] = useState('');

  const fetchTests = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (search) params.search = search;

      const { data } = await getAllTestsRequest(params);
      if (data.success) {
        setTests(data.data || []);
      }
    } catch (err) {
      console.error('Error fetching mock tests:', err);
      setError(err.response?.data?.message || 'Unable to load mock tests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTests();
  }, [selectedCategory, selectedDifficulty]);

  return (
    <DashboardLayout>
      <PageHeader
        title="Mock Test Arena"
        subtitle="Standardized campus recruitment simulation with timed environments, negative marking, and performance analytics."
      />

      {/* Filter and Search Ribbon */}
      <div className="card p-4 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Difficulty Segment */}
          <div className="tab-list">
            {['All', 'Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDifficulty(d)}
                className={selectedDifficulty === d ? 'tab-item-active text-xs py-1.5' : 'tab-item text-xs py-1.5'}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="w-full sm:w-60">
            <SearchBar
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search assessments..."
            />
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      {loading ? (
        <LoadingState variant="page" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchTests} />
      ) : tests.length === 0 ? (
        <EmptyState
          icon={FiTarget}
          title="No assessments found"
          description="Try adjusting your category filter or search query."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tests.map((test) => {
            const badgeClass =
              test.difficulty === 'Easy'
                ? 'badge-success'
                : test.difficulty === 'Medium'
                ? 'badge-primary'
                : 'badge-danger';

            return (
              <div
                key={test._id}
                className="card-interactive p-5 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Tags & Status */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={badgeClass}>
                      {test.difficulty}
                    </span>

                    {test.isAttempted ? (
                      <span className="badge-success flex items-center gap-1">
                        <FiCheckCircle className="w-3 h-3" /> Best: {test.bestScore}/{test.totalMarks} ({test.bestPercentage}%)
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-400 font-medium">Unattempted</span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {test.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-4">
                    {test.description || 'Comprehensive recruitment test pattern with negative marking and timer.'}
                  </p>

                  {/* Company Badges */}
                  {test.companyTags && test.companyTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {test.companyTags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          className="badge-neutral text-[10px]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Test Specs Ribbon */}
                  <div className="grid grid-cols-3 gap-2 p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 mb-4 text-center border border-gray-100 dark:border-gray-800">
                    <div>
                      <span className="text-[10px] text-gray-400 font-medium block">Duration</span>
                      <strong className="text-xs text-gray-800 dark:text-gray-200 flex items-center justify-center gap-1 mt-0.5">
                        <FiClock className="w-3 h-3 text-indigo-500" /> {test.duration}m
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-medium block">Questions</span>
                      <strong className="text-xs text-gray-800 dark:text-gray-200 flex items-center justify-center gap-1 mt-0.5">
                        <FiBarChart2 className="w-3 h-3 text-indigo-500" /> {test.totalQuestions}
                      </strong>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-400 font-medium block">Penalty</span>
                      <strong className="text-xs text-rose-500 font-mono mt-0.5 block">
                        -{test.negativeMarking || 0.25}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Link
                    to={`/student/mock-tests/${test._id}/arena`}
                    className="btn-primary flex-1 py-2 text-xs text-center justify-center gap-1.5"
                  >
                    <FiPlay className="w-3 h-3" />
                    <span>Start Test</span>
                  </Link>

                  <Link
                    to={`/student/mock-tests/${test._id}/leaderboard`}
                    className="btn-secondary py-2 px-3 text-xs"
                    title="View Leaderboard"
                  >
                    <FiAward className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
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

export default MockTests;
