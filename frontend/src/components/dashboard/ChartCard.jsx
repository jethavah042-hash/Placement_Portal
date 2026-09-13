import React, { useContext, useState, useEffect } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ThemeContext } from '../../context/ThemeContext';
import { getProgressHistoryRequest } from '../../api/dashboard';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Filler, Legend);

const ChartCard = () => {
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';
  const [days, setDays] = useState(30);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchProgress = async () => {
      setLoading(true);
      try {
        const { data } = await getProgressHistoryRequest(days);
        if (isMounted && data.success && Array.isArray(data.data)) {
          setChartData(data.data);
        }
      } catch (err) {
        console.error('Failed to load chart progress:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    fetchProgress();
    return () => { isMounted = false; };
  }, [days]);

  const labels = chartData.map(d => {
    const parts = d.date.split('-');
    return parts.length === 3 ? `${parts[1]}/${parts[2]}` : d.date;
  });

  const scores = chartData.map(d => d.progress);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: isDark ? '#1E293B' : '#FFFFFF',
        titleColor: isDark ? '#F1F5F9' : '#0F172A',
        bodyColor: isDark ? '#94A3B8' : '#475569',
        borderColor: isDark ? '#334155' : '#E2E8F0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        titleFont: { weight: '600', size: 12 },
        bodyFont: { size: 11 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        border: { display: false },
        ticks: {
          color: isDark ? '#64748B' : '#94A3B8',
          font: { size: 11 },
          maxTicksLimit: days === 90 ? 10 : days === 30 ? 8 : 7,
        },
      },
      y: {
        grid: {
          color: isDark ? '#1E293B' : '#F1F5F9',
          drawBorder: false,
        },
        border: { display: false },
        ticks: {
          color: isDark ? '#64748B' : '#94A3B8',
          font: { size: 11 },
        },
        min: 0,
        max: 100,
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  };

  const data = {
    labels: labels.length > 0 ? labels : ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5'],
    datasets: [
      {
        fill: true,
        label: 'Readiness Score',
        data: scores.length > 0 ? scores : [0, 0, 0, 0, 0],
        borderColor: '#4F46E5',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 280);
          gradient.addColorStop(0, 'rgba(79, 70, 229, 0.12)');
          gradient.addColorStop(1, 'rgba(79, 70, 229, 0)');
          return gradient;
        },
        tension: 0.35,
        pointRadius: days === 90 ? 2 : 3,
        pointHoverRadius: 5,
        pointBackgroundColor: '#4F46E5',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        borderWidth: 2,
      },
    ],
  };

  const timeFilters = [
    { label: '7D', value: 7 },
    { label: '30D', value: 30 },
    { label: '90D', value: 90 },
  ];

  return (
    <div className="card p-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Performance History</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Preparation score over time</p>
        </div>

        <div className="tab-list">
          {timeFilters.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setDays(tab.value)}
              className={days === tab.value ? 'tab-item-active' : 'tab-item'}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="h-56 w-full relative">
        {loading ? (
          <div className="h-full w-full flex items-center justify-center">
            <div className="animate-spin h-6 w-6 border-2 border-indigo-600 border-t-transparent rounded-full" />
          </div>
        ) : (
          <Line options={options} data={data} key={`${theme}-${days}`} />
        )}
      </div>
    </div>
  );
};

export default ChartCard;
