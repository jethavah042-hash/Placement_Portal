import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import Badge from '../../../components/ui/Badge';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import { getCodingTopicNotesRequest } from '../../../api/coding';
import {
  FiArrowLeft,
  FiBookOpen,
  FiClock,
  FiDatabase,
  FiAlertTriangle,
  FiCheckCircle,
  FiCode,
  FiZap,
  FiLayers,
  FiCpu,
  FiX
} from 'react-icons/fi';

const CodingNotes = () => {
  const { topicId } = useParams();
  const [notes, setNotes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const topicName = topicId
    ? topicId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Topic';

  const fetchNotes = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getCodingTopicNotesRequest(topicId);
      if (data.success) {
        setNotes(data.data);
      }
    } catch (err) {
      console.error('Error fetching coding notes:', err);
      setError(err.response?.data?.message || 'Unable to load theoretical notes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [topicId]);

  const headerActions = (
    <div className="flex flex-wrap items-center gap-2.5">
      <Link
        to={`/student/coding/${topicId}`}
        className="btn-secondary text-xs py-2 px-3.5"
      >
        <FiArrowLeft className="w-4 h-4" />
        <span>{topicName} Hub</span>
      </Link>
      <Link
        to={`/student/coding/${topicId}/challenges`}
        className="btn-primary text-xs py-2 px-3.5"
      >
        <FiCode className="w-4 h-4" />
        <span>Practice {topicName} Problems</span>
      </Link>
    </div>
  );

  return (
    <DashboardLayout>
      {/* Page Header */}
      <PageHeader
        title={`${notes?.topic || topicName} — Theoretical Guide`}
        subtitle="Time & Space complexities, core data structure invariants, pseudocodes, and placement tips."
        breadcrumbs={[
          { label: 'Dashboard', to: '/student/dashboard' },
          { label: 'Coding & DSA', to: '/student/coding' },
          { label: topicName, to: `/student/coding/${topicId}` },
          { label: 'Theory Notes' }
        ]}
        actions={headerActions}
      />

      {loading ? (
        <LoadingState variant="page" />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchNotes} />
        </div>
      ) : !notes ? (
        <div className="card p-6">
          <EmptyState
            icon={FiBookOpen}
            title="No theoretical notes available"
            description="Notes for this topic are currently being prepared."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: Definition & Foundation */}
          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <FiBookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                  Definition & Theoretical Foundation
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Fundamental definitions and mathematical characteristics
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {notes.introduction}
            </p>

            <div className="surface-muted p-4 rounded-lg text-sm text-gray-700 dark:text-gray-300 border border-gray-200/70 dark:border-gray-800">
              <strong className="text-gray-900 dark:text-white block mb-1 text-xs uppercase tracking-wider font-semibold">
                Formal Definition
              </strong>
              <span className="leading-relaxed text-xs sm:text-sm">
                {notes.definition}
              </span>
            </div>
          </div>

          {/* Section 2: Core Concepts */}
          {notes.concepts && notes.concepts.length > 0 && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <FiLayers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Core Concepts & Memory Models
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Key invariants, memory layout, and operational behaviors
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.concepts.map((concept, idx) => (
                  <div
                    key={idx}
                    className="surface-muted p-4 rounded-lg border border-gray-200/70 dark:border-gray-800 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                  >
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      {concept.title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {concept.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 3: Time & Space Complexity Summary Table */}
          {notes.complexityOverview && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <FiClock className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Complexity Analysis Cheat Sheet
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Asymptotic runtime and auxiliary memory bounds
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-800 text-gray-500 dark:text-gray-400 font-semibold bg-gray-50 dark:bg-gray-800/50">
                      <th className="py-3 px-4">Operation</th>
                      <th className="py-3 px-4">Best Case</th>
                      <th className="py-3 px-4">Average Case</th>
                      <th className="py-3 px-4">Worst Case</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800 font-mono">
                    {(notes.complexityOverview.timeSummary || []).map((row, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="py-3 px-4 font-sans font-medium text-gray-900 dark:text-white">
                          {row.operation}
                        </td>
                        <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">{row.best}</td>
                        <td className="py-3 px-4 text-indigo-600 dark:text-indigo-400 font-semibold">{row.average}</td>
                        <td className="py-3 px-4 text-amber-600 dark:text-amber-400 font-semibold">{row.worst}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Section 4: Standard Algorithms & Pseudocodes */}
          {notes.algorithms && notes.algorithms.length > 0 && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                  <FiCpu className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Standard Algorithms & Pseudocode
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Step-by-step algorithms commonly tested in technical placement rounds
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                {notes.algorithms.map((algo, idx) => (
                  <div
                    key={idx}
                    className="surface-muted p-5 rounded-xl border border-gray-200/70 dark:border-gray-800"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2.5">
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                        {algo.name}
                      </h3>
                      <div className="flex items-center gap-2 font-mono text-xs">
                        <span className="badge-success">
                          Time: {algo.timeComplexity?.average || 'O(N)'}
                        </span>
                        <span className="badge-primary">
                          Space: {algo.spaceComplexity || 'O(1)'}
                        </span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-3.5 leading-relaxed">
                      {algo.description}
                    </p>

                    <div className="rounded-lg overflow-hidden bg-gray-950 border border-gray-800">
                      <div className="px-3.5 py-1.5 bg-gray-900 border-b border-gray-800 text-[11px] font-mono text-gray-400 flex items-center justify-between">
                        <span>Pseudocode Implementation</span>
                        <span className="text-indigo-400">Algorithm</span>
                      </div>
                      <pre className="p-4 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
                        <code>{algo.pseudocode}</code>
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 5: Placement Traps & Common Mistakes */}
          {notes.commonMistakes && notes.commonMistakes.length > 0 && (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-9 h-9 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <FiAlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                    Common Traps & Placement Pitfalls
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Frequent errors that cause test failures or interview rejections
                  </p>
                </div>
              </div>

              <div className="space-y-2.5">
                {notes.commonMistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-lg bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 flex items-start gap-3"
                  >
                    <span className="w-4 h-4 shrink-0 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-300 font-bold text-[10px] flex items-center justify-center mt-0.5">
                      <FiX className="w-3 h-3" />
                    </span>
                    <p className="text-xs text-rose-900 dark:text-rose-300 leading-relaxed font-medium">
                      {mistake}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 6: Interview & Placement Pro Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {notes.interviewTips && notes.interviewTips.length > 0 && (
              <div className="card p-5 border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/30 dark:bg-indigo-950/10">
                <div className="flex items-center gap-2 mb-3.5">
                  <FiZap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  <h3 className="text-sm font-semibold text-indigo-950 dark:text-indigo-300">
                    Technical Interview Tips
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                  {notes.interviewTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <FiCheckCircle className="w-3.5 h-3.5 shrink-0 text-indigo-600 dark:text-indigo-400 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {notes.placementTips && notes.placementTips.length > 0 && (
              <div className="card p-5 border-emerald-100 dark:border-emerald-900/40 bg-emerald-50/30 dark:bg-emerald-950/10">
                <div className="flex items-center gap-2 mb-3.5">
                  <FiCheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <h3 className="text-sm font-semibold text-emerald-950 dark:text-emerald-300">
                    Campus Placement Strategy
                  </h3>
                </div>
                <ul className="space-y-2 text-xs text-gray-700 dark:text-gray-300">
                  {notes.placementTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <FiCheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default CodingNotes;
