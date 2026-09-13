import React from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Table from '../../components/common/Table';
import { FiPlus, FiDownload } from 'react-icons/fi';

const GenericManagePage = ({ title, description, columns, data }) => {
  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
          <p className="text-sm text-gray-500 mt-1">{description}</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
            <FiDownload /> Export
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-lg shadow-indigo-500/30">
            <FiPlus /> Create New
          </button>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-[0px_4px_20px_rgba(0,0,0,0.03)] border border-gray-100 dark:border-gray-800">
        <Table columns={columns} data={data} onEdit={(r)=>console.log(r)} onDelete={(r)=>console.log(r)} />
      </div>
    </DashboardLayout>
  );
};

export const ManageStudents = () => {
  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { header: 'Branch', accessor: 'branch' },
    { header: 'Status', cell: (row) => (<span className={`px-2 py-1 rounded-full text-xs ${row.status === 'Active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700'}`}>{row.status}</span>) }
  ];
  const data = [{ name: 'Hardik Jethava', email: 'hardik@marwadi.edu', branch: 'MCA', status: 'Active' }];
  return <GenericManagePage title="Manage Students" description="View and control student access to the portal." columns={columns} data={data} />;
};

export const ManageQuestions = () => {
  const columns = [{ header: 'Question', accessor: 'q' }, { header: 'Category', accessor: 'cat' }, { header: 'Difficulty', accessor: 'diff' }];
  const data = [{ q: 'What is a closure?', cat: 'JavaScript', diff: 'Hard' }];
  return <GenericManagePage title="Manage Questions" description="Control Aptitude & Reasoning banks." columns={columns} data={data} />;
};

export const ManageCodingProblems = () => {
  const columns = [{ header: 'Title', accessor: 'title' }, { header: 'Difficulty', accessor: 'diff' }];
  const data = [{ title: 'Two Sum', diff: 'Easy' }];
  return <GenericManagePage title="Coding Problems" description="Algorithm challenges and test cases." columns={columns} data={data} />;
};

export const ManageTests = () => {
  const columns = [{ header: 'Test Name', accessor: 'name' }, { header: 'Duration', accessor: 'time' }, { header: 'Published', accessor: 'pub' }];
  const data = [{ name: 'TCS Ninja Mock', time: '90 mins', pub: 'Yes' }];
  return <GenericManagePage title="Manage Tests" description="Assemble questions into timed exams." columns={columns} data={data} />;
};

export const ManageCompanies = () => {
  const columns = [{ header: 'Company', accessor: 'name' }, { header: 'Resources', accessor: 'res' }];
  const data = [{ name: 'Google', res: '12 Docs' }];
  return <GenericManagePage title="Target Companies" description="Manage company specific prep materials." columns={columns} data={data} />;
};

export const Reports = () => {
  return (
    <DashboardLayout>
       <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">System Reports</h1>
        <p className="text-sm text-gray-500 mt-1">Export analytics and placement correlations.</p>
      </div>
      <div className="h-64 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
        <span className="text-gray-500 font-medium">Reporting Module API Hook Placeholder</span>
      </div>
    </DashboardLayout>
  );
}
