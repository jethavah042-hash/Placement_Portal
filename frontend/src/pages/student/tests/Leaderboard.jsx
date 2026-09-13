import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import LoadingState from '../../../components/ui/LoadingState';
import ErrorState from '../../../components/ui/ErrorState';
import EmptyState from '../../../components/ui/EmptyState';
import { getTestLeaderboardRequest } from '../../../api/test';
import {
  FiAward,
  FiClock,
  FiPlay,
  FiUser
} from 'react-icons/fi';

const Leaderboard = () => {
  const { testId } = useParams();
  const [leaderboard, setLeaderboard] = useState([]);
  const [testInfo, setTestInfo] = useState(null);
  const [myRank, setMyRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getTestLeaderboardRequest(testId);
      if (data.success) {
        setLeaderboard(data.data || []);
        setTestInfo(data.test || null);
        setMyRank(data.myRank || null);
      }
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError(err.response?.data?.message || 'Unable to load test leaderboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [testId]);

  const formatTime = (seconds) => {
    if (!seconds) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <DashboardLayout>
      <PageHeader
        title={`${testInfo?.title || 'Mock Test'} Leaderboard`}
        subtitle="Rankings determined by total obtained marks and completion speed."
        breadcrumbs={[
          { label: 'Mock Tests', to: '/student/mock-tests' },
          { label: 'Leaderboard', to: `/student/mock-tests/${testId}/leaderboard` }
        ]}
        actions={
          <Link
            to={`/student/mock-tests/${testId}/arena`}
            className="btn-primary text-xs py-2 inline-flex items-center gap-1.5"
          >
            <FiPlay className="w-3.5 h-3.5" />
            <span>Retake Test</span>
          </Link>
        }
      />

      {loading ? (
        <LoadingState variant="table" rows={6} />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchLeaderboard} />
      ) : (
        <div className="space-y-6">
          {/* User's Personal Performance Banner (if attempted) */}
          {myRank && (
            <div className="card p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-lg bg-white/10 flex items-center justify-center text-xl font-bold text-amber-300 border border-white/15">
                  #{myRank.rank}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Your Standing</h3>
                  <p className="text-xs text-indigo-200 mt-0.5">
                    Score: <strong>{myRank.score} pts ({myRank.percentage}%)</strong> • Accuracy: <strong>{myRank.accuracy}%</strong>
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] text-slate-400 block font-medium">Time Taken</span>
                <strong className="text-white font-mono text-sm">{formatTime(myRank.timeTaken)}</strong>
              </div>
            </div>
          )}

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Rank 2 (Silver) */}
              <div className="card p-5 text-center flex flex-col items-center justify-center order-2 md:order-1">
                <span className="badge-neutral text-xs mb-2">
                  🥈 Rank #2
                </span>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{leaderboard[1].name}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{leaderboard[1].college}</p>
                <div className="mt-3 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {leaderboard[1].score} pts • {formatTime(leaderboard[1].timeTaken)}
                </div>
              </div>

              {/* Rank 1 (Gold) */}
              <div className="card p-5 border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10 text-center flex flex-col items-center justify-center order-1 md:order-2">
                <span className="badge-warning text-xs mb-2">
                  🥇 Rank #1
                </span>
                <h4 className="font-bold text-base text-gray-900 dark:text-white">{leaderboard[0].name}</h4>
                <p className="text-xs text-gray-500 mt-0.5">{leaderboard[0].college}</p>
                <div className="mt-3 px-3 py-1 bg-amber-500 text-white rounded-md text-xs font-mono font-bold">
                  {leaderboard[0].score} pts • {formatTime(leaderboard[0].timeTaken)}
                </div>
              </div>

              {/* Rank 3 (Bronze) */}
              <div className="card p-5 text-center flex flex-col items-center justify-center order-3">
                <span className="badge-neutral text-xs mb-2">
                  🥉 Rank #3
                </span>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white">{leaderboard[2].name}</h4>
                <p className="text-[11px] text-gray-500 mt-0.5">{leaderboard[2].college}</p>
                <div className="mt-3 text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  {leaderboard[2].score} pts • {formatTime(leaderboard[2].timeTaken)}
                </div>
              </div>
            </div>
          )}

          {/* Full Leaderboard Table */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Rankings ({leaderboard.length} Candidates)
                </h2>
                <p className="text-xs text-gray-500">Live evaluation records</p>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <EmptyState
                icon={FiAward}
                title="No attempts logged yet"
                description="Be the first student to take this test and claim Rank #1!"
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800">
                      <th className="py-3 px-4 w-16 text-center">Rank</th>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">College / Branch</th>
                      <th className="py-3 px-4">Score</th>
                      <th className="py-3 px-4">Accuracy</th>
                      <th className="py-3 px-4">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                    {leaderboard.map((student) => (
                      <tr
                        key={student.userId}
                        className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-3 px-4 text-center font-bold">
                          #{student.rank}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {student.name}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-500">
                          {student.college} • {student.branch}
                        </td>
                        <td className="py-3 px-4 font-semibold text-indigo-600 dark:text-indigo-400 font-mono">
                          {student.score} pts ({student.percentage}%)
                        </td>
                        <td className="py-3 px-4 font-mono">
                          {student.accuracy}%
                        </td>
                        <td className="py-3 px-4 text-gray-500 font-mono">
                          {formatTime(student.timeTaken)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Leaderboard;
