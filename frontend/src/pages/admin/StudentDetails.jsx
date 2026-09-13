import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdminLayout from '../../components/layout/AdminLayout';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import LoadingState from '../../components/ui/LoadingState';
import ErrorState from '../../components/ui/ErrorState';
import EmptyState from '../../components/ui/EmptyState';
import { getAdminStudentDetailRequest, toggleBlockStudentRequest } from '../../api/admin';
import {
  FiArrowLeft,
  FiUser,
  FiMail,
  FiBook,
  FiAward,
  FiCode,
  FiFileText,
  FiActivity,
  FiSlash,
  FiCheckCircle,
  FiClock,
  FiCalendar,
  FiCheckSquare
} from 'react-icons/fi';

const StudentDetails = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('tests');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getAdminStudentDetailRequest(id);
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching student details:', err);
      setError(err.response?.data?.message || 'Unable to retrieve student profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleToggleBlock = async () => {
    setActionLoading(true);
    try {
      await toggleBlockStudentRequest(id);
      await fetchDetails();
    } catch (err) {
      console.error('Error toggling block:', err);
      alert('Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <LoadingState variant="page" rows={3} />
      </AdminLayout>
    );
  }

  if (error || !data?.student) {
    return (
      <AdminLayout>
        <div className="card p-6">
          <ErrorState
            message={error || 'Student not found'}
            onRetry={fetchDetails}
          />
          <div className="mt-4 text-center">
            <Link to="/admin/students" className="btn-secondary text-xs">
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Students List</span>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const { student, results = [], submissions = [], scans = [], activities = [] } = data;

  const tabs = [
    { id: 'tests', label: `Mock Tests (${results.length})`, icon: FiAward },
    { id: 'coding', label: `Coding (${submissions.length})`, icon: FiCode },
    { id: 'resume', label: `Resume Scans (${scans.length})`, icon: FiFileText },
    { id: 'activity', label: `Live Activity (${activities.length})`, icon: FiActivity }
  ];

  return (
    <AdminLayout>
      <PageHeader
        title={student.name}
        subtitle={`${student.email} • Candidate Profile`}
        breadcrumbs={[
          { label: 'Admin', to: '/admin/dashboard' },
          { label: 'Students', to: '/admin/students' },
          { label: student.name }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/admin/students" className="btn-secondary text-xs">
              <FiArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </Link>
            <button
              onClick={handleToggleBlock}
              disabled={actionLoading}
              className={student.isBlocked ? 'btn-primary' : 'btn-danger'}
            >
              {student.isBlocked ? (
                <>
                  <FiCheckCircle className="w-4 h-4" />
                  <span>Unblock Student</span>
                </>
              ) : (
                <>
                  <FiSlash className="w-4 h-4" />
                  <span>Block Student</span>
                </>
              )}
            </button>
          </div>
        }
      />

      {/* Student Overview Ribbon Card */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold text-2xl flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50 shrink-0">
              {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {student.name}
                </h2>
                <span
                  className={
                    student.isBlocked ? 'badge-danger' : 'badge-success'
                  }
                >
                  {student.isBlocked ? 'Blocked' : 'Active Account'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {student.college || 'Marwadi University'} • {student.branch || 'MCA'} • Class of {student.graduationYear || '2026'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">
                Registered on {new Date(student.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Quick Stat Pill Cards */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40 text-center min-w-[100px] flex-1 md:flex-initial">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold block">
                Readiness
              </span>
              <strong className="text-base font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                {student.readinessScore || 0}%
              </strong>
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/40 text-center min-w-[100px] flex-1 md:flex-initial">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold block">
                Practice Streak
              </span>
              <strong className="text-base font-bold text-amber-600 dark:text-amber-400 font-mono">
                🔥 {student.streak || 0}d
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tab-list mb-6 w-full sm:w-auto overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`tab-item flex items-center gap-2 whitespace-nowrap text-xs ${
                activeTab === tab.id ? 'tab-item-active font-semibold' : ''
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Mock Tests */}
      {activeTab === 'tests' && (
        <div className="card overflow-hidden">
          {results.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FiAward}
                title="No Mock Tests Attempted"
                description="No assessment results recorded for this candidate yet."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Assessment Title</th>
                    <th className="py-3 px-4">Score</th>
                    <th className="py-3 px-4">Accuracy</th>
                    <th className="py-3 px-4">Time Taken</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300 text-xs">
                  {results.map((r) => (
                    <tr
                      key={r._id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        {r.title}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {r.obtainedMarks} / {r.totalMarks} ({r.percentage}%)
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                        {r.accuracy}%
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                        {Math.round((r.timeTaken || 0) / 60)} mins
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={
                            r.status === 'Passed' ? 'badge-success' : 'badge-warning'
                          }
                        >
                          {r.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-gray-400 dark:text-gray-500 font-mono">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Coding Submissions */}
      {activeTab === 'coding' && (
        <div className="card overflow-hidden">
          {submissions.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FiCode}
                title="No Coding Submissions"
                description="No code submissions recorded for this candidate yet."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">Problem</th>
                    <th className="py-3 px-4">Difficulty</th>
                    <th className="py-3 px-4">Language</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4">Test Cases</th>
                    <th className="py-3 px-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300 text-xs">
                  {submissions.map((s) => (
                    <tr
                      key={s._id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        {s.problemId?.title || 'Coding Challenge'}
                      </td>
                      <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                        {s.problemId?.difficulty || 'Medium'}
                      </td>
                      <td className="py-3 px-4 font-mono uppercase text-[11px] text-gray-500">
                        {s.language}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={
                            s.status === 'Accepted' ? 'badge-success' : 'badge-danger'
                          }
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                        {s.passedTestCases}/{s.totalTestCases}
                      </td>
                      <td className="py-3 px-4 text-gray-400 dark:text-gray-500 font-mono">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Resume Scans */}
      {activeTab === 'resume' && (
        <div className="card overflow-hidden">
          {scans.length === 0 ? (
            <div className="p-6">
              <EmptyState
                icon={FiFileText}
                title="No Resumes Evaluated"
                description="No resume ATS evaluations found for this student."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-500 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider border-b border-gray-200 dark:border-gray-800">
                  <tr>
                    <th className="py-3 px-4">File Name</th>
                    <th className="py-3 px-4">ATS Score</th>
                    <th className="py-3 px-4">Grade</th>
                    <th className="py-3 px-4">Readiness</th>
                    <th className="py-3 px-4">Scanned On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300 text-xs">
                  {scans.map((sc) => (
                    <tr
                      key={sc._id}
                      className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-semibold text-gray-900 dark:text-white">
                        {sc.fileName}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                        {sc.atsScore} / 100
                      </td>
                      <td className="py-3 px-4">
                        <span className="badge-primary">{sc.atsGrade}</span>
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600 dark:text-gray-400">
                        {sc.placementReadiness}%
                      </td>
                      <td className="py-3 px-4 text-gray-400 dark:text-gray-500 font-mono">
                        {new Date(sc.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Live Activity */}
      {activeTab === 'activity' && (
        <div className="card p-5">
          <SectionHeader
            title="Candidate Activity Stream"
            subtitle="Chronological log of student interactions across modules"
          />

          {activities.length === 0 ? (
            <EmptyState
              icon={FiActivity}
              title="No Activity Logged"
              description="No recent portal activity recorded for this candidate."
            />
          ) : (
            <div className="space-y-2.5 divide-y divide-gray-100 dark:divide-gray-800">
              {activities.map((a) => (
                <div
                  key={a._id}
                  className="pt-2.5 first:pt-0 flex items-center justify-between text-xs"
                >
                  <div>
                    <strong className="text-gray-900 dark:text-white font-semibold block">
                      {a.title}
                    </strong>
                    <span className="text-gray-500 dark:text-gray-400 text-[11px]">
                      Module: <span className="font-medium">{a.module}</span>
                    </span>
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 font-mono text-[11px]">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </AdminLayout>
  );
};

export default StudentDetails;
