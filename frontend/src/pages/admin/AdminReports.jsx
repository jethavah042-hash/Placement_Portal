import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import StatCard from '../../components/ui/StatCard';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { getAdminReportsRequest } from '../../api/admin';
import {
  FiBarChart2,
  FiDownload,
  FiFilter,
  FiCalendar,
  FiCheckCircle,
  FiFileText,
  FiUsers,
  FiAward,
  FiCode
} from 'react-icons/fi';

const AdminReports = () => {
  const [selectedModule, setSelectedModule] = useState('all');
  const [days, setDays] = useState(30);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminReportsRequest({ module: selectedModule, days });
      if (res.data.success) {
        setReportData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError(err.response?.data?.message || 'Failed to aggregate report data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedModule, days]);

  // Export to CSV Function
  const exportToCSV = () => {
    if (!reportData) return;

    let csvContent = 'data:text/csv;charset=utf-8,';

    if (selectedModule === 'students' || selectedModule === 'all') {
      csvContent += 'STUDENTS REPORT\n';
      csvContent += 'Name,Email,College,Branch,ReadinessScore,Streak,Status,JoinedDate\n';
      (reportData.students || []).forEach((s) => {
        csvContent += `"${s.name}","${s.email}","${s.college || ''}","${s.branch || ''}",${
          s.readinessScore || 0
        },${s.streak || 0},"${s.accountStatus || 'active'}","${new Date(
          s.createdAt
        ).toISOString()}"\n`;
      });
      csvContent += '\n';
    }

    if (selectedModule === 'tests' || selectedModule === 'all') {
      csvContent += 'MOCK TESTS REPORT\n';
      csvContent +=
        'StudentName,StudentEmail,TestTitle,Score,TotalMarks,Percentage,Accuracy,Status,Date\n';
      (reportData.tests || []).forEach((t) => {
        csvContent += `"${t.userId?.name || 'N/A'}","${t.userId?.email || 'N/A'}","${
          t.title
        }",${t.obtainedMarks},${t.totalMarks},${t.percentage}%,${t.accuracy}%,"${
          t.status
        }","${new Date(t.createdAt).toISOString()}"\n`;
      });
      csvContent += '\n';
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `placement_report_${selectedModule}_${days}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AdminLayout>
      <PageHeader
        title="Reports & Data Export"
        subtitle="Generate and download institutional placement readiness audit reports directly from the database."
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Reports' }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <span className="badge-primary hidden sm:inline-flex">
              CSV Export Ready
            </span>
            <button
              onClick={exportToCSV}
              disabled={loading || !reportData}
              className="btn-primary"
            >
              <FiDownload className="w-4 h-4" />
              <span>Download CSV</span>
            </button>
          </div>
        }
      />

      {/* Filter and Date Range Ribbon */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Module Selector */}
          <div className="tab-list self-start sm:self-auto overflow-x-auto">
            {['all', 'students', 'tests', 'coding', 'resumes'].map((m) => (
              <button
                key={m}
                onClick={() => setSelectedModule(m)}
                className={`tab-item capitalize text-xs ${
                  selectedModule === m ? 'tab-item-active font-semibold' : ''
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            {[7, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  days === d
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                Last {d} Days
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Aggregates & Content */}
      {loading ? (
        <LoadingState variant="page" rows={3} />
      ) : error ? (
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchReports} />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Aggregated Stat Cards Row */}
          <div>
            <SectionHeader
              title="Aggregate Metrics"
              subtitle={`Activity summary across the past ${days} days`}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="New Candidates Registered"
                value={reportData?.students?.length || 0}
                icon={FiUsers}
                iconColor="text-blue-600 dark:text-blue-400"
                iconBg="bg-blue-50 dark:bg-blue-950/50"
              />

              <StatCard
                label="Assessments Logged"
                value={reportData?.tests?.length || 0}
                icon={FiAward}
                iconColor="text-indigo-600 dark:text-indigo-400"
                iconBg="bg-indigo-50 dark:bg-indigo-950/50"
              />

              <StatCard
                label="Code Runs Executed"
                value={reportData?.coding?.length || 0}
                icon={FiCode}
                iconColor="text-purple-600 dark:text-purple-400"
                iconBg="bg-purple-50 dark:bg-purple-950/50"
              />

              <StatCard
                label="Resumes Evaluated"
                value={reportData?.resumes?.length || 0}
                icon={FiFileText}
                iconColor="text-emerald-600 dark:text-emerald-400"
                iconBg="bg-emerald-50 dark:bg-emerald-950/50"
              />
            </div>
          </div>

          {/* Student Breakdown Table Preview */}
          {reportData?.students && reportData.students.length > 0 && (
            <div className="card overflow-hidden">
              <div className="p-5 border-b border-gray-200 dark:border-gray-800">
                <SectionHeader
                  title="Candidate Enrollment Sample"
                  subtitle={`Previewing first 10 records of ${reportData.students.length} total candidates in period`}
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">College</th>
                      <th className="py-3 px-4 text-center">Readiness</th>
                      <th className="py-3 px-4">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300 text-xs">
                    {reportData.students.slice(0, 10).map((s) => (
                      <tr
                        key={s._id}
                        className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                      >
                        <td className="py-3.5 px-4 font-semibold text-gray-900 dark:text-white">
                          {s.name}
                        </td>
                        <td className="py-3.5 px-4 font-mono text-gray-500 dark:text-gray-400">
                          {s.email}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 dark:text-gray-400">
                          {s.college || 'Marwadi University'}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                          {s.readinessScore || 0}%
                        </td>
                        <td className="py-3.5 px-4 text-gray-400 dark:text-gray-500 font-mono">
                          {new Date(s.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminReports;
