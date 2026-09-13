import React from 'react';
import { Link } from 'react-router-dom';
import { FiCode, FiBook, FiCheckSquare, FiFileText, FiBriefcase, FiTrendingUp } from 'react-icons/fi';

const features = [
  { icon: FiCode, label: 'DSA & Coding Practice', desc: '120+ Placement problems & live execution' },
  { icon: FiBook, label: 'Aptitude & Verbal Mastery', desc: 'Curated quantitative, logic & grammar tracks' },
  { icon: FiCheckSquare, label: 'National Mock Exams', desc: 'Timed assessments with percentile ranking' },
  { icon: FiFileText, label: 'ATS Resume Optimizer', desc: 'Live scoring & industry keyword suggestions' },
  { icon: FiBriefcase, label: 'Company-Specific Drives', desc: 'Past interview questions from top recruiters' },
  { icon: FiTrendingUp, label: 'Readiness Analytics', desc: 'Real-time capability index & weak area tracking' },
];

const SplitAuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col lg:flex-row transition-colors font-sans">
      
      {/* Left Information Panel (Desktop Only) */}
      <div className="hidden lg:flex flex-col flex-1 bg-slate-900 text-white p-12 justify-between relative overflow-hidden border-r border-slate-800">
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#4F46E5_1px,transparent_1px)] [background-size:16px_16px]" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              P
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block leading-none">
                Placement<span className="text-indigo-400">Prep</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mt-1">
                Career Preparation Portal
              </span>
            </div>
          </Link>
        </div>

        {/* Center Pitch & Feature Matrix */}
        <div className="relative z-10 max-w-lg my-auto py-8">
          <span className="badge-primary mb-3">Academic & Placement Suite</span>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-3">
            Accelerate your campus placement readiness.
          </h1>
          <p className="text-sm text-slate-300 mb-8 leading-relaxed">
            A comprehensive, university-focused platform tailored to help students clear technical assessments, group discussions, and technical interviews.
          </p>

          <div className="grid grid-cols-2 gap-3.5">
            {features.map((feat) => (
              <div
                key={feat.label}
                className="p-3 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-start gap-2.5"
              >
                <div className="w-7 h-7 rounded-md bg-indigo-950/80 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                  <feat.icon className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">{feat.label}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 border-t border-slate-800 pt-4">
          <span>Official University Placement Partner</span>
          <span>Security Verified • 256-Bit TLS</span>
        </div>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8 sm:px-8 sm:py-12 lg:px-16 relative">
        <div className="mx-auto w-full max-w-md animate-fade-in">
          
          {/* Mobile Brand Header */}
          <div className="text-center mb-6 lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
                P
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Placement<span className="text-indigo-600 dark:text-indigo-400">Prep</span>
              </span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="card p-6 sm:p-8 shadow-sm">
            {children}
          </div>

          {/* Simple Footer */}
          <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-500 space-y-1">
            <p>© {new Date().getFullYear()} Placement Preparation Portal. All rights reserved.</p>
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default SplitAuthLayout;
