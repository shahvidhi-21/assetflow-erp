import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, User } from 'lucide-react';
import Input from '../components/Input';
import FloatingCard from '../components/FloatingCard';
import dashboardHero from '../assets/dashboard_hero.png';
import { Archive, LineChart, ArrowLeftRight } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!name) newErrors.name = 'Full name is required';
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

    if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert('Signup Successful! Your account has been registered as an Employee. Redirecting to Login...');
      navigate('/login');
    }, 1500);
  };

  return (
    <div className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white selection:bg-blue-600 selection:text-white text-left">
      {/* Left Side Panel */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 sm:p-12 xl:p-16 min-h-screen">
        {/* Top Header Logo */}
        <div className="flex items-center gap-2 mb-12 lg:mb-0">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 flex items-center justify-center bg-blue-600 rounded-xl shadow-lg shadow-blue-600/30 overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-700 to-indigo-500" />
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10">
                <path d="M12 2L2 22H7L12 12L17 22H22L12 2Z" fill="white" stroke="white" strokeWidth="1" strokeLinejoin="round" />
                <path d="M12 12L9 18H15L12 12Z" fill="#10b981" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-extrabold text-blue-600 leading-none tracking-tight">AssetFlow</h1>
              <p className="text-[8px] font-bold text-emerald-500 tracking-widest mt-1 uppercase">Enterprise Asset & Resource Management System</p>
            </div>
          </div>
        </div>

        {/* Center Signup Form */}
        <div className="my-auto max-w-md w-full mx-auto flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">Create Account</h2>
            <p className="text-sm font-medium text-gray-500">Sign up as an Employee. Complete profile details for Admin audit review.</p>
          </div>

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              id="name"
              type="text"
              icon={User}
              placeholder="e.g. John Doe"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors({ ...errors, name: '' });
              }}
              error={errors.name}
              required
            />

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

            <Input
              label="Confirm Password"
              id="confirm-password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
              }}
              error={errors.confirmPassword}
              required
            />

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] disabled:opacity-75 disabled:pointer-events-none text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 transition-all duration-200 group text-sm cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign Up</span>
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col gap-3 text-sm mt-12 lg:mt-0">
          <p className="text-gray-500 font-semibold">
            Already have an account?{' '}
            <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-700 transition-colors font-bold">
              Sign In
            </button>
          </p>
          <p className="text-xs text-gray-400 font-medium">© 2026 AssetFlow ERP</p>
        </div>
      </div>

      {/* Right Side Panel */}
      <div className="lg:col-span-7 hidden lg:flex flex-col justify-between p-12 xl:p-16 hero-radial-bg relative overflow-hidden text-left">
        <div className="absolute inset-0 opacity-15 pointer-events-none" style={{
          backgroundImage: `radial-gradient(#1e52db 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px'
        }} />
        <div className="h-4" />

        <div className="relative max-w-[600px] w-full mx-auto my-auto flex items-center justify-center">
          <div className="absolute top-0 text-[36px] font-black text-blue-900/5 select-none pointer-events-none tracking-widest uppercase">
            ERP Software Solutions
          </div>

          <div className="w-full relative z-10 p-6 bg-white/40 backdrop-blur-md rounded-[32px] border border-white/50 shadow-2xl">
            <img src={dashboardHero} alt="Showcase" className="w-full h-auto object-cover rounded-2xl shadow-lg border border-gray-100" />
          </div>

          <FloatingCard
            icon={Archive} iconColor="text-blue-600" iconBg="bg-blue-50"
            title="Track Assets" description="Monitor every asset across departments."
            className="absolute -top-6 -left-6 z-20" animationClass="animate-float-1"
          />

          <FloatingCard
            icon={LineChart} iconColor="text-indigo-600" iconBg="bg-indigo-50"
            title="Analytics" description="Real-time operational insights."
            className="absolute top-[35%] -right-8 z-20" animationClass="animate-float-2"
          />

          <FloatingCard
            icon={ArrowLeftRight} iconColor="text-emerald-600" iconBg="bg-emerald-50"
            title="Smart Allocation" description="Allocate resources without conflicts."
            className="absolute -bottom-6 left-[15%] z-20" animationClass="animate-float-3"
          />
        </div>

        <div className="flex items-center gap-12 relative z-10 pl-6">
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-blue-600 tracking-tight">12k+</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Assets Tracked</span>
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-emerald-500 tracking-tight">99.9%</span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Uptime SLA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
