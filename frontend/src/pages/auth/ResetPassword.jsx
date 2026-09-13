import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import SplitAuthLayout from '../../components/layout/SplitAuthLayout';
import { FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { resetPasswordRequest } from '../../api/auth';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get('token');
  const userId = params.get('uid');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,64}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!strongPw.test(password)) {
      return setError('Password must be 8+ characters with uppercase, lowercase, number and symbol');
    }
    if (password !== confirm) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    try {
      await resetPasswordRequest({ userId, token, password });
      navigate('/login', { state: { resetSuccess: true } });
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset link is invalid or has expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SplitAuthLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create New Password</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Choose a secure password for your student portal account.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs p-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <div>
          <label className="input-label text-xs">New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FiLock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input pl-9 pr-9 text-xs"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              tabIndex={-1}
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="input-label text-xs">Confirm New Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FiLock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="input pl-9 text-xs"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-2.5 text-xs font-semibold mt-2"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Updating Password...</span>
            </div>
          ) : (
            'Set New Password'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
        >
          Back to Sign In
        </Link>
      </p>
    </SplitAuthLayout>
  );
};

export default ResetPassword;
