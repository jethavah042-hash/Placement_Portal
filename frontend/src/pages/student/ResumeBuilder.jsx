import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import PageHeader from '../../components/ui/PageHeader';
import { FiDownload, FiSave, FiEye, FiLayout, FiEdit, FiCheck } from 'react-icons/fi';

const ResumeBuilder = () => {
  const [activeTab, setActiveTab] = useState('form');
  const [template, setTemplate] = useState('modern');
  
  const [formData, setFormData] = useState({
    name: 'Hardik Jethava',
    email: 'hardik@example.com',
    phone: '+91 9876543210',
    linkedin: 'linkedin.com/in/hardik',
    objective: 'Aspiring Software Engineer with a passion for scalable systems and full-stack development. Eager to contribute to innovative enterprise engineering teams.',
    education: 'Master of Computer Applications (MCA), Marwadi University (2024-2026)\nBachelor of Science (IT), Gujarat University (2021-2024)',
    experience: 'Software Engineering Intern @ TechCorp (May 2024 - Aug 2024)\n- Designed RESTful services with Express and MongoDB for 10k daily users\n- Improved frontend performance by 25% via chunk splitting and memory leak fixes',
    skills: 'JavaScript (ES6+), React.js, Node.js, Express, MongoDB, Tailwind CSS, Python, Git & GitHub, Docker',
    projects: 'AI-Powered Placement Preparation Portal (MERN Stack)\n- Built comprehensive diagnostic assessment modules and real-time ATS resume keyword analysis.'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    alert("Resume saved successfully to your candidate profile!");
  };

  return (
    <DashboardLayout>
      <div className="print:hidden">
        <PageHeader
          title="ATS Resume Builder"
          subtitle="Craft a high-impact, ATS-compliant technical resume tailored for university recruitment drives."
          actions={
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                className="btn-secondary text-xs py-2 inline-flex items-center gap-1.5"
              >
                <FiSave className="w-3.5 h-3.5" />
                <span>Save Profile</span>
              </button>
              <button
                onClick={handlePrint}
                className="btn-primary text-xs py-2 inline-flex items-center gap-1.5"
              >
                <FiDownload className="w-3.5 h-3.5" />
                <span>Print / PDF Export</span>
              </button>
            </div>
          }
        />

        {/* Tab Selector */}
        <div className="card p-2 mb-6 max-w-sm">
          <div className="tab-list">
            <button
              onClick={() => setActiveTab('form')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'form' ? 'tab-item-active' : 'tab-item'
              }`}
            >
              <FiEdit className="w-3.5 h-3.5" />
              <span>Editor</span>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'templates' ? 'tab-item-active' : 'tab-item'
              }`}
            >
              <FiLayout className="w-3.5 h-3.5" />
              <span>Template</span>
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === 'preview' ? 'tab-item-active' : 'tab-item'
              }`}
            >
              <FiEye className="w-3.5 h-3.5" />
              <span>Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Editor & Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form / Template Panel */}
        <div className={`lg:col-span-5 space-y-6 print:hidden ${activeTab === 'preview' ? 'hidden lg:block' : 'block'}`}>
          {activeTab === 'form' && (
            <div className="card p-5 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="input-label text-xs">Full Name</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} className="input text-xs" />
                  </div>
                  <div>
                    <label className="input-label text-xs">Email Address</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} className="input text-xs" />
                  </div>
                  <div>
                    <label className="input-label text-xs">Contact Phone</label>
                    <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="input text-xs" />
                  </div>
                  <div>
                    <label className="input-label text-xs">LinkedIn / Portfolio</label>
                    <input type="text" name="linkedin" value={formData.linkedin} onChange={handleChange} className="input text-xs" />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                  Career Objective
                </h3>
                <textarea name="objective" rows="2" value={formData.objective} onChange={handleChange} className="input text-xs mt-3"></textarea>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                  Education
                </h3>
                <textarea name="education" rows="2" value={formData.education} onChange={handleChange} className="input text-xs mt-3"></textarea>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                  Internships & Work Experience
                </h3>
                <textarea name="experience" rows="3" value={formData.experience} onChange={handleChange} className="input text-xs mt-3"></textarea>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-800 pb-2">
                  Technical Skills & Projects
                </h3>
                <textarea name="skills" rows="2" value={formData.skills} onChange={handleChange} className="input text-xs mt-3" placeholder="Skills (comma separated)"></textarea>
                <textarea name="projects" rows="3" value={formData.projects} onChange={handleChange} className="input text-xs mt-2" placeholder="Projects description"></textarea>
              </div>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="card p-5 space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Choose Layout Format</h3>
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setTemplate('modern')}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    template === 'modern' ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20' : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs font-semibold text-gray-900 dark:text-white">Modern Tech</strong>
                    {template === 'modern' && <FiCheck className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-gray-500">Left colored accent header with modern typography.</p>
                </div>

                <div
                  onClick={() => setTemplate('classic')}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    template === 'classic' ? 'border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20' : 'border-gray-200 dark:border-gray-800 hover:border-indigo-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <strong className="text-xs font-semibold text-gray-900 dark:text-white">Classic ATS</strong>
                    {template === 'classic' && <FiCheck className="w-3.5 h-3.5 text-indigo-600" />}
                  </div>
                  <p className="text-[11px] text-gray-500">Clean single-column monochrome design optimized for parser bots.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Preview Panel */}
        <div className={`lg:col-span-7 ${activeTab === 'form' || activeTab === 'templates' ? 'hidden lg:block' : 'block'}`}>
          <div className="card p-8 bg-white text-gray-900 border border-gray-200 shadow-sm print:border-none print:shadow-none print:p-0 min-h-[700px] text-xs leading-relaxed font-sans">
            
            {/* Header */}
            <div className={`pb-4 mb-4 border-b ${template === 'modern' ? 'border-indigo-600' : 'border-gray-300'}`}>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{formData.name}</h1>
              <div className="flex flex-wrap items-center gap-3 text-gray-600 text-[11px] mt-1">
                <span>{formData.email}</span>
                <span>•</span>
                <span>{formData.phone}</span>
                <span>•</span>
                <span>{formData.linkedin}</span>
              </div>
            </div>

            {/* Objective */}
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1 border-b border-gray-100 pb-0.5">
                Professional Summary
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{formData.objective}</p>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1 border-b border-gray-100 pb-0.5">
                Technical Skills
              </h2>
              <p className="text-gray-700">{formData.skills}</p>
            </div>

            {/* Experience */}
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1 border-b border-gray-100 pb-0.5">
                Experience & Internships
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{formData.experience}</p>
            </div>

            {/* Projects */}
            <div className="mb-4">
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1 border-b border-gray-100 pb-0.5">
                Key Technical Projects
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{formData.projects}</p>
            </div>

            {/* Education */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1 border-b border-gray-100 pb-0.5">
                Education
              </h2>
              <p className="text-gray-700 whitespace-pre-line">{formData.education}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ResumeBuilder;
