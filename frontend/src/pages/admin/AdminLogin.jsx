import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginRequest } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiShield, FiAlertCircle, FiArrowRight, FiEye, FiEyeOff } from 'react-icons/fi';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { refreshUser, setUser } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Please provide both administrator email and password');
      return;
    }

    setLoading(true);
    try {
      const { data } = await loginRequest({
        email: formData.email.trim(),
        password: formData.password,
        role: 'admin',
        rememberMe: true
      });

      if (data.success) {
        if (setUser) setUser(data.user);
        await refreshUser();
        navigate('/admin/dashboard');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      if (!err.response) {
        setError('Server is not reachable. Please ensure backend is running on port 5000.');
      } else {
        setError(err.response?.data?.message || 'Invalid administrator credentials. Access restricted.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 font-sans">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-8 shadow-xl space-y-5 animate-fade-in">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-indigo-950/80 border border-indigo-800/80 text-indigo-400 flex items-center justify-center mx-auto shadow-sm">
            <FiShield className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Admin Console Login</h1>
          <p className="text-xs text-slate-400">
            Sign in with verified administrator credentials.
          </p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-rose-950/40 border border-rose-900/60 text-rose-300 text-xs flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Administrator Email</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <FiMail className="w-4 h-4" />
              </div>
              <input
                type="email"
                placeholder="admin@placementportal.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <FiLock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-9 pr-9 py-2 bg-slate-800/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                tabIndex={-1}
              >
                {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <>
                <span>Sign In to Console</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-3 border-t border-slate-800 text-xs text-slate-500">
          Student user?{' '}
          <Link to="/login" className="text-indigo-400 hover:underline font-semibold">
            Go to Student Portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
