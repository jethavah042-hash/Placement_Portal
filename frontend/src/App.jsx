import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import OtpVerify from './pages/auth/OtpVerify';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import OAuthSuccess from './pages/auth/OAuthSuccess';
import Unauthorized from './pages/auth/Unauthorized';

import Dashboard from './pages/student/Dashboard';
import ProgrammingLanguages from './pages/student/ProgrammingLanguages';
import LanguagePractice from './pages/student/LanguagePractice';
import Aptitude from './pages/student/Aptitude';
import AptitudeTopic from './pages/student/AptitudeTopic';
import Reasoning from './pages/student/Reasoning';
import ReasoningTopic from './pages/student/ReasoningTopic';
import English from './pages/student/English';
import EnglishTopic from './pages/student/EnglishTopic';
import CodingPractice from './pages/student/CodingPractice';
import CodingTopic from './pages/student/CodingTopic';
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageStudents from './pages/admin/ManageStudents';
import StudentDetails from './pages/admin/StudentDetails';
import ManageCoding from './pages/admin/ManageCoding';
import ManageQuestions from './pages/admin/ManageQuestions';
import ManageCompanies from './pages/admin/ManageCompanies';
import ManageMockTests from './pages/admin/ManageMockTests';
import ManageResults from './pages/admin/ManageResults';
import ManageResumeScanner from './pages/admin/ManageResumeScanner';
import ManageNotifications from './pages/admin/ManageNotifications';
import ManageAnnouncements from './pages/admin/ManageAnnouncements';
import AdminReports from './pages/admin/AdminReports';
import AdminActivityLogs from './pages/admin/AdminActivityLogs';
import AdminSettings from './pages/admin/AdminSettings';

import AptitudeNotes from './pages/student/aptitude/AptitudeNotes';
import AptitudeMCQs from './pages/student/aptitude/AptitudeMCQs';
import AptitudeQuiz from './pages/student/aptitude/AptitudeQuiz';
import AptitudeMockTest from './pages/student/aptitude/AptitudeMockTest';
import AptitudeResults from './pages/student/aptitude/AptitudeResults';

import ReasoningNotes from './pages/student/reasoning/ReasoningNotes';
import ReasoningMCQs from './pages/student/reasoning/ReasoningMCQs';
import ReasoningQuiz from './pages/student/reasoning/ReasoningQuiz';
import ReasoningMockTest from './pages/student/reasoning/ReasoningMockTest';
import ReasoningResults from './pages/student/reasoning/ReasoningResults';
import ReasoningBookmarks from './pages/student/reasoning/ReasoningBookmarks';
import AdminReasoning from './pages/admin/AdminReasoning';

import EnglishNotes from './pages/student/english/EnglishNotes';
import EnglishMCQs from './pages/student/english/EnglishMCQs';
import EnglishQuiz from './pages/student/english/EnglishQuiz';
import EnglishMockTest from './pages/student/english/EnglishMockTest';
import EnglishResults from './pages/student/english/EnglishResults';
import EnglishVocabulary from './pages/student/english/EnglishVocabulary';
import EnglishReadingComprehension from './pages/student/english/EnglishReadingComprehension';
import EnglishBookmarks from './pages/student/english/EnglishBookmarks';
import AdminEnglish from './pages/admin/AdminEnglish';

import CodingNotes from './pages/student/coding/CodingNotes';
import CodingInterview from './pages/student/coding/CodingInterview';
import CodingChallenges from './pages/student/coding/CodingChallenges';
import CodingResults from './pages/student/coding/CodingResults';

import MockTests from './pages/student/MockTests';
import TestArena from './pages/student/tests/TestArena';
import Leaderboard from './pages/student/tests/Leaderboard';

import CompanyPrep from './pages/student/CompanyPrep';
import CompanyTopic from './pages/student/CompanyTopic';
import CompanyProcess from './pages/student/companies/CompanyProcess';
import CompanyPreviousQs from './pages/student/companies/CompanyPreviousQs';
import CompanyHR from './pages/student/companies/CompanyHR';
import CompanyCoding from './pages/student/companies/CompanyCoding';
import CompanyExperience from './pages/student/companies/CompanyExperience';

import ResumeScanner from './pages/student/ResumeScanner';
import Analytics from './pages/student/Analytics';
import Bookmarks from './pages/student/Bookmarks';
import Notifications from './pages/student/Notifications';
import Profile from './pages/student/Profile';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-otp" element={<OtpVerify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/oauth-success" element={<OAuthSuccess />} />

            {/* Protected Student Routes */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="/student/dashboard" element={<Dashboard />} />
              <Route path="/student/profile" element={<Profile />} />
              <Route path="/student/analytics" element={<Analytics />} />
              <Route path="/student/resume-scanner" element={<ResumeScanner />} />
              <Route path="/student/resume-scanner/:scanId" element={<ResumeScanner />} />
              <Route path="/student/resume-scanner/history" element={<ResumeScanner />} />
              <Route path="/student/resume-builder" element={<Navigate to="/student/resume-scanner" replace />} />
              <Route path="/student/resume" element={<Navigate to="/student/resume-scanner" replace />} />
              <Route path="/student/bookmarks" element={<Bookmarks />} />
              <Route path="/student/notifications" element={<Notifications />} />
              <Route path="/student/mock-tests" element={<MockTests />} />
              <Route path="/student/mock-tests/:testId/arena" element={<TestArena />} />
              <Route path="/student/mock-tests/:testId/leaderboard" element={<Leaderboard />} />
              <Route path="/student/company-prep" element={<CompanyPrep />} />
              <Route path="/student/company-prep/:companyId" element={<CompanyTopic />} />
              <Route path="/student/company-prep/:companyId/process" element={<CompanyProcess />} />
              <Route path="/student/company-prep/:companyId/previous-questions" element={<CompanyPreviousQs />} />
              <Route path="/student/company-prep/:companyId/hr-questions" element={<CompanyHR />} />
              <Route path="/student/company-prep/:companyId/coding-questions" element={<CompanyCoding />} />
              <Route path="/student/company-prep/:companyId/interview-experience" element={<CompanyExperience />} />
              <Route path="/student/languages" element={<ProgrammingLanguages />} />
              <Route path="/student/languages/:langId" element={<LanguagePractice />} />
              <Route path="/student/coding" element={<CodingPractice />} />
              <Route path="/student/coding/interview" element={<CodingInterview />} />
              <Route path="/student/coding/problems" element={<CodingChallenges />} />
              <Route path="/student/coding/results" element={<CodingResults />} />
              <Route path="/student/coding/:topicId" element={<CodingTopic />} />
              <Route path="/student/coding/:topicId/notes" element={<CodingNotes />} />
              <Route path="/student/coding/:topicId/interview" element={<CodingInterview />} />
              <Route path="/student/coding/:topicId/challenges" element={<CodingChallenges />} />
              <Route path="/student/coding/:topicId/results" element={<CodingResults />} />
              <Route path="/student/aptitude" element={<Aptitude />} />
              <Route path="/student/aptitude/:topicId" element={<AptitudeTopic />} />
              <Route path="/student/aptitude/:topicId/notes" element={<AptitudeNotes />} />
              <Route path="/student/aptitude/:topicId/mcqs" element={<AptitudeMCQs />} />
              <Route path="/student/aptitude/:topicId/quiz" element={<AptitudeQuiz />} />
              <Route path="/student/aptitude/:topicId/mock-test" element={<AptitudeMockTest />} />
              <Route path="/student/aptitude/:topicId/results" element={<AptitudeResults />} />
              <Route path="/student/reasoning" element={<Reasoning />} />
              <Route path="/student/reasoning/practice" element={<ReasoningMCQs />} />
              <Route path="/student/reasoning/quiz" element={<ReasoningQuiz />} />
              <Route path="/student/reasoning/bookmarks" element={<ReasoningBookmarks />} />
              <Route path="/student/reasoning/results" element={<ReasoningResults />} />
              <Route path="/student/reasoning/:topicId" element={<ReasoningTopic />} />
              <Route path="/student/reasoning/:topicId/notes" element={<ReasoningNotes />} />
              <Route path="/student/reasoning/:topicId/mcqs" element={<ReasoningMCQs />} />
              <Route path="/student/reasoning/:topicId/quiz" element={<ReasoningQuiz />} />
              <Route path="/student/reasoning/:topicId/mock-test" element={<ReasoningMockTest />} />
              <Route path="/student/reasoning/:topicId/results" element={<ReasoningResults />} />
              <Route path="/student/english" element={<English />} />
              <Route path="/student/english/vocabulary" element={<EnglishVocabulary />} />
              <Route path="/student/english/reading-comprehension" element={<EnglishReadingComprehension />} />
              <Route path="/student/english/reading-comprehension/:passageId" element={<EnglishReadingComprehension />} />
              <Route path="/student/english/practice" element={<EnglishMCQs />} />
              <Route path="/student/english/quiz" element={<EnglishQuiz />} />
              <Route path="/student/english/bookmarks" element={<EnglishBookmarks />} />
              <Route path="/student/english/results" element={<EnglishResults />} />
              <Route path="/student/english/:topicId" element={<EnglishTopic />} />
              <Route path="/student/english/:topicId/notes" element={<EnglishNotes />} />
              <Route path="/student/english/:topicId/mcqs" element={<EnglishMCQs />} />
              <Route path="/student/english/:topicId/quiz" element={<EnglishQuiz />} />
              <Route path="/student/english/:topicId/mock-test" element={<EnglishMockTest />} />
              <Route path="/student/english/:topicId/results" element={<EnglishResults />} />
              <Route path="/english" element={<Navigate to="/student/english" replace />} />
              <Route path="/english/*" element={<Navigate to="/student/english" replace />} />
              <Route path="/student/*" element={<Navigate to="/student/dashboard" />} />
            </Route>

            {/* Protected Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/announcements" element={<ManageAnnouncements />} />
              <Route path="/admin/students" element={<ManageStudents />} />
              <Route path="/admin/students/:id" element={<StudentDetails />} />
              <Route path="/admin/coding" element={<ManageCoding />} />
              <Route path="/admin/aptitude" element={<ManageQuestions initialModule="Aptitude" />} />
              <Route path="/admin/reasoning" element={<AdminReasoning />} />
              <Route path="/admin/reasoning/*" element={<AdminReasoning />} />
              <Route path="/admin/english" element={<AdminEnglish />} />
              <Route path="/admin/english/*" element={<AdminEnglish />} />
              <Route path="/admin/companies" element={<ManageCompanies />} />
              <Route path="/admin/mock-tests" element={<ManageMockTests />} />
              <Route path="/admin/results" element={<ManageResults />} />
              <Route path="/admin/resume-scanner" element={<ManageResumeScanner />} />
              <Route path="/admin/notifications" element={<ManageNotifications />} />
              <Route path="/admin/reports" element={<AdminReports />} />
              <Route path="/admin/activity-logs" element={<AdminActivityLogs />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/*" element={<Navigate to="/admin/dashboard" />} />
            </Route>

            {/* Unauthorized */}
            <Route path="/unauthorized" element={<Unauthorized />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
