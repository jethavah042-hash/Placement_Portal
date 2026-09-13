import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import StatCard from '../../components/ui/StatCard';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { FiTrendingUp, FiTarget, FiActivity, FiAward, FiCpu, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Analytics = () => {
  const weeklyData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Questions Solved',
        data: [12, 19, 15, 25, 22, 30, 28],
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.12)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
      }
    ],
  };

  const monthlyProgressData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Quantitative',
        data: [65, 75, 80, 85],
        backgroundColor: '#4F46E5',
        borderRadius: 6,
      },
      {
        label: 'Coding DSA',
        data: [40, 55, 70, 82],
        backgroundColor: '#059669',
        borderRadius: 6,
      },
    ],
  };

  const readinessData = {
    labels: ['Readiness Index', 'Remaining'],
    datasets: [
      {
        data: [78, 22],
        backgroundColor: [
          '#4F46E5',
          '#E2E8F0'
        ],
        borderWidth: 0,
        cutout: '78%',
      }
    ]
  };

  return (
    <DashboardLayout>
      <PageHeader
        title="Performance Analytics"
        subtitle="Comprehensive diagnostic tracking, score trajectories, and AI-driven capability index."
      />

      {/* Top STATS OVERVIEW */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          label="Daily Problem Velocity"
          value="+14 Qs"
          icon={FiActivity}
          iconColor="text-indigo-600 dark:text-indigo-400"
          iconBg="bg-indigo-50 dark:bg-indigo-950/40"
          trend="Today"
          trendUp={true}
        />
        <StatCard
          label="Weekly Average"
          value="21.5 / day"
          icon={FiTrendingUp}
          iconColor="text-blue-600 dark:text-blue-400"
          iconBg="bg-blue-50 dark:bg-blue-950/40"
          trend="+18%"
          trendUp={true}
        />
        <StatCard
          label="Mock Tests Evaluated"
          value="12 Completed"
          icon={FiTarget}
          iconColor="text-emerald-600 dark:text-emerald-400"
          iconBg="bg-emerald-50 dark:bg-emerald-950/40"
          trend="Active"
          trendUp={true}
        />
        <StatCard
          label="Campus Standing"
          value="Top 15%"
          icon={FiAward}
          iconColor="text-amber-600 dark:text-amber-400"
          iconBg="bg-amber-50 dark:bg-amber-950/40"
          trend="Percentile"
          trendUp={true}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly Progress Chart */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Weekly Activity Trend</h2>
              <p className="text-xs text-gray-500">Practice questions solved over the last 7 days</p>
            </div>
            <span className="badge-primary text-xs">Past 7 Days</span>
          </div>

          <div className="h-64 w-full relative">
            <Line 
              data={weeklyData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: 'rgba(0,0,0,0.04)' } }
                }
              }} 
            />
          </div>
        </div>

        {/* Readiness Score Doughnut */}
        <div className="lg:col-span-1 card p-5 flex flex-col items-center justify-between">
          <div className="w-full mb-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Placement Readiness Gauge</h2>
            <p className="text-xs text-gray-500">Aggregated capability rating</p>
          </div>

          <div className="relative w-44 h-44 flex items-center justify-center my-2">
            <Doughnut 
              data={readinessData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { legend: { display: false }, tooltip: { enabled: false } },
                animation: { animateScale: true }
              }} 
            />
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-gray-900 dark:text-white tabular-nums">78%</span>
              <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mt-0.5">Ready</span>
            </div>
          </div>

          <div className="w-full p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 text-center border border-gray-100 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-600 dark:text-gray-300">Targeting Tier-1 & Tier-2 corporate roles.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress Chart */}
        <div className="card p-5">
          <div className="mb-4">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Monthly Domain Accuracy</h2>
            <p className="text-xs text-gray-500">Quantitative vs Algorithmic scores</p>
          </div>
          <div className="h-60 w-full">
            <Bar 
              data={monthlyProgressData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false,
                plugins: { 
                  legend: { position: 'bottom', labels: { usePointStyle: true, boxWidth: 6, font: { size: 11 } } } 
                },
                scales: {
                  x: { grid: { display: false } },
                  y: { grid: { color: 'rgba(0,0,0,0.04)' }, max: 100 }
                }
              }} 
            />
          </div>
        </div>

        {/* AI Performance Insights */}
        <div className="card p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white border-slate-800">
          <h2 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <FiCpu className="w-4 h-4 text-indigo-400" />
            <span>AI Diagnostic Insights</span>
          </h2>
          <div className="space-y-4 text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                <FiCheckCircle className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider text-[10px]">Identified Strengths</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                You are scoring above 85% in <strong className="text-white">Quantitative Arithmetic</strong> and <strong className="text-white">Graph Theory</strong>. Solution speed has improved by 12% this week.
              </p>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold mb-1">
                <FiAlertCircle className="w-3.5 h-3.5" />
                <span className="uppercase tracking-wider text-[10px]">Target Focus Area</span>
              </div>
              <p className="text-slate-300 leading-relaxed">
                <strong className="text-white">Dynamic Programming</strong> accuracy is currently 40%. We recommend revising Tabulation vs Memoization before attempting hard problems.
              </p>
            </div>
            <div className="p-3 rounded-lg bg-white/5 border border-white/10 mt-2">
              <span className="text-[10px] text-indigo-300 font-bold uppercase tracking-wider block mb-0.5">Recommended Next Action</span>
              <span className="text-xs font-semibold text-white">Complete 2 TCS & Infosys pattern Mock Assessments this week.</span>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Analytics;
