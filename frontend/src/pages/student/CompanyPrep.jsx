import React from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import { FiArrowRight, FiBriefcase, FiLayers } from 'react-icons/fi';

const companies = [
  { name: 'TCS', abbr: 'TCS', color: 'bg-blue-600', rounds: '4 Rounds', type: 'Mass Recruiter' },
  { name: 'Infosys', abbr: 'INF', color: 'bg-blue-500', rounds: '3 Rounds', type: 'IT Services' },
  { name: 'Wipro', abbr: 'WPR', color: 'bg-indigo-600', rounds: '3 Rounds', type: 'IT Services' },
  { name: 'Accenture', abbr: 'ACC', color: 'bg-purple-600', rounds: '4 Rounds', type: 'Consulting' },
  { name: 'Cognizant', abbr: 'CTS', color: 'bg-emerald-600', rounds: '3 Rounds', type: 'IT Services' },
  { name: 'Capgemini', abbr: 'CAP', color: 'bg-teal-600', rounds: '4 Rounds', type: 'Tech & Ops' },
  { name: 'IBM', abbr: 'IBM', color: 'bg-blue-700', rounds: '4 Rounds', type: 'Product/Services' },
  { name: 'HCL', abbr: 'HCL', color: 'bg-sky-600', rounds: '3 Rounds', type: 'Tech Services' },
  { name: 'Amazon', abbr: 'AMZ', color: 'bg-amber-600', rounds: '5 Rounds', type: 'Product Tech' },
  { name: 'Google', abbr: 'GOO', color: 'bg-rose-600', rounds: '5 Rounds', type: 'Product Tech' },
  { name: 'Microsoft', abbr: 'MSFT', color: 'bg-cyan-600', rounds: '5 Rounds', type: 'Product Tech' },
];

const CompanyPrep = () => {
  return (
    <DashboardLayout>
      <PageHeader
        title="Company-Wise Preparation"
        subtitle="Hiring process workflows, past placement questions, HR frameworks, and interview journals for target recruiters."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {companies.map((company) => {
          const slug = company.name.toLowerCase().replace(/\s+/g, '-');
          
          return (
            <Link
              to={`/student/company-prep/${slug}`}
              key={company.name}
              className="card-interactive p-5 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white shadow-xs ${company.color}`}>
                    {company.abbr}
                  </div>
                  <span className="badge-neutral text-[10px]">{company.type}</span>
                </div>

                <h3 className="font-semibold text-base text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {company.name}
                </h3>
                
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Recruitment Blueprint & Past Papers
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                <span className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
                  {company.rounds}
                </span>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Explore</span>
                  <FiArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </DashboardLayout>
  );
};

export default CompanyPrep;
