import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PasswordField from '../components/auth/PasswordField';
import PrimaryButton from '../components/auth/PrimaryButton';
import SocialButton from '../components/auth/SocialButton';
import Divider from '../components/auth/Divider';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    
    // Client-side quick validations
    const tempErrors = {};
    if (!email) {
      tempErrors.email = 'Email address is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address.';
    }
    
    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
    }

    if (Object.keys(tempErrors).length > 0) {
      setErrors(tempErrors);
      return;
    }

    setIsSubmitting(true);
    const result = await login(email, password);

    if (result.success) {
      setLoginSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 800);
    } else {
      setIsSubmitting(false);
      setErrors({ global: result.message });
    }
  };

  const handleSocialLogin = (provider) => {
    alert(`Redirecting to ${provider === 'google' ? 'Google' : 'Microsoft'} OAuth login...`);
  };

  const Logo = () => (
    <div className="flex items-center gap-2.5 mb-8 select-none">
      <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-brandblue text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3M3 12l3-3m-3 3l-3-3" />
        </svg>
      </div>
      <span className="text-xl font-bold tracking-tight text-brandtext-primary">
        Asset<span className="text-brandblue font-extrabold">Flow</span>
      </span>
    </div>
  );

  return (
    <AuthLayout>
      <AuthCard>
        <Logo />
        
        <div className="mb-6 select-none">
          <h1 className="text-2xl font-bold text-brandtext-primary tracking-tight">
            Welcome Back
          </h1>
          <p className="text-sm text-brandtext-secondary mt-1.5 leading-relaxed">
            Sign in to manage your organization's assets efficiently.
          </p>
        </div>

        {loginSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm font-medium animate-fade-up flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Authentication successful! Redirecting...
          </div>
        )}

        {errors.global && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-600 text-sm font-medium animate-fade-up flex items-start gap-2.5">
            <svg className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="leading-snug">{errors.global}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <InputField
            label="Work Email"
            id="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors(prev => ({ ...prev, email: null }));
            }}
            placeholder="name@company.com"
            error={errors.email}
            required
          />

          <PasswordField
            label="Password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors(prev => ({ ...prev, password: null }));
            }}
            error={errors.password}
            required
          />

          <div className="flex items-center justify-between select-none">
            <label className="flex items-center gap-2.5 cursor-pointer text-sm font-medium text-brandtext-secondary hover:text-brandtext-primary transition-colors">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="
                  w-4 h-4 text-brandblue border-slate-300 rounded focus:ring-brandblue/20 
                  cursor-pointer transition-colors
                "
              />
              Remember Me
            </label>
            <a
              href="#forgot-password"
              onClick={(e) => {
                e.preventDefault();
                alert('Redirecting to password recovery center...');
              }}
              className="text-sm font-semibold text-brandblue hover:text-brandblue-hover link-underline"
            >
              Forgot Password?
            </a>
          </div>

          <PrimaryButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Signing In...
              </div>
            ) : (
              'Sign In'
            )}
          </PrimaryButton>
        </form>

        <Divider />

        <div className="grid grid-cols-2 gap-3.5">
          <SocialButton provider="google" onClick={() => handleSocialLogin('google')}>
            Google
          </SocialButton>
          <SocialButton provider="microsoft" onClick={() => handleSocialLogin('microsoft')}>
            Microsoft
          </SocialButton>
        </div>

        <div className="mt-8 text-center select-none text-sm text-brandtext-secondary">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="font-semibold text-brandblue hover:text-brandblue-hover link-underline focus:outline-none"
          >
            Register
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
  );
};

export default Login;
