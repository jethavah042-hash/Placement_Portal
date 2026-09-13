import React from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../../components/layout/DashboardLayout';
import PageHeader from '../../../components/ui/PageHeader';
import SectionHeader from '../../../components/ui/SectionHeader';
import {
  FiArrowLeft,
  FiBriefcase,
  FiCheckCircle,
  FiClock,
  FiAward,
  FiFileText,
  FiCode,
  FiUsers,
  FiAlertCircle,
  FiArrowRight,
  FiCheck,
  FiShield
} from 'react-icons/fi';

const CompanyProcess = () => {
  const { companyId } = useParams();
  const companyName = companyId
    ? companyId.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'Company';

  const rounds = [
    {
      roundNumber: 1,
      title: 'Online Aptitude & Cognitive Assessment',
      duration: '60–90 Minutes',
      mode: 'Online Proctoring',
      cutoff: 'Sectional & Overall 65%+',
      badge: 'Elimination Round',
      badgeClass: 'badge-danger',
      description: `Comprehensive screening assessment covering Quantitative Aptitude, Logical Reasoning, Verbal Ability, and Technical Fundamentals.`,
      topics: ['Quantitative Speed Math', 'Logical Deduction & Puzzles', 'Verbal Reading & Grammar', 'Core CS Fundamentals (OOPs, DBMS, OS)'],
      tips: 'Focus on time allocation per section; negative marking may apply based on current drive standards.',
    },
    {
      roundNumber: 2,
      title: 'Technical Hands-On Coding Round',
      duration: '45–60 Minutes',
      mode: 'In-Browser IDE',
      cutoff: 'All Test Cases Cleared',
      badge: 'Technical Filter',
      badgeClass: 'badge-warning',
      description: `Algorithmic programming test featuring 2 to 3 coding problems ranging from fundamental string/array operations to dynamic programming.`,
      topics: ['Array Manipulation & Hashing', 'String Traversal & Pointers', 'Matrix & Recursion', 'Basic Dynamic Programming & Graphs'],
      tips: 'Ensure optimal time and space complexity. Write clean modular code with edge cases handled.',
    },
    {
      roundNumber: 3,
      title: 'Technical Interview (TR)',
      duration: '45–60 Minutes',
      mode: 'Video / In-Person Panel',
      cutoff: 'Technical Competency Rating',
      badge: 'Core Evaluation',
      badgeClass: 'badge-primary',
    description: `1-on-1 or panel technical discussion evaluating academic projects, core Computer Science concepts, live problem solving, and system basics.`,
      topics: ['Resume Academic Projects', 'SQL Queries & Indexing', 'OOP Principles & Design Patterns', 'Live Data Structures Implementation'],
      tips: 'Explain your thought process aloud before writing code or pseudo-code on the shared whiteboard.',
    },
    {
      roundNumber: 4,
      title: 'Managerial & HR Fitment Round',
      duration: '20–30 Minutes',
      mode: 'Senior HR / Delivery Head',
      cutoff: 'Cultural & Behavioral Fit',
      badge: 'Final Selection',
      badgeClass: 'badge-success',
      description: `Final assessment evaluating company cultural alignment, adaptability, communication skills, career aspirations, and team collaboration.`,
      topics: ['Self Introduction & Career Goals', 'Situational & Behavioral Scenarios', 'Why this specific company?', 'Relocation & Shift Flexibility'],
      tips: 'Structure all behavioral responses with the STAR method (Situation, Task, Action, Result).',
    },
  ];

  const eligibilityCriteria = [
    { label: 'Academic Percentage', value: '60% or 6.0 CGPA throughout 10th, 12th, and UG / PG degree.' },
    { label: 'Active Backlogs', value: 'Zero (0) active backlogs permitted at the time of the hiring process.' },
    { label: 'Education Gap', value: 'Maximum gap of up to 2 years allowed with valid academic justification.' },
    { label: 'Eligible Degrees', value: 'B.Tech / B.E / M.Tech / MCA / M.Sc (CS / IT / Circuit Branches).' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          title={`${companyName} Recruitment Process`}
          subtitle={`Complete roadmap of selection stages, eligibility requirements, and evaluation benchmarks for ${companyName}.`}
          breadcrumbs={[
            { label: 'Dashboard', to: '/student/dashboard' },
            { label: 'Company Prep', to: '/student/company-prep' },
            { label: companyName, to: `/student/company-prep/${companyId}` },
            { label: 'Placement Process' },
          ]}
          actions={
            <Link
              to={`/student/company-prep/${companyId}`}
              className="btn-secondary"
            >
              <FiArrowLeft className="w-4 h-4" />
              <span>Back to Hub</span>
            </Link>
          }
        />

        {/* Quick Highlights Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <FiBriefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Total Rounds</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">4 Selection Stages</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Min. CGPA</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">60% / 6.0 CGPA</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <FiClock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Hiring Window</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">2–3 Weeks</div>
            </div>
          </div>

          <div className="card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <FiShield className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-gray-500 dark:text-gray-400">Drive Type</div>
              <div className="text-sm font-bold text-gray-900 dark:text-white">Campus & National</div>
            </div>
          </div>
        </div>

        {/* Recruitment Pipeline Timeline */}
        <div className="card p-5 sm:p-6">
          <SectionHeader
            title="Recruitment Stages Timeline"
            subtitle={`Step-by-step workflow of the ${companyName} selection drive`}
            badge="4 Stages"
          />

          <div className="space-y-6 mt-4">
            {rounds.map((round, idx) => (
              <div
                key={round.roundNumber}
                className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5 rounded-xl bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800/80 transition-colors hover:border-indigo-200 dark:hover:border-indigo-800/50"
              >
                {/* Round Number Indicator */}
                <div className="flex sm:flex-col items-center sm:items-start gap-3 sm:gap-2 shrink-0 sm:w-32">
                  <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                    0{round.roundNumber}
                  </div>
                  <span className={round.badgeClass}>
                    {round.badge}
                  </span>
                </div>

                {/* Round Details */}
                <div className="flex-1 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">
                      {round.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <FiClock className="w-3.5 h-3.5 text-indigo-500" />
                        {round.duration}
                      </span>
                      <span>•</span>
                      <span>{round.mode}</span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {round.description}
                  </p>

                  {/* Topics Covered */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mr-1">Focus Areas:</span>
                    {round.topics.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 text-[11px] font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Pro Tip */}
                  <div className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50/70 dark:bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40 flex items-start gap-2">
                    <FiAlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-indigo-600 dark:text-indigo-400" />
                    <span><strong>Strategy:</strong> {round.tips}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Eligibility Criteria Section */}
        <div className="card p-5 sm:p-6">
          <SectionHeader
            title="Eligibility & Academic Requirements"
            subtitle="Standard criteria required to register and sit for the campus placement process"
            badge="Checklist"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-4">
            {eligibilityCriteria.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg border border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-950/20 flex items-start gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                  <FiCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                    {item.label}
                  </div>
                  <div className="text-xs text-emerald-800 dark:text-emerald-400 mt-0.5">
                    {item.value}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Preparation Steps Callout */}
        <div className="card p-5 sm:p-6 bg-gradient-to-r from-gray-50 to-indigo-50/30 dark:from-gray-900 dark:to-indigo-950/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Ready to start practicing?
            </h4>
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
              Explore authentic previous questions or jump straight into the coding test problems.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
            <Link
              to={`/student/company-prep/${companyId}/previous-questions`}
              className="btn-secondary text-xs flex-1 sm:flex-initial"
            >
              <FiFileText className="w-3.5 h-3.5" />
              <span>Past Questions</span>
            </Link>
            <Link
              to={`/student/company-prep/${companyId}/coding-questions`}
              className="btn-primary text-xs flex-1 sm:flex-initial"
            >
              <FiCode className="w-3.5 h-3.5" />
              <span>Coding Round</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default CompanyProcess;
