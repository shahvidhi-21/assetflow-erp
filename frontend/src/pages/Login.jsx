import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Archive, LineChart, ArrowLeftRight, Check, X, ShieldAlert } from 'lucide-react';
import Input from '../components/Input';
import FloatingCard from '../components/FloatingCard';
import { useAuth } from '../context/AuthContext';
import dashboardHero from '../assets/dashboard_hero.png';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Modals state
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [modalEmail, setModalEmail] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setNotification(null);

    const res = await login(email.trim().toLowerCase(), password);
    setIsLoading(false);

    if (res.success) {
      setNotification({
        type: 'success',
        message: `Welcome back! Redirecting...`,
      });

      setTimeout(() => {
        navigate('/');
      }, 1000);
    } else {
      setNotification({
        type: 'error',
        message: res.message || 'Invalid email or password.',
      });
    }
  };

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!modalEmail || !/\S+@\S+\.\S+/.test(modalEmail)) {
      alert('Please enter a valid email address');
      return;
    }
    alert(`Reset link sent to ${modalEmail}`);
    setShowForgotModal(false);
    setModalEmail('');
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white selection:bg-blue-600 selection:text-white text-left">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 animate-bounce">
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl shadow-2xl border text-sm font-semibold max-w-md ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {notification.type === 'success' ? (
              <Check className="text-emerald-500 shrink-0" size={20} />
            ) : (
              <ShieldAlert className="text-rose-500 shrink-0" size={20} />
            )}
            <p className="flex-1">{notification.message}</p>
            <button
              onClick={() => setNotification(null)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Left Panel: Form */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 xl:p-16 min-h-screen">
        {/* Top Header Logo */}
        <div className="flex items-center gap-2 mb-12 lg:mb-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30 overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-indigo-500" />
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="relative z-10"
              >
                <path
                  d="M12 2L2 22H7L12 12L17 22H22L12 2Z"
                  fill="white"
                  stroke="white"
                  strokeWidth="1"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 12L9 18H15L12 12Z"
                  fill="#10b981"
                />
              </svg>
            </div>
            <div className="flex flex-col text-left">
              <h1 className="text-2xl font-extrabold text-blue-600 leading-none tracking-tight">
                AssetFlow
              </h1>
              <p className="text-[8px] font-bold text-emerald-500 tracking-widest mt-1 uppercase">
                Enterprise Asset & Resource Management System
              </p>
            </div>
          </div>
        </div>

        {/* Center Login Form */}
        <div className="my-auto max-w-md w-full mx-auto flex flex-col gap-8">
          <div className="flex flex-col gap-3 text-left">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
              Welcome Back
            </h2>
            <p className="text-sm font-medium text-gray-500 leading-relaxed">
              Sign in to continue managing your organization's assets and resources securely.
            </p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <Input
              label="Email Address"
              id="email"
              type="email"
              icon={Mail}
              placeholder="john.doe@enterprise.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              error={errors.email}
              required
            />

            <Input
              label="Password"
              id="password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              error={errors.password}
              required
            />

            <div className="flex items-center justify-between text-sm mt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none group text-gray-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <span className="w-5 h-5 border border-gray-300 rounded-lg flex items-center justify-center peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-all duration-200 group-hover:border-gray-400">
                  <Check className="text-white hidden peer-checked:block" size={14} strokeWidth={3} />
                </span>
                Remember Me
              </label>

              <button
                type="button"
                onClick={() => setShowForgotModal(true)}
                className="text-blue-600 hover:text-blue-700 transition-colors font-bold"
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all duration-200 group text-sm cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Log in</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick instructions for demo */}
          <div className="p-4 bg-blue-50 dark:bg-gray-900 border border-blue-100 dark:border-gray-800 rounded-2xl text-[11px] text-gray-500 font-medium leading-relaxed">
            <span className="font-bold text-blue-600 dark:text-blue-400">Quick Demo Accounts:</span>
            <ul className="list-disc list-inside mt-1 flex flex-col gap-0.5 font-mono">
              <li>Admin: admin@assetflow.com / admin123</li>
              <li>Manager: bob@enterprise.com / bob123</li>
              <li>Dept Head: clara@enterprise.com / clara123</li>
              <li>Employee: john@enterprise.com / john123</li>
            </ul>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col gap-3 text-left mt-12 lg:mt-0 text-sm">
          <p className="text-gray-500 font-semibold">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 hover:text-blue-700 transition-colors font-bold"
            >
              Create Account
            </button>
          </p>
          <p className="text-xs text-gray-400 font-medium">© 2026 AssetFlow ERP</p>
        </div>
      </div>

      {/* Right Panel: Hero / Showcase */}
      <div className="lg:col-span-7 hidden lg:flex flex-col justify-between p-12 xl:p-16 hero-radial-bg relative overflow-hidden">
        {/* Dynamic Abstract Background Grid decoration */}
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: `radial-gradient(#1e52db 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px'
        }} />

        {/* Top Spacer to push content down */}
        <div className="h-4" />

        {/* Center Showcase Artwork Container */}
        <div className="relative max-w-[600px] w-full mx-auto my-auto flex items-center justify-center">
          {/* Central ERP software solutions background text */}
          <div className="absolute top-0 text-[36px] font-black text-blue-900/5 select-none pointer-events-none tracking-widest uppercase">
            ERP Software Solutions
          </div>

          {/* Main Dashboard Hero Illustration */}
          <div className="w-full relative z-10 p-6 bg-white/40 backdrop-blur-md rounded-[32px] border border-white/50 shadow-2xl">
            <img
              src={dashboardHero}
              alt="AssetFlow ERP System Showcase"
              className="w-full h-auto object-cover rounded-2xl shadow-lg border border-gray-150"
            />
          </div>

          {/* Floating Card 1: Track Assets (Top Left) */}
          <FloatingCard
            icon={Archive}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
            title="Track Assets"
            description="Monitor every asset across departments."
            className="absolute -top-6 -left-6 z-20"
            animationClass="animate-float-1"
          />

          {/* Floating Card 2: Analytics (Middle Right) */}
          <FloatingCard
            icon={LineChart}
            iconColor="text-indigo-600"
            iconBg="bg-indigo-50"
            title="Analytics"
            description="Real-time operational insights."
            className="absolute top-[35%] -right-8 z-20"
            animationClass="animate-float-2"
          />

          {/* Floating Card 3: Smart Allocation (Bottom Left-ish) */}
          <FloatingCard
            icon={ArrowLeftRight}
            iconColor="text-emerald-600"
            iconBg="bg-emerald-50"
            title="Smart Allocation"
            description="Allocate resources without conflicts."
            className="absolute -bottom-6 left-[15%] z-20"
            animationClass="animate-float-3"
          />
        </div>

        {/* Bottom Statistics Panel */}
        <div className="flex items-center gap-12 relative z-10 text-left pl-6">
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-blue-600 tracking-tight">12k+</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
              Assets Tracked
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-emerald-500 tracking-tight">99.9%</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">
              Uptime SLA
            </span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-150 flex flex-col gap-6 text-left animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Reset Password</h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-full text-gray-400 hover:bg-gray-105 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-sm text-gray-500">
              Enter your email address and we'll send you a link to reset your password.
            </p>
            <form onSubmit={handleForgotSubmit} className="flex flex-col gap-4">
              <Input
                label="Email Address"
                id="modal-email"
                type="email"
                icon={Mail}
                placeholder="john.doe@enterprise.com"
                value={modalEmail}
                onChange={(e) => setModalEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all cursor-pointer text-center text-sm"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
