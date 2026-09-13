import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import SearchBar from '../../../components/ui/SearchBar';
import Badge from '../../../components/ui/Badge';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import { getCodingInterviewQuestionsRequest } from '../../../api/coding';
import {
  FiArrowLeft,
  FiMessageCircle,
  FiChevronDown,
  FiChevronUp,
  FiCheckCircle,
  FiTag,
  FiCode
} from 'react-icons/fi';

const CodingInterview = () => {
  const { topicId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [openIds, setOpenIds] = useState({});

  const topicName = topicId
    ? topicId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'All Topics';

  const fetchQuestions = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (topicId) params.topic = topicName;
      if (difficultyFilter !== 'All') params.difficulty = difficultyFilter;
      if (search) params.search = search;

      const { data } = await getCodingInterviewQuestionsRequest(params);
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (err) {
      console.error('Error fetching interview questions:', err);
      setError(err.response?.data?.message || 'Unable to load interview questions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [topicId, difficultyFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchQuestions();
  };

  const toggleAnswer = (id) => {
    setOpenIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all = {};
    questions.forEach(q => { all[q._id] = true; });
    setOpenIds(all);
  };

  const collapseAll = () => {
    setOpenIds({});
  };

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link
        to={topicId ? `/student/coding/${topicId}` : '/student/coding'}
        className="btn-secondary text-xs py-2 px-3.5"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>{topicId ? `${topicName} Hub` : 'All Topics'}</span>
      </Link>
      {topicId && (
        <Link
          to={`/student/coding/${topicId}/challenges`}
          className="btn-primary text-xs py-2 px-3.5"
        >
          <FiCode className="w-4 h-4" />
          <span>Practice {topicName} Problems</span>
        </Link>
      )}
    </div>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title={`${topicName} Technical Interview Q&A`}
        subtitle="Top conceptual, algorithmic, and complexity questions asked in FAANG & Campus technical rounds."
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Coding & DSA', to: '/student/coding' },
          ...(topicId ? [{ label: topicName, to: `/student/coding/${topicId}` }] : []),
          { label: 'Interview Q&A' }
        ]}
        actions={headerActions}
      />

      {/* Filter and Search Bar */}
      <div className="card p-4 sm:p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="w-full md:w-96">
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions, complexities, algorithms..."
          />
        </form>

        <div className="flex flex-wrap items-center gap-2">
          <div className="tab-list">
            {['All', 'Basic', 'Intermediate', 'Advanced'].map(diff => (
              <button
                key={diff}
                type="button"
                onClick={() => setDifficultyFilter(diff)}
                className={`tab-item text-xs font-semibold px-3 py-1.5 rounded-md ${
                  difficultyFilter === diff
                    ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                    : ''
                }`}
              >
                {diff}
              </button>
            ))}
          </div>

          <div className="h-5 w-px bg-gray-200 dark:border-gray-800 mx-1 hidden sm:block" />

          <button
            type="button"
            onClick={expandAll}
            className="btn-ghost text-xs py-1.5 px-2.5 font-semibold"
          >
            Expand All
          </button>
          <button
            type="button"
            onClick={collapseAll}
            className="btn-ghost text-xs py-1.5 px-2.5 font-semibold"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Section Header */}
      <SectionHeader
        title="Questions Repository"
        subtitle={`Showing ${questions.length} technical interview questions`}
      />

      {/* Questions Accordion List */}
      {loading ? (
        <LoadingState variant="list" rows={5} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchQuestions} />
        </div>
      ) : questions.length === 0 ? (
        <div className="card p-6">
          <EmptyState
            icon={FiMessageCircle}
            title="No interview questions found"
            description="Try adjusting your search terms or difficulty filter."
          />
        </div>
      ) : (
        <div className="space-y-3.5">
          {questions.map((item, index) => {
            const isOpen = !!openIds[item._id];
            const diffVariant =
              item.difficulty === 'Basic' || item.difficulty === 'Easy'
                ? 'success'
                : item.difficulty === 'Intermediate' || item.difficulty === 'Medium'
                ? 'warning'
                : 'danger';

            return (
              <div
                key={item._id}
                className="card overflow-hidden transition-colors"
              >
                {/* Question Row Header */}
                <div
                  onClick={() => toggleAnswer(item._id)}
                  className="p-4 sm:p-5 flex items-start justify-between gap-4 cursor-pointer hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors select-none"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                        #{index + 1}
                      </span>
                      <Badge variant="neutral" size="sm">
                        {item.topic}
                      </Badge>
                      <Badge variant={diffVariant} size="sm">
                        {item.difficulty}
                      </Badge>
                    </div>

                    <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white leading-snug">
                      {item.question}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-0.5">
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hidden sm:inline">
                      {isOpen ? 'Hide Answer' : 'Reveal Answer'}
                    </span>
                    <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-600 dark:text-gray-400">
                      {isOpen ? <FiChevronUp className="w-4 h-4" /> : <FiChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </div>

                {/* Answer Drawer */}
                {isOpen && (
                  <div className="p-5 pt-0 border-t border-gray-100 dark:border-gray-800 bg-gray-50/40 dark:bg-gray-900/60">
                    {/* Recommended Interview Response */}
                    <div className="surface-muted p-4 rounded-lg border border-gray-200/70 dark:border-gray-800 mb-4 mt-4">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-2">
                        <FiCheckCircle className="w-4 h-4" />
                        <span>Recommended Interview Response</span>
                      </div>
                      <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed font-normal">
                        {item.answer}
                      </p>
                    </div>

                    {/* Key Discussion Points */}
                    {item.keyPoints && item.keyPoints.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Key Talking Points for Interviewer
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {item.keyPoints.map((point, idx) => (
                            <span
                              key={idx}
                              className="text-xs font-medium px-2.5 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40"
                            >
                              • {point}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Company Tags */}
                    {item.companyTags && item.companyTags.length > 0 && (
                      <div className="flex items-center gap-2 pt-1 text-xs text-gray-500 dark:text-gray-400">
                        <FiTag className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium">Frequently Asked By:</span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.companyTags.map((company, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-[11px] font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                            >
                              {company}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default CodingInterview;
