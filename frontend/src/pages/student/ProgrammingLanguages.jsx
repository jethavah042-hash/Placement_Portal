import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import { FiCode, FiArrowRight } from 'react-icons/fi';

const languages = [
  { name: 'C', abbr: 'C', color: 'bg-blue-600', count: '85 Problems', category: 'Systems' },
  { name: 'C++', abbr: 'C++', color: 'bg-indigo-600', count: '140 Problems', category: 'Competitive' },
  { name: 'Java', abbr: 'Java', color: 'bg-rose-600', count: '160 Problems', category: 'Enterprise' },
  { name: 'Python', abbr: 'Py', color: 'bg-amber-500', count: '175 Problems', category: 'Scripting / AI' },
  { name: 'JavaScript', abbr: 'JS', color: 'bg-amber-400 text-gray-950', count: '150 Problems', category: 'Full Stack' },
  { name: 'HTML', abbr: 'HTML', color: 'bg-orange-500', count: '50 Tests', category: 'Frontend' },
  { name: 'CSS', abbr: 'CSS', color: 'bg-blue-500', count: '65 Tests', category: 'Frontend' },
  { name: 'React', abbr: 'Re', color: 'bg-cyan-500', count: '90 Practice Sets', category: 'Framework' },
  { name: 'Node.js', abbr: 'Node', color: 'bg-emerald-600', count: '75 Sets', category: 'Backend' },
  { name: 'Express', abbr: 'Ex', color: 'bg-slate-700', count: '45 Sets', category: 'Backend' },
  { name: 'MongoDB', abbr: 'Mg', color: 'bg-emerald-500', count: '60 Queries', category: 'Database' },
  { name: 'SQL', abbr: 'SQL', color: 'bg-sky-600', count: '110 Queries', category: 'RDBMS' },
];

const ProgrammingLanguages = () => {
  return (
    <DashboardLayout>
      <PageHeader
        title="Programming Languages & Core Stacks"
        subtitle="Master syntax rules, boilerplate paradigms, and technical interview questions across 12 target technologies."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {languages.map((lang) => (
          <Link
            to={`/student/languages/${lang.name.toLowerCase()}`}
            key={lang.name}
            className="card-interactive p-5 flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-xs ${lang.color}`}>
                  {lang.abbr}
                </div>
                <span className="badge-neutral text-[10px]">{lang.category}</span>
              </div>

              <h3 className="font-semibold text-base text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {lang.name}
              </h3>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Syntax, MCQs & Interview Qs
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                {lang.count}
              </span>
              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                <span>Start</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default ProgrammingLanguages;
