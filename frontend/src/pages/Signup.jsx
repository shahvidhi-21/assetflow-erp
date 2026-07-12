import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    const result = await signup(name, email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-tr from-primary-950 via-gray-900 to-indigo-950 p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-black/40 p-8 shadow-2xl backdrop-blur-xl">
        
        {/* Logo Header */}
        <div className="flex flex-col items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-primary-600 to-indigo-500 text-white shadow-xl shadow-primary-500/20">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-extrabold text-white tracking-tight">
            Create Account
          </h1>
          <p className="mt-1 text-sm text-gray-400">Join AssetFlow Resource Portal</p>
        </div>

        {error && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Register Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">Full Name</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <User className="h-5 w-5" />
              </span>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-primary-500 focus:bg-white/10 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <Mail className="h-5 w-5" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@company.com"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-primary-500 focus:bg-white/10 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider block mb-2">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-500">
                <Lock className="h-5 w-5" />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="•••••••• (Min. 6 chars)"
                className="w-full rounded-2xl border border-white/10 bg-white/5 py-3.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 outline-none transition-all duration-200 focus:border-primary-500 focus:bg-white/10 focus:ring-1 focus:ring-primary-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 py-4 text-sm font-semibold text-white shadow-xl shadow-primary-500/20 hover:from-primary-500 hover:to-indigo-500 transition-all duration-200 disabled:opacity-50 transform active:scale-98 cursor-pointer"
          >
            {loading ? 'Registering...' : 'Register'}
            {!loading && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-primary-400 hover:text-primary-300 transition-colors">
            Log In Here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
