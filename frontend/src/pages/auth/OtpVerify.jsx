import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import SplitAuthLayout from '../../components/layout/SplitAuthLayout';
import { verifyOtpRequest, resendOtpRequest } from '../../api/auth';
import { useAuth } from '../../context/AuthContext';
import { FiShield, FiArrowLeft, FiRefreshCw } from 'react-icons/fi';

const OtpVerify = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (!state?.userId) navigate('/login', { replace: true });
  }, [state, navigate]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^\d{6}$/.test(otp)) return setError('Please enter the complete 6-digit verification code');
    setLoading(true);
    try {
      const { data } = await verifyOtpRequest({ userId: state.userId, otp, rememberMe: state.rememberMe });
      await refreshUser();
      navigate(data.user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. The code may be incorrect or expired.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    try {
      await resendOtpRequest({ userId: state.userId });
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend OTP. Please wait and try again.');
    }
  };

  return (
    <SplitAuthLayout>
      <div className="mb-6 text-center">
        <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-3">
          <FiShield className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Two-Factor Verification</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Enter the 6-digit one-time passcode sent to your email.
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs p-3">
          {error}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <input
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="input text-center tracking-[0.5em] text-2xl font-bold font-mono py-3"
            placeholder="000000"
            inputMode="numeric"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="btn-primary w-full py-2.5 text-xs font-semibold"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Verifying Code...</span>
            </div>
          ) : (
            'Verify & Continue'
          )}
        </button>
      </form>

      <div className="mt-5 text-center space-y-3">
        <button
          onClick={handleResend}
          disabled={cooldown > 0}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline disabled:text-gray-400 dark:disabled:text-gray-600 inline-flex items-center gap-1.5"
        >
          <FiRefreshCw className={`w-3.5 h-3.5 ${cooldown > 0 ? 'animate-spin' : ''}`} />
          <span>{cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend verification code'}</span>
        </button>

        <div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FiArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sign In</span>
          </Link>
        </div>
      </div>
    </SplitAuthLayout>
  );
};

export default OtpVerify;
