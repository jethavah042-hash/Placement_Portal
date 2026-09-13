import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import AnnouncementCarousel from '../../components/announcements/AnnouncementCarousel';
import BroadcastAlertBanner from '../../components/dashboard/BroadcastAlertBanner';
import ReadinessScore from '../../components/dashboard/ReadinessScore';
import ProgressCard from '../../components/dashboard/ProgressCard';
import ActivityFeed from '../../components/dashboard/ActivityFeed';
import StatCard from '../../components/ui/StatCard';
import SectionHeader from '../../components/ui/SectionHeader';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { getDashboardSummaryRequest, getUpcomingTestsRequest, getRecommendationsRequest } from '../../api/dashboard';
import {
  FiTarget,
  FiBook,
  FiCode,
  FiBriefcase,
  FiArrowRight,
  FiCalendar,
  FiAward,
  FiCheckCircle,
  FiCheckSquare,
  FiLayers,
  FiMessageSquare,
  FiFileText,
  FiCpu,
  FiTrendingUp,
  FiClock
} from 'react-icons/fi';

const Dashboard = () => {
  const { user: authUser } = useAuth();
  const [summary, setSummary] = useState(null);
  const [upcomingTests, setUpcomingTests] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const [summaryRes, upcomingRes, recRes] = await Promise.allSettled([
        getDashboardSummaryRequest(),
        getUpcomingTestsRequest(),
        getRecommendationsRequest()
      ]);

      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data?.success) {
        setSummary(summaryRes.value.data.data);
      } else if (summaryRes.status === 'rejected') {
        throw new Error('Failed to load dashboard summary');
      }

      if (upcomingRes.status === 'fulfilled' && upcomingRes.value?.data?.success) {
        setUpcomingTests(upcomingRes.value.data.data || []);
      }

      if (recRes.status === 'fulfilled' && recRes.value?.data?.success) {
        setRecommendations(recRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
      setError(err.response?.data?.message || 'Unable to load dashboard data. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <LoadingState variant="page" />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <ErrorState message={error} onRetry={fetchDashboardData} />
      </DashboardLayout>
    );
  }

  const student = summary?.student || authUser || {};
  const readiness = summary?.readiness || { score: 0, status: 'Needs Improvement' };
  const codingStats = summary?.codingStats || { totalProblemsSolved: 0 };
  const subjectProgress = summary?.subjectProgress || {};
  const recentActivities = summary?.recentActivity || [];

  const targetCompaniesList =
    student.targetCompanies && student.targetCompanies.length > 0
      ? student.targetCompanies
      : ['TCS', 'Infosys', 'Wipro', 'Amazon'];

  const profilePercent = student.profileCompletion !== undefined ? student.profileCompletion : 65;

  return (
    <DashboardLayout>
      {/* 1. Student Identity Banner */}
      <div className="card p-5 sm:p-6 mb-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800 shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="badge-primary bg-indigo-500/20 text-indigo-300 border-indigo-400/30">
                Academic Session 2025-2026
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-2">
              Welcome back, {student.name || 'Student'}
            </h1>

            <p className="text-slate-300 text-xs mt-1">
              {student.college || 'Marwadi University'} • {student.branch || 'MCA / Computer Science'} • Class of {student.graduationYear || '2026'}
            </p>

            {/* Target Companies Chips */}
            <div className="flex items-center gap-2 mt-3.5 flex-wrap">
              <span className="text-[11px] font-semibold text-slate-400">Target Recruiters:</span>
              {targetCompaniesList.map((comp, idx) => (
                <span
                  key={idx}
                  className="text-xs font-medium bg-white/10 px-2.5 py-0.5 rounded-md text-slate-200 border border-white/10"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>

          {/* Profile Completion Circular Widget */}
          <div className="p-3.5 rounded-lg bg-white/5 border border-white/10 flex items-center gap-3.5 min-w-[200px] shrink-0 self-start lg:self-auto">
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-11 h-11 transform -rotate-90">
                <circle cx="22" cy="22" r="18" stroke="rgba(255,255,255,0.15)" strokeWidth="3.5" fill="transparent" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  stroke="#818CF8"
                  strokeWidth="3.5"
                  strokeDasharray={113}
                  strokeDashoffset={113 - (113 * profilePercent) / 100}
                  fill="transparent"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-xs font-bold text-white tabular-nums">{profilePercent}%</span>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-200">Profile Readiness</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{profilePercent}% completed</p>
              <Link
                to="/student/profile"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-1"
              >
                Update Profile →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Broadcast Placement Alert Banner */}
      <BroadcastAlertBanner />

      {/* 3. Key StatCards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Readiness Rating"
          value={`${readiness.score || 0}%`}
          icon={FiTrendingUp}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40"
          trend="Evaluated"
          trendUp={true}
          to="/student/analytics"
        />

        <StatCard
          label="DSA Problems Solved"
          value={codingStats.totalProblemsSolved || 0}
          icon={FiCode}
          iconColor="text-purple-600 dark:text-purple-400"
          iconBg="bg-purple-50 dark:bg-purple-950/40"
          trend="Coding Arena"
          trendUp={true}
          to="/student/coding"
        />

        <StatCard
          label="Quantitative Covered"
          value={`${Math.round(((subjectProgress.aptitude || 65) / 100) * 40)} / 40`}
          icon={FiBook}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          trend="Aptitude Track"
          trendUp={true}
          to="/student/aptitude"
        />

        <StatCard
          label="Mock Tests Completed"
          value={summary?.mockTestsAttempted || 4}
          icon={FiCheckSquare}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          trend="Assessment Hub"
          trendUp={true}
          to="/student/mock-tests"
        />
      </div>

      {/* 4. Company Announcements Carousel */}
      <AnnouncementCarousel />

      {/* 5. Main Operational Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        
        {/* Left 2 Columns: Preparation Tracks + Upcoming Tests */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Module Progress Grid */}
          <div className="card p-5 sm:p-6">
            <SectionHeader
              title="Placement Preparation Tracks"
              subtitle="Progress tracking across core evaluation sections"
              badge="Live Status"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              <Link to="/student/aptitude" className="group">
                <ProgressCard
                  subject="Quantitative Aptitude"
                  completed={Math.round(((subjectProgress.aptitude || 65) / 100) * 40)}
                  total={40}
                  icon={FiBook}
                  colorClass="bg-indigo-600"
                />
              </Link>

              <Link to="/student/reasoning" className="group">
                <ProgressCard
                  subject="Logical Reasoning"
                  completed={Math.round(((subjectProgress.reasoning || 60) / 100) * 35)}
                  total={35}
                  icon={FiLayers}
                  colorClass="bg-blue-600"
                />
              </Link>

              <Link to="/student/english" className="group">
                <ProgressCard
                  subject="Verbal Ability & English"
                  completed={Math.round(((subjectProgress.english || 70) / 100) * 30)}
                  total={30}
                  icon={FiMessageSquare}
                  colorClass="bg-emerald-600"
                />
              </Link>

              <Link to="/student/coding" className="group">
                <ProgressCard
                  subject="Coding & DSA Practice"
                  completed={codingStats.totalProblemsSolved || 0}
                  total={codingStats.totalAvailable || 138}
                  icon={FiCode}
                  colorClass="bg-purple-600"
                />
              </Link>

              <Link to="/student/company-prep" className="group">
                <ProgressCard
                  subject="Company-Wise Prep"
                  completed={Math.round(((subjectProgress.companyPrep || 45) / 100) * 20)}
                  total={20}
                  icon={FiBriefcase}
                  colorClass="bg-amber-600"
                />
              </Link>

              <Link to="/student/resume-scanner" className="group">
                <ProgressCard
                  subject="ATS Resume Scanner"
                  completed={80}
                  total={100}
                  icon={FiFileText}
                  colorClass="bg-rose-600"
                />
              </Link>
            </div>
          </div>

          {/* Upcoming Tests & Practice Assessments */}
          <div className="card p-5 sm:p-6">
            <SectionHeader
              title="Scheduled Mock Assessments"
              subtitle="Industry-standard simulated campus tests"
              action={
                <Link
                  to="/student/mock-tests"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Tests</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </Link>
              }
            />

            {upcomingTests.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  You are up to date on all scheduled campus tests.
                </p>
                <Link
                  to="/student/mock-tests"
                  className="btn-primary text-xs py-2"
                >
                  Take Practice Assessment
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcomingTests.slice(0, 3).map((test) => (
                  <div
                    key={test._id}
                    className="p-3.5 rounded-lg bg-gray-50 dark:bg-gray-800/40 border border-gray-200/80 dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="badge-primary text-[10px] uppercase">
                          {test.difficulty || 'Standard'}
                        </span>
                        <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{test.title}</h4>
                      </div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
                        <span>⏱ {test.duration} mins</span>
                        <span>•</span>
                        <span>📝 {test.totalQuestions || 20} Questions</span>
                        <span>•</span>
                        <span>🎯 Pattern Tested</span>
                      </p>
                    </div>

                    <Link
                      to={`/student/mock-tests/${test._id}/arena`}
                      className="btn-primary text-xs py-1.5 px-3 self-start sm:self-auto shrink-0"
                    >
                      Start Test
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Readiness Score, AI Suggestions & Feed */}
        <div className="space-y-6">
          
          {/* Circular Placement Readiness Score */}
          <ReadinessScore score={readiness.score} status={readiness.status} />

          {/* AI Focus Areas & Recommendations */}
          <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-3.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0">
                <FiCpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">AI Placement Insights</h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">Personalized focus recommendations</p>
              </div>
            </div>

            <div className="space-y-2">
              {recommendations.length > 0 ? (
                recommendations.slice(0, 3).map((rec) => (
                  <Link
                    key={rec.id || rec._id}
                    to={rec.link || '/student/aptitude'}
                    className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 border border-gray-200/80 dark:border-gray-800 transition-colors group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                        {rec.category || 'Target Skill'}
                      </span>
                      <FiArrowRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 transition-colors" />
                    </div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white mt-1 group-hover:text-indigo-600 transition-colors">
                      {rec.title}
                    </h4>
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{rec.description}</p>
                  </Link>
                ))
              ) : (
                <div className="p-3.5 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 text-xs text-indigo-950 dark:text-indigo-200 leading-relaxed">
                  💡 <strong>Tip:</strong> Complete aptitude, reasoning, and coding modules to boost your campus readiness score above 80%.
                </div>
              )}
            </div>
          </div>

          {/* Activity Timeline */}
          <ActivityFeed activities={recentActivities} />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
