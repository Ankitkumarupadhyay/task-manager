import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { getErrorMessage } from '@/services/api';
import { Zap, Lock, Mail, ArrowRight } from 'lucide-react';

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (values: FormValues) => {
    setAuthError('');
    try {
      await login(values.email, values.password);
      navigate('/dashboard');
    } catch (error) {
      setAuthError(getErrorMessage(error));
    }
  };

  const fillDemo = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
    setAuthError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-brand-600 rounded-2xl shadow-lg mb-4">
            <Zap className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">TaskFlow</h1>
          <p className="text-sm text-gray-500 mt-1">Internal Team Management Dashboard</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to access your workspace</p>
          </div>

          {authError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg animate-fade-in">
              <p className="text-sm text-red-700 font-medium">{authError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              autoComplete="email"
              id="login-email"
              {...register('email')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              autoComplete="current-password"
              id="login-password"
              {...register('password')}
            />

            <Button type="submit" variant="primary" className="w-full mt-2" size="lg" isLoading={isSubmitting}>
              Sign in
            </Button>
          </form>

          {/* Quick-fill demo credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">
              Click to autofill demo account
            </p>
            <div className="space-y-1.5">
              {[
                { role: 'Admin (Ankit)', email: 'ankitupadhyay0811@gmail.com' },
              ].map(({ role, email }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillDemo(email)}
                  className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-gray-200 hover:border-brand-500 hover:bg-brand-50/50 transition-all text-xs group"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-700">{role}:</span>
                    <span className="font-mono text-gray-500">{email}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-brand-600 transition-colors" />
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-2.5 text-center">Password for all accounts: <span className="font-mono font-medium text-gray-600">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
