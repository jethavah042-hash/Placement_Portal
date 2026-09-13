import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import {
  FiArrowLeft,
  FiCode,
  FiPlay,
  FiCheckCircle,
  FiSearch,
  FiFilter,
  FiLayers,
  FiClock,
  FiCpu,
  FiBookOpen,
  FiChevronRight,
  FiX,
  FiTerminal,
  FiExternalLink
} from 'react-icons/fi';

const CompanyCoding = () => {
  const { companyId } = useParams();
  const companyName = companyId
    ? companyId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Company';

  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeModalProblem, setActiveModalProblem] = useState(null);

  const challenges = useMemo(() => [
    {
      id: 1,
      title: `Pattern Printing & Matrix Transformation (${companyName} Drive)`,
      diff: 'Easy',
      topic: 'Matrix & Arrays',
      drive: 'Campus Drive 2025',
      timeComplexity: 'O(N^2)',
      spaceComplexity: 'O(1)',
      description: `Given an integer N, generate an N x N spiral matrix and print the numerical pattern traversing in clockwise order with boundary conditions handled without extra buffer.`,
      sampleInput: `N = 3`,
      sampleOutput: `1 2 3\n8 9 4\n7 6 5`,
      constraints: `1 <= N <= 50`,
      tags: ['Matrix', 'Simulation', 'Loops'],
    },
    {
      id: 2,
      title: `String Manipulation & Token Log Parser`,
      diff: 'Medium',
      topic: 'Strings & Hashing',
      drive: 'National Hiring 2025',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(K)',
      description: `Parse a stream of server log strings and extract top-K most frequently occurring user session tokens within a sliding time window.`,
      sampleInput: `logs = ["login:user1", "auth:user2", "login:user1", "query:user3"]\nK = 1`,
      sampleOutput: `["user1"]`,
      constraints: `1 <= logs.length <= 10^5, 1 <= K <= unique users`,
      tags: ['Hash Map', 'Heap', 'String Parsing'],
    },
    {
      id: 3,
      title: `Optimized Shortest Path in Network Mesh`,
      diff: 'Hard',
      topic: 'Graphs & BFS',
      drive: 'Specialized Track 2024',
      timeComplexity: 'O(V + E log V)',
      spaceComplexity: 'O(V + E)',
      description: `Find the minimum transmission delay across a weighted directed graph of data nodes from source to target, taking link latency and drop rates into account.`,
      sampleInput: `times = [[2,1,1],[2,3,1],[3,4,1]], n = 4, k = 2`,
      sampleOutput: `2`,
      constraints: `1 <= k <= n <= 100, 1 <= times.length <= 6000`,
      tags: ['Dijkstra', 'Graph', 'Priority Queue'],
    },
    {
      id: 4,
      title: `Subarray Sum Equals K with Negative Numbers`,
      diff: 'Medium',
      topic: 'Prefix Sum & Hashing',
      drive: 'Campus Drive 2024',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      description: `Given an array of integers nums and an integer k, return the total number of continuous subarrays whose sum equals to k. Optimize using Prefix Sums and Hash Maps.`,
      sampleInput: `nums = [1, -1, 0], k = 0`,
      sampleOutput: `3`,
      constraints: `1 <= nums.length <= 2 * 10^4, -1000 <= nums[i] <= 1000`,
      tags: ['Prefix Sum', 'Hash Map', 'Arrays'],
    },
    {
      id: 5,
      title: `Longest Palindromic Substring`,
      diff: 'Medium',
      topic: 'Dynamic Programming / Two Pointers',
      drive: 'Campus Drive 2024',
      timeComplexity: 'O(N^2)',
      spaceComplexity: 'O(1)',
      description: `Given a string s, return the longest palindromic substring in s using the Expand Around Center technique with minimal overhead.`,
      sampleInput: `s = "babad"`,
      sampleOutput: `"bab" or "aba"`,
      constraints: `1 <= s.length <= 1000`,
      tags: ['Two Pointers', 'String', 'DP'],
    },
    {
      id: 6,
      title: `Two Sum & Target Pair Validation`,
      diff: 'Easy',
      topic: 'Hash Map & Arrays',
      drive: 'Campus Drive 2023',
      timeComplexity: 'O(N)',
      spaceComplexity: 'O(N)',
      description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. Each input has exactly one solution.`,
      sampleInput: `nums = [2, 7, 11, 15], target = 9`,
      sampleOutput: `[0, 1]`,
      constraints: `2 <= nums.length <= 10^4`,
      tags: ['Arrays', 'Hash Map'],
    },
  ], [companyName]);

  const filteredChallenges = challenges.filter((c) => {
    const matchesDiff = selectedDifficulty === 'all' || c.diff === selectedDifficulty;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDiff && matchesSearch;
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`${companyName} - Coding Questions`}
          subtitle={`Direct algorithmic problems and coding challenges asked by ${companyName}'s technical hiring panels.`}
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Company Prep', to: '/student/company-prep' },
            { label: companyName, to: `/student/company-prep/${companyId}` },
            { label: 'Coding Questions' },
          ]}
          actions={
            <div className="flex items-center gap-2">
              <Link
                to="/student/coding"
                className="btn-primary text-xs"
              >
                <FiTerminal className="w-3.5 h-3.5" />
                <span>Coding Playground</span>
              </Link>
              <Link
                to={`/student/company-prep/${companyId}`}
                className="btn-secondary text-xs"
              >
                <FiArrowLeft className="w-4 h-4" />
                <span>Back to Hub</span>
              </Link>
            </div>
          }
        />

        {/* Main Grid: Problem List (2 Cols) + Technical Profile (1 Col) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Problem List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="tab-list">
                {['all', 'Easy', 'Medium', 'Hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setSelectedDifficulty(diff)}
                    className={`text-xs capitalize ${
                      selectedDifficulty === diff ? 'tab-item-active' : 'tab-item'
                    }`}
                  >
                    {diff === 'all' ? 'All Difficulties' : diff}
                  </button>
                ))}
              </div>

              <div className="relative min-w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search problems or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input pl-9 text-xs py-2"
                />
              </div>
            </div>

            <SectionHeader
              title="Target Coding Challenges"
              subtitle={`Showing ${filteredChallenges.length} company-specific problems`}
              badge={`${filteredChallenges.length} Problems`}
            />

            {filteredChallenges.length === 0 ? (
              <div className="card p-8 text-center">
                <FiCode className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">No coding challenges found</h3>
                <p className="text-xs text-gray-500 mt-1">Try switching difficulty filters or updating your search query.</p>
              </div>
            ) : (
              filteredChallenges.map((c) => (
                <div
                  key={c.id}
                  className="card card-hover p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <FiCode className="w-5 h-5" />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`badge text-[10px] ${
                            c.diff === 'Easy'
                              ? 'badge-success'
                              : c.diff === 'Medium'
                              ? 'badge-warning'
                              : 'badge-danger'
                          }`}
                        >
                          {c.diff}
                        </span>
                        <span className="badge-neutral text-[10px]">
                          {c.topic}
                        </span>
                        <span className="text-[11px] text-gray-400">
                          {c.drive}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {c.title}
                      </h3>

                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                        {c.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {c.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-800 shrink-0">
                    <div className="text-[11px] text-gray-400 flex items-center gap-1">
                      <FiClock className="w-3 h-3" />
                      <span>{c.timeComplexity}</span>
                    </div>

                    <button
                      onClick={() => setActiveModalProblem(c)}
                      className="btn-primary text-xs px-3 py-1.5"
                    >
                      <span>Solve Problem</span>
                      <FiPlay className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Technical Profile & Guidelines */}
          <div className="space-y-4">
            {/* Technical Profile Card */}
            <div className="card p-5 bg-gradient-to-br from-indigo-900 to-slate-900 text-white border-transparent">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-xs font-semibold uppercase tracking-wider text-indigo-200">
                  Hiring Profile
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {companyName} Coding Standards
              </h3>
              <p className="text-xs text-indigo-200 leading-relaxed mb-4">
                {companyName}&apos;s coding assessments heavily prioritize runtime efficiency, modular edge-case handling, and clean code layout.
              </p>

              <div className="space-y-2 pt-3 border-t border-white/10 text-xs">
                <div className="flex items-center justify-between text-indigo-100">
                  <span>Target Time Complexity:</span>
                  <span className="font-semibold text-white">O(N) or O(N log N)</span>
                </div>
                <div className="flex items-center justify-between text-indigo-100">
                  <span>Supported Languages:</span>
                  <span className="font-semibold text-white">C++, Java, Python, C#</span>
                </div>
                <div className="flex items-center justify-between text-indigo-100">
                  <span>Execution Time Limit:</span>
                  <span className="font-semibold text-white">1.0 – 2.0 Seconds</span>
                </div>
                <div className="flex items-center justify-between text-indigo-100">
                  <span>Memory Ceiling:</span>
                  <span className="font-semibold text-white">256 MB Max</span>
                </div>
              </div>
            </div>

            {/* High Yield DSA Topics */}
            <div className="card p-5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <FiLayers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>High Frequency Topics</span>
              </h4>

              <div className="space-y-2.5 text-xs text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40">
                  <span>1. Strings & Pattern Matching</span>
                  <span className="font-semibold text-emerald-600">35% Weight</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40">
                  <span>2. Arrays & Hash Tables</span>
                  <span className="font-semibold text-emerald-600">30% Weight</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40">
                  <span>3. Dynamic Programming</span>
                  <span className="font-semibold text-amber-600">20% Weight</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-800/40">
                  <span>4. Trees, BFS & DFS</span>
                  <span className="font-semibold text-amber-600">15% Weight</span>
                </div>
              </div>
            </div>

            {/* Quick Practice CTA */}
            <div className="card p-4 border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20">
              <div className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                Need more coding practice?
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                Access 500+ curated algorithmic problems in our dedicated code sandbox.
              </p>
              <Link
                to="/student/coding"
                className="btn-secondary w-full text-xs justify-center"
              >
                <span>Browse All Coding Problems</span>
                <FiChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Problem Detail Modal */}
        {activeModalProblem && (
          <div className="modal-overlay">
            <div className="modal-content max-w-2xl p-5 sm:p-6 space-y-4 animate-scale-in">
              <div className="flex items-start justify-between gap-4 pb-3 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`badge text-xs ${
                        activeModalProblem.diff === 'Easy'
                          ? 'badge-success'
                          : activeModalProblem.diff === 'Medium'
                          ? 'badge-warning'
                          : 'badge-danger'
                      }`}
                    >
                      {activeModalProblem.diff}
                    </span>
                    <span className="badge-neutral text-xs">{activeModalProblem.topic}</span>
                    <span className="text-xs text-gray-400">{activeModalProblem.drive}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {activeModalProblem.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveModalProblem(null)}
                  className="btn-icon shrink-0"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Problem Description */}
              <div className="space-y-3 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Problem Statement:</h4>
                  <p>{activeModalProblem.description}</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs">
                    <span className="font-semibold block text-gray-500 dark:text-gray-400 mb-1 font-sans">Sample Input:</span>
                    <pre className="whitespace-pre-wrap">{activeModalProblem.sampleInput}</pre>
                  </div>
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 font-mono text-xs">
                    <span className="font-semibold block text-gray-500 dark:text-gray-400 mb-1 font-sans">Sample Output:</span>
                    <pre className="whitespace-pre-wrap">{activeModalProblem.sampleOutput}</pre>
                  </div>
                </div>

                <div className="pt-2 text-xs">
                  <span className="font-semibold text-gray-900 dark:text-white">Constraints: </span>
                  <code className="text-indigo-600 dark:text-indigo-400">{activeModalProblem.constraints}</code>
                </div>

                <div className="flex items-center gap-4 pt-1 text-xs text-gray-500">
                  <span>Expected Time: <strong>{activeModalProblem.timeComplexity}</strong></span>
                  <span>Expected Space: <strong>{activeModalProblem.spaceComplexity}</strong></span>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-end gap-3">
                <button
                  onClick={() => setActiveModalProblem(null)}
                  className="btn-secondary text-xs"
                >
                  Close
                </button>
                <Link
                  to="/student/coding"
                  className="btn-primary text-xs"
                >
                  <FiTerminal className="w-3.5 h-3.5" />
                  <span>Open in Code Editor</span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CompanyCoding;
