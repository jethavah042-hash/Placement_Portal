import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SplitAuthLayout from '../../components/layout/SplitAuthLayout';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import { forgotPasswordRequest } from '../../api/auth';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await forgotPasswordRequest({ email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitAuthLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recover Password</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          We will send a secure password reset link to your verified email.
        </p>
      </div>

      {sent ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <FiCheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Check Your Inbox</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
              If an account is associated with <span className="font-semibold text-gray-900 dark:text-white">{email}</span>, we have sent instructions to reset your password.
            </p>
          </div>
          <Link
            to="/login"
            className="btn-primary w-full py-2.5 text-xs font-semibold inline-flex items-center justify-center gap-2"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sign In</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs p-3">
              {error}
            </div>
          )}

          <div>
            <label className="input-label text-xs">Email Address</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiMail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="input pl-9 text-xs"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-2.5 text-xs font-semibold"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Sending Reset Link...</span>
              </div>
            ) : (
              'Send Password Reset Link'
            )}
          </button>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400 pt-2">
            Remember your password?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
            >
              Sign In
            </Link>
          </p>
        </form>
      )}
    </SplitAuthLayout>
  );
};

export default ForgotPassword;
