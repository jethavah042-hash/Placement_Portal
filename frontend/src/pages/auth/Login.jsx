import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SplitAuthLayout from '../../components/layout/SplitAuthLayout';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { loginRequest, googleLoginUrl, githubLoginUrl } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { refreshUser, setUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '', role: 'student' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      return setError('Please enter a valid email address');
    }
    if (!formData.password) return setError('Password is required');

    setIsLoading(true);
    try {
      const { data } = await loginRequest({
        email: formData.email,
        password: formData.password,
        role: formData.role,
        rememberMe,
      });

      if (data.twoFactorRequired) {
        navigate('/verify-otp', { state: { userId: data.userId, rememberMe: data.rememberMe } });
        return;
      }

      if (setUser) setUser(data.user);
      await refreshUser();
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials or connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SplitAuthLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Sign In</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Access your placement preparation workspace.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs p-3">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role Selector Tabs */}
        <div>
          <label className="input-label text-xs">Account Role</label>
          <div className="tab-list">
            {[
              { role: 'student', label: 'Student' },
              { role: 'admin', label: 'Administrator' }
            ].map(({ role, label }) => (
              <button
                type="button"
                key={role}
                onClick={() => setFormData({ ...formData, role })}
                className={`flex-1 text-center py-2 text-xs font-semibold rounded-md transition-colors ${
                  formData.role === role ? 'tab-item-active' : 'tab-item'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="input-label text-xs">Email Address</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FiMail className="w-4 h-4" />
            </div>
            <input
              type="email"
              className="input pl-9 text-xs"
              placeholder="e.g. name@university.edu"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              autoComplete="email"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="input-label text-xs">Password</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FiLock className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              className="input pl-9 pr-9 text-xs"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              tabIndex={-1}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-700 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-gray-900"
            />
            <span className="text-xs text-gray-600 dark:text-gray-400 select-none">
              Remember me
            </span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-2.5 text-xs font-semibold mt-2"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Authenticating...</span>
            </div>
          ) : (
            'Sign In to Dashboard'
          )}
        </button>
      </form>

      {/* Social Login Options */}
      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-800" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white dark:bg-gray-900 text-gray-400 uppercase tracking-wider font-semibold text-[10px]">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <a
            href={googleLoginUrl}
            className="btn-secondary text-xs py-2 justify-center"
          >
            <FcGoogle className="w-4 h-4" />
            <span>Google</span>
          </a>
          <a
            href={githubLoginUrl}
            className="btn-secondary text-xs py-2 justify-center"
          >
            <FaGithub className="w-4 h-4 text-gray-900 dark:text-white" />
            <span>GitHub</span>
          </a>
        </div>
      </div>

      {/* Sign Up Link */}
      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        New candidate?{' '}
        <Link
          to="/register"
          className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
        >
          Create an Account
        </Link>
      </p>
    </SplitAuthLayout>
  );
};

export default Login;
