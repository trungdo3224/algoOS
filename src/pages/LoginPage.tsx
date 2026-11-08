import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, Brain, Sparkles, ArrowLeft } from 'lucide-react';
import Button from '../components/ui/Button';
import SignUpForm from '../components/auth/SignUpForm';
import { useAppDispatch, useAppSelector } from '../hooks/reduxHooks';
import { login, loginAsDemo } from '../features/user/userSlice';
import { navigateTo } from '../utils/navigation';

const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.user);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  
  // Determine if we should show sign-up or sign-in based on URL
  const currentPath = window.location.pathname;
  const [isSignUp, setIsSignUp] = useState(currentPath === '/signup');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password');
      return;
    }
    
    try {
      await dispatch(login({ email, password })).unwrap();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      if (errorMessage?.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else if (errorMessage?.includes('Email not confirmed')) {
        setError('Please confirm your email address before logging in.');
      } else {
        setError(errorMessage || 'An error occurred during login. Please try again.');
      }
    }
  };

  const handleToggleMode = (showSignUp: boolean) => {
    setIsSignUp(showSignUp);
    const newPath = showSignUp ? '/signup' : '/signin';
    navigateTo(newPath);
  };
  
  return (
    <div className="min-h-screen bg-zinc-50/70 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <button 
          type="button"
          onClick={() => navigateTo('/')}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Home</span>
        </button>

        <div className="flex justify-center mb-3">
          <div className="h-10 w-10 bg-zinc-950 rounded-xl flex items-center justify-center text-white shadow-sm">
            <Brain className="h-6 w-6" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-950">
          AlgoMind // algoOS
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          {isSignUp ? 'Create an account to start your cognitive journey' : 'Sign in to access your engineering workbench'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 border border-zinc-200/90 rounded-2xl shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
          {isSignUp ? (
            <SignUpForm
              onSuccess={() => setIsSignUp(false)}
              onLoginClick={() => handleToggleMode(false)}
            />
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-3.5 py-2.5 rounded-lg text-xs font-medium">
                  {error}
                </div>
              )}
              
              <div>
                <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-zinc-50/50 hover:bg-white border border-zinc-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-900"
                  placeholder="engineer@company.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-zinc-600 mb-1">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-zinc-50/50 hover:bg-white border border-zinc-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:bg-white transition-all text-zinc-900 pr-10"
                    placeholder="••••••••"
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
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center text-zinc-600 cursor-pointer">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-3.5 w-3.5 text-zinc-900 focus:ring-zinc-900 border-zinc-300 rounded"
                  />
                  <span className="ml-2">Remember session</span>
                </label>

                <a href="#" className="font-medium text-zinc-600 hover:text-zinc-950">
                  Forgot password?
                </a>
              </div>

              <div className="pt-2">
                <Button
                  type="submit"
                  className="w-full justify-center"
                  isLoading={loading}
                  leftIcon={<LogIn className="h-4 w-4" />}
                >
                  Sign in
                </Button>
              </div>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="px-2 bg-white text-zinc-400 font-semibold tracking-wider">Instant Access</span>
                </div>
              </div>

              <div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-center border-zinc-300 text-zinc-800 hover:bg-zinc-50 font-medium"
                  onClick={() => {
                    dispatch(loginAsDemo());
                    window.history.pushState(null, '', '/dashboard');
                  }}
                  leftIcon={<Sparkles className="h-4 w-4 text-amber-500" />}
                >
                  Explore with Demo Account
                </Button>
              </div>

              <div className="pt-4 text-center">
                <p className="text-xs text-zinc-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleToggleMode(true)}
                    className="font-semibold text-zinc-950 hover:underline"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginPage;