import React, { useState } from 'react';
import { Eye, EyeOff, UserPlus, AlertCircle } from 'lucide-react';
import Button from '../ui/Button';
import { useAppDispatch, useAppSelector } from '../../hooks/reduxHooks';
import { signup } from '../../features/user/userSlice';

interface SignUpFormProps {
  onSuccess?: () => void;
  onLoginClick: () => void;
}

const SignUpForm: React.FC<SignUpFormProps> = ({ onSuccess, onLoginClick }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.user);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const validateEmail = (emailStr: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(emailStr);
  };

  const validatePassword = (pwd: string) => {
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasNumbers = /\d/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);
    const isLongEnough = pwd.length >= 8;

    if (!isLongEnough) return 'Password must be at least 8 characters long';
    if (!hasUpperCase) return 'Password must contain at least one uppercase letter';
    if (!hasLowerCase) return 'Password must contain at least one lowercase letter';
    if (!hasNumbers) return 'Password must contain at least one number';
    if (!hasSpecialChar) return 'Password must contain at least one special character';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim() || name.length < 2) {
      setError('Name must be at least 2 characters long');
      return;
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await dispatch(signup({ email, password, name })).unwrap();
      onSuccess?.();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || 'An error occurred during sign up');
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold tracking-tight text-zinc-950">Create an Account</h3>
        <p className="mt-1 text-xs text-zinc-500">
          Join AlgoMind to access structured Socratic coaching
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-lg text-xs font-medium flex items-start">
            <AlertCircle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-zinc-50/50 hover:bg-white border border-zinc-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-900"
            placeholder="Jane Doe"
            maxLength={50}
            required
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-zinc-50/50 hover:bg-white border border-zinc-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-900"
            placeholder="jane@company.com"
            maxLength={100}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 pr-10 text-sm bg-zinc-50/50 hover:bg-white border border-zinc-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-900"
              placeholder="••••••••"
              maxLength={100}
              required
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-400 hover:text-zinc-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          <p className="mt-1 text-[11px] text-zinc-500">
            Min. 8 chars with uppercase, lowercase, number & symbol
          </p>
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm bg-zinc-50/50 hover:bg-white border border-zinc-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-900"
            placeholder="••••••••"
            maxLength={100}
            required
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            className="w-full justify-center"
            isLoading={loading}
            leftIcon={<UserPlus className="h-4 w-4" />}
          >
            Create Account
          </Button>
        </div>

        <div className="pt-3 text-center">
          <p className="text-xs text-zinc-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={onLoginClick}
              className="font-semibold text-zinc-950 hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUpForm;