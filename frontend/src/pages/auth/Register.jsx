import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SplitAuthLayout from '../../components/layout/SplitAuthLayout';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { registerRequest, googleLoginUrl, githubLoginUrl } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const strongPw = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+=]).{8,64}$/;

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      newErrors.name = 'Full name is required (minimum 2 characters)';
    }
    if (!formData.email || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Valid email address is required';
    }
    if (!strongPw.test(formData.password)) {
      newErrors.password = 'Must be 8+ chars with uppercase, lowercase, number and symbol';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      await registerRequest({ name: formData.name, email: formData.email, password: formData.password });
      await refreshUser();
      navigate('/student/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || (!err.response ? 'Cannot reach the server.' : 'Registration failed');
      setErrors({ ...errors, email: message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SplitAuthLayout>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Create Account</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Begin your placement and career preparation journey.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3.5">
        {/* Name */}
        <div>
          <label className="input-label text-xs">Full Name</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <FiUser className="w-4 h-4" />
            </div>
            <input
              type="text"
              className={`input pl-9 text-xs ${errors.name ? 'border-rose-400 dark:border-rose-600' : ''}`}
              placeholder="e.g. Hardik Jethava"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
              }}
              required
            />
          </div>
          {errors.name && <p className="mt-1 text-[11px] text-rose-500">{errors.name}</p>}
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
              className={`input pl-9 text-xs ${errors.email ? 'border-rose-400 dark:border-rose-600' : ''}`}
              placeholder="name@university.edu"
              value={formData.email}
              onChange={(e) => {
                setFormData({ ...formData, email: e.target.value });
                if (errors.email) setErrors({ ...errors, email: null });
              }}
              required
            />
          </div>
          {errors.email && <p className="mt-1 text-[11px] text-rose-500">{errors.email}</p>}
        </div>

        {/* Password Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="input-label text-xs">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input pl-9 pr-8 text-xs ${errors.password ? 'border-rose-400 dark:border-rose-600' : ''}`}
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => {
                  setFormData({ ...formData, password: e.target.value });
                  if (errors.password) setErrors({ ...errors, password: null });
                }}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff className="w-3.5 h-3.5" /> : <FiEye className="w-3.5 h-3.5" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-[10px] text-rose-500 leading-tight">{errors.password}</p>}
          </div>

          <div>
            <label className="input-label text-xs">Confirm Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                className={`input pl-9 text-xs ${errors.confirmPassword ? 'border-rose-400 dark:border-rose-600' : ''}`}
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => {
                  setFormData({ ...formData, confirmPassword: e.target.value });
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
                }}
                required
              />
            </div>
            {errors.confirmPassword && <p className="mt-1 text-[10px] text-rose-500 leading-tight">{errors.confirmPassword}</p>}
          </div>
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
              <span>Creating Account...</span>
            </div>
          ) : (
            'Create Student Account'
          )}
        </button>
      </form>

      {/* Social Login */}
      <div className="mt-5">
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

        <div className="mt-3.5 grid grid-cols-2 gap-3">
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

      {/* Sign In Link */}
      <p className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
        Already registered?{' '}
        <Link
          to="/login"
          className="font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 hover:underline"
        >
          Sign In
        </Link>
      </p>
    </SplitAuthLayout>
  );
};

export default Register;
