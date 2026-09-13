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
import {
  getCodingProblemsRequest,
  getCodingProblemDetailRequest,
  runCodingProblemRequest,
  submitCodingProblemRequest,
  toggleCodingBookmarkRequest
} from '../../../api/coding';
import {
  FiArrowLeft,
  FiCode,
  FiPlay,
  FiCheckCircle,
  FiXCircle,
  FiBookmark,
  FiBookOpen,
  FiZap,
  FiRefreshCw,
  FiCheck,
  FiCpu,
  FiLayers,
  FiAlertCircle,
  FiPieChart
} from 'react-icons/fi';

const CODING_TOPICS_LIST = [
  'All', 'Arrays', 'Strings', 'Linked List', 'Stack', 'Queue',
  'Trees', 'Graphs', 'Recursion', 'Sorting', 'Searching', 'Dynamic Programming'
];

const CodingChallenges = () => {
  const { topicId } = useParams();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filters
  const [selectedTopic, setSelectedTopic] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [search, setSearch] = useState('');
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  // Active Problem & IDE State
  const [activeProblem, setActiveProblem] = useState(null);
  const [activeTab, setActiveTab] = useState('description'); // 'description' | 'hints' | 'editorial'
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [activeTestTab, setActiveTestTab] = useState(0);

  // Normalize topic name from URL param if present
  useEffect(() => {
    if (topicId) {
      const formatted = topicId.split('-').map(w => w.charAt(0).toUpperCase() + wordSlice(w)).join(' ');
      const matched = CODING_TOPICS_LIST.find(t => t.toLowerCase() === formatted.toLowerCase());
      if (matched) setSelectedTopic(matched);
      else setSelectedTopic('All');
    }
  }, [topicId]);

  const wordSlice = (str) => str.slice(1);

  // Fetch Problems catalog
  const fetchProblems = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (selectedTopic !== 'All') params.topic = selectedTopic;
      if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;
      if (selectedStatus !== 'All') params.status = selectedStatus;
      if (bookmarkedOnly) params.bookmarked = true;
      if (search) params.search = search;

      const { data } = await getCodingProblemsRequest(params);
      if (data.success) {
        setProblems(data.data);
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError(err.response?.data?.message || 'Unable to load coding problems.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, [selectedTopic, selectedDifficulty, selectedStatus, bookmarkedOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProblems();
  };

  // Open Problem in IDE Arena
  const openProblemInIDE = async (problemId) => {
    try {
      const { data } = await getCodingProblemDetailRequest(problemId);
      if (data.success) {
        const prob = data.data;
        setActiveProblem(prob);
        setRunResult(null);
        setSubmitResult(null);
        setActiveTestTab(0);
        setActiveTab('description');

        const initialLang = prob.lastLanguage || 'javascript';
        setLanguage(initialLang);

        if (prob.lastCode) {
          setCode(prob.lastCode);
        } else if (prob.starterCode && prob.starterCode[initialLang]) {
          setCode(prob.starterCode[initialLang]);
        } else {
          setCode(`// Write your solution for ${prob.title}\nfunction solution(...args) {\n  // Write your code here\n  \n}`);
        }
      }
    } catch (err) {
      console.error('Error opening problem:', err);
    }
  };

  // Switch Language
  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (activeProblem?.starterCode && activeProblem.starterCode[newLang]) {
      setCode(activeProblem.starterCode[newLang]);
    } else {
      if (newLang === 'python') {
        setCode(`def solution(*args):\n    # Write your solution here\n    pass`);
      } else if (newLang === 'java') {
        setCode(`class Solution {\n    public Object solution(Object... args) {\n        // Write your code here\n        return null;\n    }\n}`);
      } else if (newLang === 'cpp') {
        setCode(`class Solution {\npublic:\n    // Write your solution here\n};`);
      } else {
        setCode(`function solution(...args) {\n  // Write your solution here\n  \n}`);
      }
    }
  };

  // Reset to clean template
  const handleResetCode = () => {
    handleLanguageChange(language);
    setRunResult(null);
    setSubmitResult(null);
  };

  // Toggle Bookmark
  const handleBookmarkToggle = async () => {
    if (!activeProblem) return;
    try {
      const { data } = await toggleCodingBookmarkRequest(activeProblem._id);
      if (data.success) {
        setActiveProblem(prev => ({ ...prev, isBookmarked: data.bookmarked }));
        setProblems(prev => prev.map(p => p._id === activeProblem._id ? { ...p, isBookmarked: data.bookmarked } : p));
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  // Run Code against Sample Test Cases
  const handleRunCode = async () => {
    if (!activeProblem || !code) return;
    setIsRunning(true);
    setRunResult(null);
    setSubmitResult(null);

    try {
      const { data } = await runCodingProblemRequest(activeProblem._id, { code, language });
      if (data.success) {
        setRunResult(data.data);
        setActiveTestTab(0);
      }
    } catch (err) {
      setRunResult({
        status: 'Runtime Error',
        errorMessage: err.response?.data?.message || 'Execution failed',
        testResults: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Submit Code against Hidden Test Cases
  const handleSubmitCode = async () => {
    if (!activeProblem || !code) return;
    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const { data } = await submitCodingProblemRequest(activeProblem._id, { code, language });
      if (data.success) {
        setSubmitResult(data.data);
        setActiveTestTab(0);

        if (data.data.status === 'Accepted') {
          setActiveProblem(prev => ({ ...prev, status: 'Solved' }));
          setProblems(prev => prev.map(p => p._id === activeProblem._id ? { ...p, status: 'Solved' } : p));
        }
      }
    } catch (err) {
      setSubmitResult({
        status: 'Runtime Error',
        errorMessage: err.response?.data?.message || 'Submission evaluation failed',
        testResults: []
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const headerActions = activeProblem ? (
    <button
      type="button"
      onClick={() => setActiveProblem(null)}
      className="btn-secondary text-xs py-2 px-3.5"
    >
      <FiArrowLeft className="w-4 h-4" />
      <span>Back to Problem Catalog</span>
    </button>
  ) : (
    <div className="flex items-center gap-2.5">
      <Link
        to={topicId ? `/student/coding/${topicId}` : '/student/coding'}
        className="btn-secondary text-xs py-2 px-3.5"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>{topicId ? 'Topic Hub' : 'All Topics'}</span>
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
        title={activeProblem ? activeProblem.title : "Coding Problem Arena & IDE"}
        subtitle={
          activeProblem
            ? `Topic: ${activeProblem.topic} | Difficulty: ${activeProblem.difficulty} | Status: ${activeProblem.status || 'Unsolved'}`
            : "Solve algorithmic placement challenges with multi-language sandboxed execution and test case verification."
        }
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Coding & DSA', to: '/student/coding' },
          ...(topicId ? [{ label: selectedTopic !== 'All' ? selectedTopic : 'Topic', to: `/student/coding/${topicId}` }] : []),
          { label: activeProblem ? activeProblem.title : 'Problem Arena' }
        ]}
        actions={headerActions}
      />

      {/* ========================================================================= */}
      {/* VIEW 1: INTERACTIVE PROBLEM CATALOG */}
      {/* ========================================================================= */}
      {!activeProblem && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="card p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <form onSubmit={handleSearchSubmit} className="w-full lg:w-80">
              <SearchBar
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search problems by title or tags..."
              />
            </form>

            <div className="flex flex-wrap items-center gap-2.5 text-xs">
              {/* Topic Select */}
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="input !py-1.5 !px-3 text-xs w-auto min-w-[130px]"
              >
                {CODING_TOPICS_LIST.map(t => (
                  <option key={t} value={t}>{t === 'All' ? 'All Topics' : t}</option>
                ))}
              </select>

              {/* Difficulty Filter */}
              <div className="tab-list">
                {['All', 'Easy', 'Medium', 'Hard'].map(d => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSelectedDifficulty(d)}
                    className={`tab-item text-xs font-semibold px-2.5 py-1 rounded-md ${
                      selectedDifficulty === d
                        ? 'bg-white dark:bg-gray-900 text-indigo-600 dark:text-indigo-400 shadow-sm'
                        : ''
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input !py-1.5 !px-3 text-xs w-auto min-w-[110px]"
              >
                <option value="All">All Status</option>
                <option value="Solved">Solved</option>
                <option value="Attempted">Attempted</option>
                <option value="Unsolved">Unsolved</option>
              </select>

              {/* Bookmarked Only */}
              <button
                type="button"
                onClick={() => setBookmarkedOnly(!bookmarkedOnly)}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                  bookmarkedOnly
                    ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <FiBookmark className={`w-3.5 h-3.5 ${bookmarkedOnly ? 'fill-amber-500 text-amber-500' : ''}`} />
                <span>Bookmarked</span>
              </button>
            </div>
          </div>

          {/* Section Header */}
          <SectionHeader
            title="Challenges Directory"
            subtitle={`Showing ${problems.length} problems matching your criteria`}
          />

          {/* Problems Table */}
          {loading ? (
            <LoadingState variant="table" rows={6} />
          ) : error ? (
            <div className="card p-6">
              <ErrorState message={error} onRetry={fetchProblems} />
            </div>
          ) : problems.length === 0 ? (
            <div className="card p-6">
              <EmptyState
                icon={FiCode}
                title="No coding problems found"
                description="Try relaxing your filter parameters or search terms."
              />
            </div>
          ) : (
            <div className="card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800/50">
                      <th className="py-3 px-4 w-12 text-center">Status</th>
                      <th className="py-3 px-4">Problem Title</th>
                      <th className="py-3 px-4">Topic</th>
                      <th className="py-3 px-4">Difficulty</th>
                      <th className="py-3 px-4">Complexity</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                    {problems.map((prob) => {
                      const diffVariant =
                        prob.difficulty === 'Easy'
                          ? 'success'
                          : prob.difficulty === 'Medium'
                          ? 'warning'
                          : 'danger';

                      return (
                        <tr
                          key={prob._id}
                          className="hover:bg-gray-50/70 dark:hover:bg-gray-800/30 transition-colors group"
                        >
                          <td className="py-3 px-4 text-center">
                            {prob.status === 'Solved' ? (
                              <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto" />
                            ) : prob.status === 'Attempted' ? (
                              <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-500 mx-auto" />
                            ) : (
                              <span className="text-gray-300 dark:text-gray-700 text-base">•</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span
                                onClick={() => openProblemInIDE(prob._id)}
                                className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 cursor-pointer transition-colors"
                              >
                                {prob.title}
                              </span>
                              {prob.isBookmarked && (
                                <FiBookmark className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                              )}
                            </div>
                            {prob.tags && prob.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {prob.tags.slice(0, 3).map((tag, idx) => (
                                  <span
                                    key={idx}
                                    className="px-1.5 py-0.2 text-[10px] rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 font-medium text-gray-600 dark:text-gray-400">
                            {prob.topic}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={diffVariant} size="sm">
                              {prob.difficulty}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 font-mono text-[11px] text-gray-500 dark:text-gray-400">
                            {prob.timeComplexity || 'O(N)'} / {prob.spaceComplexity || 'O(1)'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => openProblemInIDE(prob._id)}
                              className="btn-primary !py-1.5 !px-3 text-xs ml-auto"
                            >
                              <span>Solve</span>
                              <FiPlay className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: INTERACTIVE CODE EDITOR & ARENA */}
      {/* ========================================================================= */}
      {activeProblem && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Problem Details / Hints / Editorial (5 cols) */}
          <div className="lg:col-span-5 card flex flex-col h-[780px] overflow-hidden">
            {/* Tabs Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 pt-3 bg-gray-50/50 dark:bg-gray-900">
              <div className="flex gap-1.5">
                {[
                  { id: 'description', label: 'Problem' },
                  { id: 'hints', label: `Hints (${activeProblem.hints?.length || 0})` },
                  { id: 'editorial', label: 'Editorial' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 border-t-2 border-indigo-600'
                        : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={handleBookmarkToggle}
                className="btn-icon p-1.5 text-gray-400 hover:text-amber-500"
                title="Bookmark Problem"
              >
                <FiBookmark className={`w-4 h-4 ${activeProblem.isBookmarked ? 'text-amber-500 fill-amber-500' : ''}`} />
              </button>
            </div>

            {/* Tab Body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-5">
              {activeTab === 'description' && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="neutral" size="sm">
                      {activeProblem.topic}
                    </Badge>
                    <Badge
                      variant={
                        activeProblem.difficulty === 'Easy' ? 'success' :
                        activeProblem.difficulty === 'Medium' ? 'warning' : 'danger'
                      }
                      size="sm"
                    >
                      {activeProblem.difficulty}
                    </Badge>
                    {activeProblem.status === 'Solved' && (
                      <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 ml-auto">
                        <FiCheckCircle className="w-3.5 h-3.5" /> Solved
                      </span>
                    )}
                  </div>

                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {activeProblem.title}
                  </h2>

                  <div className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed space-y-4">
                    <p>{activeProblem.description}</p>

                    {/* Examples */}
                    {activeProblem.examples && activeProblem.examples.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <h4 className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Examples
                        </h4>
                        {activeProblem.examples.map((ex, idx) => (
                          <div
                            key={idx}
                            className="surface-muted p-3.5 rounded-lg font-mono text-xs space-y-1 border border-gray-200/70 dark:border-gray-800"
                          >
                            <div><strong className="text-indigo-600 dark:text-indigo-400">Input:</strong> {ex.input}</div>
                            <div><strong className="text-emerald-600 dark:text-emerald-400">Output:</strong> {ex.output}</div>
                            {ex.explanation && (
                              <div className="text-gray-500 dark:text-gray-400 font-sans text-xs pt-1 border-t border-gray-200/50 dark:border-gray-800 mt-1">
                                <strong>Explanation:</strong> {ex.explanation}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Constraints */}
                    {activeProblem.constraints && activeProblem.constraints.length > 0 && (
                      <div className="pt-2">
                        <h4 className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                          Constraints
                        </h4>
                        <ul className="list-disc list-inside space-y-1 font-mono text-xs text-gray-600 dark:text-gray-400">
                          {activeProblem.constraints.map((c, idx) => (
                            <li key={idx}>{c}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'hints' && (
                <div className="space-y-3.5">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Progressive Hints</h3>
                  {activeProblem.hints && activeProblem.hints.length > 0 ? (
                    activeProblem.hints.map((hint, idx) => (
                      <div
                        key={idx}
                        className="surface-muted p-4 rounded-lg border border-purple-100 dark:border-purple-900/30"
                      >
                        <span className="text-xs font-semibold text-purple-700 dark:text-purple-300 block mb-1">
                          Hint {idx + 1}
                        </span>
                        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                          {hint}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-500">No hints available for this problem.</p>
                  )}
                </div>
              )}

              {activeTab === 'editorial' && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white">Editorial & Approach</h3>
                  <div className="surface-muted p-4 rounded-lg text-xs text-gray-700 dark:text-gray-300 space-y-2 border border-gray-200/70 dark:border-gray-800">
                    <p><strong>Expected Time Complexity:</strong> {activeProblem.timeComplexity || 'O(N)'}</p>
                    <p><strong>Expected Space Complexity:</strong> {activeProblem.spaceComplexity || 'O(1)'}</p>
                    <p className="pt-2 leading-relaxed">
                      {activeProblem.explanation || 'Optimal solution utilizes standard algorithmic structures.'}
                    </p>
                  </div>

                  {activeProblem.solution?.code && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-xs text-gray-500 uppercase tracking-wider mb-2">
                        Optimal Reference Solution ({activeProblem.solution.language || 'JavaScript'})
                      </h4>
                      <pre className="p-4 bg-gray-950 text-emerald-400 font-mono text-xs rounded-lg overflow-x-auto leading-relaxed border border-gray-800">
                        <code>{activeProblem.solution.code}</code>
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Code Editor & Execution Console (7 cols) */}
          <div className="lg:col-span-7 flex flex-col h-[780px] space-y-4">
            {/* Editor Container */}
            <div className="bg-gray-950 rounded-xl border border-gray-800 shadow-sm flex-1 flex flex-col overflow-hidden">
              {/* Editor Top Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800 text-xs">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-gray-400 font-medium">Language:</span>
                  <select
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="bg-gray-800 text-gray-200 font-mono text-xs rounded-md px-2.5 py-1 border border-gray-700 focus:outline-none"
                  >
                    <option value="javascript">JavaScript (Node.js)</option>
                    <option value="python">Python 3</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="c">C</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleResetCode}
                    className="text-gray-400 hover:text-gray-200 px-2 py-1 text-xs transition-colors"
                    title="Reset to starter template"
                  >
                    Reset Template
                  </button>
                </div>
              </div>

              {/* Textarea Code Input */}
              <div className="flex-1 p-4 font-mono text-xs text-emerald-400 bg-gray-950 overflow-hidden flex flex-col">
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  spellCheck="false"
                  className="w-full h-full bg-transparent text-emerald-400 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                  placeholder="// Enter your solution function here..."
                />
              </div>

              {/* Action Buttons Bar */}
              <div className="flex items-center justify-between p-3 bg-gray-900 border-t border-gray-800">
                <div className="text-[11px] font-mono text-gray-400">
                  Sandboxed Runner (2.0s Timeout)
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleRunCode}
                    disabled={isRunning || isSubmitting}
                    className="btn-secondary !bg-gray-800 !text-gray-200 hover:!bg-gray-700 !border-gray-700 text-xs py-1.5 px-3.5"
                  >
                    {isRunning ? <FiRefreshCw className="animate-spin" /> : <FiPlay />}
                    <span>Run Tests</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSubmitCode}
                    disabled={isRunning || isSubmitting}
                    className="btn-primary !bg-emerald-600 hover:!bg-emerald-700 text-xs py-1.5 px-4"
                  >
                    {isSubmitting ? <FiRefreshCw className="animate-spin" /> : <FiCheck />}
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Execution Console Results Box */}
            <div className="h-64 card p-4 overflow-y-auto flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 pb-2 mb-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FiCpu className="w-4 h-4" /> Execution Console
                </span>

                {(runResult || submitResult) && (
                  <Badge
                    variant={(runResult?.status || submitResult?.status) === 'Accepted' ? 'success' : 'danger'}
                    size="sm"
                  >
                    {submitResult ? `Submit: ${submitResult.status}` : `Run: ${runResult.status}`}
                  </Badge>
                )}
              </div>

              {/* Console Body */}
              {isRunning || isSubmitting ? (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-400 gap-2">
                  <FiRefreshCw className="animate-spin w-4 h-4 text-indigo-500" />
                  <span>Executing against test cases in isolated sandbox...</span>
                </div>
              ) : submitResult || runResult ? (
                (() => {
                  const currentRes = submitResult || runResult;
                  const testResults = currentRes.testResults || [];

                  return (
                    <div className="space-y-3 flex-1 flex flex-col">
                      {/* Test Case Tabs */}
                      <div className="flex items-center gap-1.5">
                        {testResults.map((tc, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveTestTab(idx)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                              activeTestTab === idx
                                ? tc.passed ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                            }`}
                          >
                            {tc.passed ? (
                              <FiCheckCircle className="w-3.5 h-3.5" />
                            ) : (
                              <FiXCircle className="w-3.5 h-3.5" />
                            )}
                            Case {idx + 1}
                          </button>
                        ))}
                      </div>

                      {/* Active Test Case Detail */}
                      {testResults[activeTestTab] && (
                        <div className="p-3 rounded-lg surface-muted font-mono text-xs space-y-1.5 flex-1 border border-gray-200/70 dark:border-gray-800">
                          <div className="flex justify-between text-[11px] text-gray-500 font-sans border-b border-gray-200/50 dark:border-gray-800 pb-1 mb-1">
                            <span>Status: <strong className={testResults[activeTestTab].passed ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-semibold"}>{testResults[activeTestTab].passed ? "Passed" : "Failed (Wrong Answer)"}</strong></span>
                            <span>Time: {testResults[activeTestTab].executionTime || 1}ms | Memory: {testResults[activeTestTab].memory || 14.2}MB</span>
                          </div>
                          <div><span className="text-gray-500">Input:</span> {testResults[activeTestTab].input}</div>
                          <div><span className="text-gray-500">Expected:</span> <span className="text-gray-800 dark:text-gray-200">{testResults[activeTestTab].expectedOutput}</span></div>
                          <div><span className="text-gray-500">Your Output:</span> <span className={testResults[activeTestTab].passed ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-rose-600 dark:text-rose-400 font-semibold"}>{testResults[activeTestTab].actualOutput}</span></div>
                          {testResults[activeTestTab].error && (
                            <div className="text-rose-600 dark:text-rose-400 font-sans text-xs pt-1 flex items-center gap-1 font-semibold">
                              <FiAlertCircle className="w-3.5 h-3.5 shrink-0" /> Error: {testResults[activeTestTab].error}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-400">
                  Write your solution above and click "Run Tests" or "Submit" to evaluate against test cases.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CodingChallenges;
