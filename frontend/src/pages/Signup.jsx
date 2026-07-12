import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/auth/AuthLayout';
import AuthCard from '../components/auth/AuthCard';
import InputField from '../components/auth/InputField';
import PasswordField from '../components/auth/PasswordField';
import PrimaryButton from '../components/auth/PrimaryButton';

const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  // Dynamic Password Strength Calculator
  const passwordStrength = useMemo(() => {
    if (!password) return { score: 0, text: '', color: 'bg-slate-200' };
    
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    let text = '';
    let color = '';
    switch (score) {
      case 1:
        text = 'Very Weak';
        color = 'bg-red-500';
        break;
      case 2:
        text = 'Weak';
        color = 'bg-amber-500';
        break;
      case 3:
        text = 'Fair';
        color = 'bg-blue-400';
        break;
      case 4:
        text = 'Strong';
        color = 'bg-brandblue';
        break;
      case 5:
        text = 'Excellent';
        color = 'bg-emerald-500';
        break;
      default:
        text = 'Invalid';
        color = 'bg-slate-200';
    }

    return { score, text, color };
  }, [password]);

  const validate = () => {
    const tempErrors = {};
    if (!name.trim()) tempErrors.name = 'Full name is required.';
    
    if (!email) {
      tempErrors.email = 'Work email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Please enter a valid email address.';
    }
    
    if (!company.trim()) tempErrors.company = 'Company name is required.';
    if (!department.trim()) tempErrors.department = 'Department name is required.';
    if (!employeeId.trim()) tempErrors.employeeId = 'Employee ID is required.';
    
    if (!password) {
      tempErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters.';
    }

    if (!confirmPassword) {
      tempErrors.confirmPassword = 'Confirmation is required.';
    } else if (password !== confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match.';
    }

    if (!agreeTerms) {
      tempErrors.terms = 'You must accept the Terms and Conditions to proceed.';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Call their auth context signup passing fields supported by DB
    const result = await signup(name, email, password);

    if (result.success) {
      setRegisterSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 800);
    } else {
      setIsSubmitting(false);
      setErrors({ global: result.message });
    }
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
      <AuthCard className="max-w-[540px]">
        <Logo />

        <div className="mb-6 select-none">
          <h1 className="text-2xl font-bold text-brandtext-primary tracking-tight">
            Create Your AssetFlow Account
          </h1>
          <p className="text-sm text-brandtext-secondary mt-1.5 leading-relaxed">
            Get started with enterprise-grade asset and resource management.
          </p>
        </div>

        {registerSuccess && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm font-medium animate-fade-up flex items-center gap-2">
            <svg className="w-5 h-5 flex-shrink-0 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Account registered successfully! Redirecting...
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

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Row 1: Name & Work Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors(prev => ({ ...prev, name: null }));
              }}
              placeholder="John Doe"
              error={errors.name}
              required
            />

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
          </div>

          {/* Row 2: Company Name & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Company Name"
              id="company"
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                if (errors.company) setErrors(prev => ({ ...prev, company: null }));
              }}
              placeholder="ACME Corp"
              error={errors.company}
              required
            />

            <InputField
              label="Department"
              id="department"
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                if (errors.department) setErrors(prev => ({ ...prev, department: null }));
              }}
              placeholder="Operations"
              error={errors.department}
              required
            />
          </div>

          {/* Row 3: Employee ID & Blank Spacer (as split-layout decoration) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="Employee ID"
              id="employeeId"
              value={employeeId}
              onChange={(e) => {
                setEmployeeId(e.target.value);
                if (errors.employeeId) setErrors(prev => ({ ...prev, employeeId: null }));
              }}
              placeholder="EMP-8472"
              error={errors.employeeId}
              required
            />
            <div className="hidden sm:block"></div> {/* Spacer */}
          </div>

          {/* Row 4: Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
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
              {/* Password Strength Meter */}
              {password && (
                <div className="mt-2.5 space-y-1 animate-fade-up">
                  <div className="flex justify-between items-center text-[10px] uppercase tracking-wider font-semibold text-brandtext-secondary">
                    <span>Strength:</span>
                    <span className={`${passwordStrength.score >= 4 ? 'text-emerald-500' : passwordStrength.score >= 2 ? 'text-amber-500' : 'text-red-500'}`}>
                      {passwordStrength.text}
                    </span>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`flex-1 h-full rounded transition-all duration-300 ${
                          level <= passwordStrength.score ? passwordStrength.color : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <PasswordField
              label="Confirm Password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: null }));
              }}
              placeholder="••••••••"
              error={errors.confirmPassword}
              required
            />
          </div>

          {/* Accept terms checkbox */}
          <div className="pt-2 select-none">
            <label className="flex items-start gap-2.5 cursor-pointer text-sm font-medium text-brandtext-secondary hover:text-brandtext-primary transition-colors">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => {
                  setAgreeTerms(e.target.checked);
                  if (errors.terms) setErrors(prev => ({ ...prev, terms: null }));
                }}
                className="
                  mt-0.5 w-4 h-4 text-brandblue border-slate-300 rounded focus:ring-brandblue/20 
                  cursor-pointer transition-colors
                "
              />
              <span>
                I accept the{' '}
                <a
                  href="#terms"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Opening Terms of Service...');
                  }}
                  className="font-semibold text-brandblue hover:text-brandblue-hover link-underline"
                >
                  Terms & Conditions
                </a>{' '}
                and{' '}
                <a
                  href="#privacy"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Opening Privacy Policy...');
                  }}
                  className="font-semibold text-brandblue hover:text-brandblue-hover link-underline"
                >
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.terms && (
              <p className="text-xs text-red-500 font-medium mt-1 animate-fade-up" aria-live="polite">
                {errors.terms}
              </p>
            )}
          </div>

          {/* Create Account Primary CTA */}
          <div className="pt-2">
            <PrimaryButton type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </PrimaryButton>
          </div>
        </form>

        <div className="mt-8 text-center select-none text-sm text-brandtext-secondary">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-brandblue hover:text-brandblue-hover link-underline focus:outline-none"
          >
            Sign In
          </Link>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};

export default Signup;
